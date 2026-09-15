import json,subprocess,sys,threading,uuid
from pathlib import Path
from fastapi import FastAPI,HTTPException,Request
from fastapi.responses import JSONResponse
from .specs import WorldSpec,MissionRequest,ROBOTS,StrictModel
from .fixtures import WORLDS
from .geometry import report_world
from .planner import plan
app=FastAPI(title='WorldForge local simulator',version='0.1.0')
ROOT=Path(__file__).resolve().parents[2]
RUN_LOCK=threading.Lock()
class ValidationRequest(StrictModel):
    world:WorldSpec
    robot_id:str='boxer'
def robot(id):
    if id not in ROBOTS:raise HTTPException(422,'Choose RB-THERON or Boxer.')
    return ROBOTS[id]
@app.middleware('http')
async def local_only(request:Request,call_next):
    if request.headers.get('origin') and request.headers['origin'] not in ['http://127.0.0.1:3000','http://localhost:3000']:
        return JSONResponse(status_code=403,content={'detail':'Local application requests only.'})
    if int(request.headers.get('content-length','0'))>1_000_000:
        return JSONResponse(status_code=413,content={'detail':'World files must be under 1 MB.'})
    return await call_next(request)
@app.get('/api/health')
def health():return {'status':'ok','mode':'local','engine':'MuJoCo'}
@app.get('/api/worlds')
def worlds():return [w.model_dump() for w in WORLDS.values()]
@app.get('/api/robots')
def robots():return [r.model_dump() for r in ROBOTS.values()]
@app.get('/api/schema')
def schema():return WorldSpec.model_json_schema()
@app.post('/api/validate')
def validate(req:ValidationRequest):
    report,grid=report_world(req.world,robot(req.robot_id))
    return {'world':req.world.model_dump(),'report':report.model_dump(),'grid':grid.overlay() if grid else None}
@app.post('/api/plan')
def planning(req:MissionRequest):
    report,grid=report_world(req.world,robot(req.robot_id))
    if not report.valid:return {'status':'INVALID_WORLD','message':'; '.join(report.errors),'path':[]}
    return plan(grid,req.start,req.goal)
@app.post('/api/run')
def run(req:MissionRequest):
    robot(req.robot_id)
    if not RUN_LOCK.acquire(blocking=False):raise HTTPException(409,'A local simulation is already running.')
    try:
        completed=subprocess.run([sys.executable,'-m','astra.worker'],input=req.model_dump_json(),
            capture_output=True,text=True,cwd=ROOT/'server',timeout=25)
        if completed.returncode:
            raise HTTPException(500,'The isolated physics worker failed. Check the local server terminal.')
        result=json.loads(completed.stdout)
        if result['status'] in ['SUCCESS','COLLISION','TIMEOUT','SIM_ERROR']:
            run_id=uuid.uuid4().hex;folder=ROOT/'artifacts'/'runs'/run_id;folder.mkdir(parents=True)
            (folder/'result.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
            (folder/'scene.xml').write_text(result['mjcf'],encoding='utf-8')
            result['run_id']=run_id
        return result
    except subprocess.TimeoutExpired:
        return {'status':'WORKER_TIMEOUT','message':'Physics exceeded the 25-second wall-clock limit. The worker was stopped.'}
    finally:RUN_LOCK.release()
