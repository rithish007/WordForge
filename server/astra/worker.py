import json,sys
from .specs import MissionRequest, ROBOTS
from .geometry import report_world
from .planner import plan
from .simulator import simulate
if __name__=='__main__':
    mission=MissionRequest.model_validate_json(sys.stdin.read());robot=ROBOTS[mission.robot_id]
    report,grid=report_world(mission.world,robot)
    if not report.valid:result=dict(status='INVALID_WORLD',message='; '.join(report.errors))
    else:
        route=plan(grid,mission.start,mission.goal)
        result=simulate(mission,robot,route) if route['status']=='SUCCESS' else route
    print(json.dumps(result,allow_nan=False))
