import math, hashlib, json
import xml.etree.ElementTree as ET
import mujoco
import numpy as np
from .conventions import PHYSICS_DT, CONTROL_STEPS, TELEMETRY_STEPS, GOAL_TOLERANCE, WALL_THICKNESS
from .geometry import clearance
ENGINE_VERSION='planar-mujoco-1'
CONTROLLER_VERSION='pure-pursuit-1'

def mjcf(world,robot):
    root=ET.Element('mujoco',model=world.id)
    ET.SubElement(root,'compiler',angle='radian')
    ET.SubElement(root,'option',timestep=str(PHYSICS_DT),integrator='implicitfast',gravity='0 0 -9.81')
    wb=ET.SubElement(root,'worldbody')
    ET.SubElement(wb,'geom',name='floor',type='plane',size='0 0 .1',group='0',contype='1',conaffinity='2')
    def box(parent,name,pos,size,yaw=0,blocking=True,group=1,mass=None):
        attrs=dict(name=name,type='box',pos=' '.join(map(str,pos)),size=' '.join(map(str,size)),
            euler=f'0 0 {yaw}',group=str(group),contype='1' if blocking else '0',
            conaffinity='2' if blocking else '0',friction='.8 .005 .0001')
        if mass is not None:attrs.update(mass=str(mass),contype='2',conaffinity='1')
        ET.SubElement(parent,'geom',**attrs)
    w,l=world.bounds.width/2,world.bounds.length/2;t=WALL_THICKNESS
    for name,pos,size in [
        ('wall_west',[-w-t/2,0,.5],[t/2,l+t,.5]),('wall_east',[w+t/2,0,.5],[t/2,l+t,.5]),
        ('wall_south',[0,-l-t/2,.5],[w,t/2,.5]),('wall_north',[0,l+t/2,.5],[w,t/2,.5])]:
        box(wb,name,pos,size)
    for o in world.objects:
        box(wb,o.id,[*o.center,o.height/2],[o.footprint[0]/2,o.footprint[1]/2,o.height/2],
            math.radians(o.yaw_deg),o.blocking)
    body=ET.SubElement(wb,'body',name='robot',pos=f'0 0 {robot.height/2+.002}')
    for name,kind,axis in [('slide_x','slide','1 0 0'),('slide_y','slide','0 1 0'),('hinge_z','hinge','0 0 1')]:
        ET.SubElement(body,'joint',name=name,type=kind,axis=axis,damping='0')
    box(body,'robot_body',[0,0,0],[robot.footprint[0]/2,robot.footprint[1]/2,robot.height/2],
        group=2,mass=robot.mass)
    actuator=ET.SubElement(root,'actuator')
    inertia=robot.mass*(robot.footprint[0]**2+robot.footprint[1]**2)/12
    for joint,kv,limit in [('slide_x',robot.mass*30,robot.max_linear_velocity),
                            ('slide_y',robot.mass*30,robot.max_linear_velocity),
                            ('hinge_z',inertia*30,robot.max_angular_velocity)]:
        ET.SubElement(actuator,'velocity',joint=joint,kv=str(kv),ctrllimited='true',ctrlrange=f'{-limit} {limit}')
    return ET.tostring(root,encoding='unicode')

def simulate(mission,robot,route):
    xml=mjcf(mission.world,robot)
    model=mujoco.MjModel.from_xml_string(xml);data=mujoco.MjData(model)
    data.qpos[:]=[*mission.start,math.radians(mission.start_yaw_deg)]
    mujoco.mj_forward(model,data)
    path=np.array(route['path']); target_idx=0; frames=[];events=[]
    distance=0.;minimum=math.inf;old=data.qpos[:2].copy()
    status='TIMEOUT';message='The robot did not finish within the simulation time limit.'
    stopping=False
    def record():
        frames.append(dict(t=round(float(data.time),6),pose=data.qpos.tolist(),
            speed=float(np.linalg.norm(data.qvel[:2])),angular_velocity=float(data.qvel[2])))
    record()
    for step in range(round(mission.time_limit_s/PHYSICS_DT)):
        x,y,yaw=data.qpos;goal_dist=math.hypot(x-mission.goal[0],y-mission.goal[1])
        if step%CONTROL_STEPS==0:
            stopping=stopping or goal_dist<=GOAL_TOLERANCE
            if stopping:
                data.ctrl[:]=0
                if np.linalg.norm(data.qvel[:2])<.05 and abs(data.qvel[2])<.05:
                    status='SUCCESS';message='Reached the goal and stopped.';break
            else:
                nearest=int(np.argmin(np.linalg.norm(path[target_idx:]-[x,y],axis=1)))+target_idx
                target_idx=max(target_idx,nearest)
                ahead=target_idx
                while ahead<len(path)-1 and np.linalg.norm(path[ahead]-[x,y])<.65:ahead+=1
                dx,dy=path[ahead]-[x,y]
                alpha=math.atan2(math.sin(math.atan2(dy,dx)-yaw),math.cos(math.atan2(dy,dx)-yaw))
                speed=min(robot.max_linear_velocity,.85,max(.08,goal_dist*.7))
                speed*=max(0,math.cos(alpha))**3
                # Turn in place for targets behind the vehicle.
                if abs(alpha)>1.:speed=0.
                omega=max(-robot.max_angular_velocity,min(robot.max_angular_velocity,
                    (2*speed*math.sin(alpha)/max(.2,math.hypot(dx,dy))) if speed>.01 else 2*alpha))
                data.ctrl[:]=[speed*math.cos(yaw),speed*math.sin(yaw),omega]
        mujoco.mj_step(model,data)
        if not np.isfinite(data.qpos).all():status='SIM_ERROR';message='Physics returned a non-finite state.';break
        distance+=float(np.linalg.norm(data.qpos[:2]-old));old=data.qpos[:2].copy()
        if step%CONTROL_STEPS==0:minimum=min(minimum,clearance(mission.world,robot,data.qpos))
        collision=False
        for i in range(data.ncon):
            contact=data.contact[i];roles={int(model.geom_group[contact.geom1]),int(model.geom_group[contact.geom2])}
            if roles!={1,2}:continue
            force=np.zeros(6);mujoco.mj_contactForce(model,data,i,force)
            if force[0]>1:
                other=contact.geom1 if model.geom_group[contact.geom1]==1 else contact.geom2
                events.append(dict(t=float(data.time),object_id=mujoco.mj_id2name(model,mujoco.mjtObj.mjOBJ_GEOM,other),
                    normal_force_n=float(force[0])))
                collision=True
        if collision:status='COLLISION';message='The robot contacted an obstacle or wall; execution stopped.';break
        if (step+1)%TELEMETRY_STEPS==0:record()
    if frames[-1]['t']!=round(float(data.time),6):record()
    result=dict(status=status,message=message,mode='Planar MuJoCo physics',frames=frames,collision_events=events,
        metrics=dict(simulation_time_s=float(data.time),distance_m=distance,collision_count=len(events),
            minimum_clearance_m=minimum if math.isfinite(minimum) else clearance(mission.world,robot,data.qpos),
            goal_error_m=math.dist(data.qpos[:2],mission.goal),final_speed_m_s=float(np.linalg.norm(data.qvel[:2])),
            planned_path_length_m=route['planned_path_length_m']),
        provenance=dict(engine=ENGINE_VERSION,mujoco=mujoco.__version__,controller=CONTROLLER_VERSION,
            seed=mission.seed,physics_hz=500,control_hz=50,telemetry_hz=20,
            model='Planar body with velocity servos; not wheel dynamics',clearance='Conservative circumscribed-circle clearance',
            angular_velocity='Simulation estimate: 1 rad/s'),mission=mission.model_dump(),robot=robot.model_dump(),path=route['path'],mjcf=xml)
    result['deterministic_hash']=hashlib.sha256(json.dumps(result,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    return result
