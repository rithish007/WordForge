import heapq, math
import numpy as np

def plan(grid,start,goal):
    begin,end=grid.cell(start),grid.cell(goal)
    if not grid.free(begin) or not grid.free(end):
        return {'status':'INVALID_MISSION','message':'Start or goal is outside the warehouse or inside the robot clearance envelope. Move the point into free space.','path':[]}
    if grid.labels[begin]!=grid.labels[end]:
        return {'status':'PLAN_FAILED','message':'No reachable route connects these points. Remove the blocking barrier or widen the passage.','path':[]}
    frontier=[(0.,0.,begin)]; previous={}; costs={begin:0.}; visited=set()
    offsets=[(-1,0),(0,-1),(0,1),(1,0),(-1,-1),(-1,1),(1,-1),(1,1)]
    while frontier:
        _,g,current=heapq.heappop(frontier)
        if current in visited:continue
        if current==end:break
        visited.add(current)
        for dy,dx in offsets:
            nxt=(current[0]+dy,current[1]+dx)
            if not grid.free(nxt):continue
            if dy and dx and (not grid.free((current[0]+dy,current[1])) or not grid.free((current[0],current[1]+dx))):continue
            candidate=g+math.hypot(dx,dy)
            if candidate<costs.get(nxt,math.inf):
                costs[nxt]=candidate;previous[nxt]=current
                heapq.heappush(frontier,(candidate+math.dist(nxt,end),candidate,nxt))
    else:return {'status':'PLAN_FAILED','message':'No collision-free route was found.','path':[]}
    cells=[end]
    while cells[-1]!=begin:cells.append(previous[cells[-1]])
    points=[list(start)]+[grid.position(c) for c in reversed(cells)]+[list(goal)]
    shortcut=[points[0]];i=0
    while i<len(points)-1:
        j=len(points)-1
        while j>i+1 and not grid.line_free(points[i],points[j]):j-=1
        shortcut.append(points[j]);i=j
    safe=shortcut
    for _ in range(2):
        smoothed=[safe[0]]
        for a,b in zip(safe,safe[1:]):
            smoothed.extend([[.75*a[0]+.25*b[0],.75*a[1]+.25*b[1]],[.25*a[0]+.75*b[0],.25*a[1]+.75*b[1]]])
        smoothed.append(safe[-1])
        if all(grid.line_free(a,b) for a,b in zip(smoothed,smoothed[1:])):safe=smoothed
    path=[safe[0]]
    for a,b in zip(safe,safe[1:]):
        for t in np.linspace(0,1,max(1,math.ceil(math.dist(a,b)/.25))+1)[1:]:
            path.append([float(a[0]+(b[0]-a[0])*t),float(a[1]+(b[1]-a[1])*t)])
    return {'status':'SUCCESS','message':'A collision-free route is ready.','path':path,
        'planned_path_length_m':sum(math.dist(a,b) for a,b in zip(path,path[1:])),'expanded_cells':len(visited)}
