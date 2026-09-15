import math
import numpy as np
import mujoco
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError
from astra.specs import WorldSpec,WorldObject,MissionRequest,ROBOTS
from astra.fixtures import WORLDS
from astra.geometry import report_world,corners
from astra.planner import plan
from astra.simulator import simulate,mjcf
from astra.main import app
client=TestClient(app)

@pytest.mark.parametrize('world_id',['crossdock','angled_depot'])
@pytest.mark.parametrize('robot_id',list(ROBOTS))
def test_real_missions(world_id,robot_id):
    world=WORLDS[world_id];robot=ROBOTS[robot_id]
    report,grid=report_world(world,robot)
    assert report.valid and report.navigable
    req=MissionRequest(world=world,robot_id=robot_id,start=(-8,-6),goal=(8,6),start_yaw_deg=180)
    route=plan(grid,req.start,req.goal)
    assert route['status']=='SUCCESS'
    assert all(grid.line_free(a,b) for a,b in zip(route['path'],route['path'][1:]))
    result=simulate(req,robot,route)
    assert result['status']=='SUCCESS',result['metrics']
    assert result['metrics']['collision_count']==0
    assert result['metrics']['goal_error_m']<=.25
    assert result['metrics']['final_speed_m_s']<.05
    assert result['metrics']['minimum_clearance_m']>0
    assert result['frames'][0]['pose']==[-8,-6,math.pi]
    assert np.allclose(np.diff([f['t'] for f in result['frames']][:-1]),.05)

def test_determinism():
    w=WORLDS['crossdock'];r=ROBOTS['rb_theron'];_,g=report_world(w,r)
    m=MissionRequest(world=w,start=(-8,-6),goal=(8,6))
    route=plan(g,m.start,m.goal)
    assert simulate(m,r,route)['deterministic_hash']==simulate(m,r,route)['deterministic_hash']

def test_blocked_route_and_atomic_invalid():
    w=WORLDS['sealed_crossdock'];r=ROBOTS['boxer']
    report,g=report_world(w,r)
    assert report.valid and not report.navigable
    assert plan(g,(-8,-6),(8,6))['status']=='PLAN_FAILED'
    original=WORLDS['crossdock'].model_dump_json()
    broken=WORLDS['crossdock'].model_copy(deep=True);broken.objects[0].center=(100,100)
    response=client.post('/api/validate',json={'world':broken.model_dump()})
    assert response.status_code==200 and not response.json()['report']['valid']
    assert WORLDS['crossdock'].model_dump_json()==original

def test_mjcf_rotated_geometry_parity():
    w=WORLDS['angled_depot'];r=ROBOTS['boxer']
    model=mujoco.MjModel.from_xml_string(mjcf(w,r));data=mujoco.MjData(model);mujoco.mj_forward(model,data)
    for obj in w.objects:
        idx=mujoco.mj_name2id(model,mujoco.mjtObj.mjOBJ_GEOM,obj.id)
        transform=data.geom_xmat[idx].reshape(3,3);center=data.geom_xpos[idx]
        hx,hy=model.geom_size[idx][:2]
        actual=[(center+transform@np.array([x,y,0]))[:2] for x,y in [(-hx,-hy),(hx,-hy),(hx,hy),(-hx,hy)]]
        assert np.allclose(actual,corners(obj.center,obj.footprint,obj.yaw_deg))
        assert model.geom_contype[idx]==(1 if obj.blocking else 0)
    assert np.allclose(model.opt.timestep,.002)

def test_reject_bad_specs_and_boundary_mission():
    obj=WORLDS['crossdock'].model_dump();obj['objects'].append(obj['objects'][0].copy())
    with pytest.raises(ValidationError):WorldSpec.model_validate(obj)
    obj=WORLDS['crossdock'].model_dump();obj['objects'][0]['center']=(math.nan,0)
    with pytest.raises(ValidationError):WorldSpec.model_validate(obj)
    _,g=report_world(WORLDS['crossdock'],ROBOTS['boxer'])
    assert plan(g,(10,0),(0,0))['status']=='INVALID_MISSION'
    assert client.post('/api/plan',json={'world':WORLDS['crossdock'].model_dump(),'robot_id':'unknown','start':[-8,-6],'goal':[8,6]}).status_code==422

def test_physics_contact_is_detected():
    w=WORLDS['crossdock'];r=ROBOTS['rb_theron']
    # Deliberately bypass planning to exercise contact classification, through a rack.
    m=MissionRequest(world=w,start=(-8,-4),goal=(0,-4))
    route={'path':[[float(x),-4] for x in np.linspace(-8,0,33)],'planned_path_length_m':8}
    result=simulate(m,r,route)
    assert result['status']=='COLLISION'
    assert result['collision_events'][0]['object_id']=='rack_west_south'

def test_isolated_worker_and_local_origin():
    payload={'world':WORLDS['crossdock'].model_dump(),'start':[-8,-6],'goal':[8,6],'time_limit_s':1}
    response=client.post('/api/run',json=payload)
    assert response.status_code==200 and response.json()['status']=='TIMEOUT'
    assert response.json()['run_id']
    assert client.post('/api/validate',json={'world':payload['world']},headers={'origin':'https://unrelated.example'}).status_code==403


def test_real_three_meshes_match_physics_geometry():
    import subprocess,json
    from pathlib import Path
    root=Path(__file__).resolve().parents[2]
    output=subprocess.check_output(['node','web/tests/export-scene.mjs','examples/angled_depot.json'],cwd=root,text=True)
    meshes=json.loads(output);w=WORLDS['angled_depot']
    model=mujoco.MjModel.from_xml_string(mjcf(w,ROBOTS['boxer']))
    data=mujoco.MjData(model);mujoco.mj_forward(model,data)
    assert np.allclose(meshes.pop('pointer_roundtrip'),[3,-2,0])
    for name,vertices in meshes.items():
        index=mujoco.mj_name2id(model,mujoco.mjtObj.mjOBJ_GEOM,name)
        rotation=data.geom_xmat[index].reshape(3,3)
        local=(np.array(vertices)-data.geom_xpos[index])@rotation
        assert np.allclose(np.abs(local),model.geom_size[index],atol=1e-6),name

def test_import_canonicalizes_defaults():
    minimal={'id':'minimal','name':'Minimal','bounds':{'width':10,'length':10}}
    response=client.post('/api/validate',json={'world':minimal})
    assert response.status_code==200
    data=response.json()
    assert data['report']['valid']
    assert data['world']['grid']['resolution']==.1
    assert data['world']['objects']==[]
