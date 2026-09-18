import math
import numpy as np
from scipy import ndimage
from .specs import WorldSpec, RobotSpec, WorldReport
from .conventions import OVERLAP_TOLERANCE

def corners(center, footprint, yaw_deg):
    angle = math.radians(yaw_deg)
    c, s = math.cos(angle), math.sin(angle)
    return [(center[0]+c*x-s*y, center[1]+s*x+c*y)
        for x,y in [(-footprint[0]/2,-footprint[1]/2),(footprint[0]/2,-footprint[1]/2),
                    (footprint[0]/2,footprint[1]/2),(-footprint[0]/2,footprint[1]/2)]]

def overlaps(a, b):
    # SAT detects penetration of oriented boxes; touching and <=1 cm overlap pass.
    for poly in [a,b]:
        for i in (0,1):
            edge = np.subtract(poly[i+1],poly[i]); axis = np.array([-edge[1],edge[0]])
            axis /= np.linalg.norm(axis)
            pa, pb = np.dot(a,axis), np.dot(b,axis)
            if min(max(pa),max(pb))-max(min(pa),min(pb)) <= OVERLAP_TOLERANCE:
                return False
    return True

def structural_errors(world):
    errors=[]; polygons=[]
    for obj in world.objects:
        poly=corners(obj.center,obj.footprint,obj.yaw_deg)
        if any(abs(x)>world.bounds.width/2+1e-8 or abs(y)>world.bounds.length/2+1e-8 for x,y in poly):
            errors.append(f'{obj.label} extends beyond the warehouse bounds.')
        if obj.height > world.bounds.height:
            errors.append(f'{obj.label} is taller than the warehouse.')
        if obj.blocking:
            polygons.append((obj,poly))
    for i,(obj,a) in enumerate(polygons):
        for other,b in polygons[i+1:]:
            if overlaps(a,b): errors.append(f'{obj.label} overlaps {other.label}.')
    for zone in world.zones:
        if any(abs(x)>world.bounds.width/2+1e-8 or abs(y)>world.bounds.length/2+1e-8
               for x,y in corners(zone.center,zone.extent,zone.yaw_deg)):
            errors.append(f'{zone.label} extends beyond the warehouse bounds.')
    return errors[:30]

class OccupancyGrid:
    def __init__(self,world,robot):
        self.world=world; self.res=world.grid.resolution
        self.xmin=-world.bounds.width/2; self.ymin=-world.bounds.length/2
        self.nx=math.ceil(world.bounds.width/self.res); self.ny=math.ceil(world.bounds.length/self.res)
        self.x=self.xmin+(np.arange(self.nx)+.5)*self.res
        self.y=self.ymin+(np.arange(self.ny)+.5)*self.res
        xx,yy=np.meshgrid(self.x,self.y)
        raw=np.zeros((self.ny,self.nx),dtype=bool)
        for o in world.objects:
            if not o.blocking: continue
            a=math.radians(o.yaw_deg); c,s=math.cos(a),math.sin(a)
            dx,dy=xx-o.center[0],yy-o.center[1]
            hx,hy=o.footprint[0]/2,o.footprint[1]/2
            cellproj=self.res/2*(abs(c)+abs(s))
            raw |= ((abs(dx*c+dy*s)<=hx+cellproj) & (abs(-dx*s+dy*c)<=hy+cellproj)
                & (abs(dx)<=abs(c)*hx+abs(s)*hy+self.res/2)
                & (abs(dy)<=abs(s)*hx+abs(c)*hy+self.res/2))
        self.raw=raw
        radius=robot.collision_radius+robot.safety_margin
        self.inflation_radius=radius
        cells=math.ceil(radius/self.res)
        # Distance transform yields circular cell dilation without a huge kernel.
        dist=ndimage.distance_transform_edt(~raw) if raw.any() else np.full(raw.shape,np.inf)
        self.occupied=dist<=cells
        wall_clearance=np.minimum.reduce([xx-self.xmin,world.bounds.width/2-xx,yy-self.ymin,world.bounds.length/2-yy])
        self.occupied |= wall_clearance <= radius+self.res/2
        self.labels,self.components=ndimage.label(~self.occupied) # 4-connected, conservative
        self.distance=np.minimum(dist*self.res,wall_clearance)

    def cell(self,point):
        return (math.floor((point[1]-self.ymin)/self.res), math.floor((point[0]-self.xmin)/self.res))
    def inside(self,cell): return 0<=cell[0]<self.ny and 0<=cell[1]<self.nx
    def free(self,cell): return self.inside(cell) and not self.occupied[cell]
    def position(self,cell): return [float(self.x[cell[1]]),float(self.y[cell[0]])]
    def line_free(self,a,b):
        # Sampling at <= quarter-cell with diagonal supercover prevents corner cutting.
        n=max(1,math.ceil(math.dist(a,b)/(self.res/4)))
        prev=self.cell(a)
        for t in np.linspace(0,1,n+1):
            cell=self.cell([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])
            if not self.free(cell): return False
            if cell[0]!=prev[0] and cell[1]!=prev[1]:
                if not self.free((cell[0],prev[1])) or not self.free((prev[0],cell[1])): return False
            prev=cell
        return True
    def overlay(self):
        # Row runs keep a full-resolution occupied overlay compact.
        rows=[]
        for y,row in enumerate(self.occupied):
            edges=np.diff(np.r_[False,row,False].astype(int))
            for start,end in zip(np.flatnonzero(edges==1),np.flatnonzero(edges==-1)):
                rows.append([y,int(start),int(end)])
        return {'resolution':self.res,'origin':[self.xmin,self.ymin],'shape':[self.ny,self.nx],
                'occupied_runs':rows,'inflation_radius':self.inflation_radius}

def report_world(world:WorldSpec,robot:RobotSpec):
    errors=structural_errors(world)
    if errors:return WorldReport(valid=False,navigable=False,errors=errors,robot_id=robot.id),None
    grid=OccupancyGrid(world,robot)
    counts=np.bincount(grid.labels.ravel()); counts[0]=0
    largest=int(np.argmax(counts)) if len(counts)>1 else 0
    unreachable=[z.label for z in world.zones if not grid.free(grid.cell(z.center))
        or grid.labels[grid.cell(z.center)]!=largest]
    warnings=[]
    if unreachable:warnings.append('Outside the largest reachable area: '+', '.join(unreachable)+'. Widen an aisle or move the mission points.')
    if not largest:warnings.append('No free space remains for this robot.')
    return WorldReport(valid=True,navigable=bool(largest) and not unreachable,warnings=warnings,
        free_area_fraction=float((~grid.occupied).mean()),
        largest_component_fraction=float(counts[largest]/grid.occupied.size) if largest else 0,
        unreachable_zones=unreachable,robot_id=robot.id),grid

def clearance(world,robot,pose):
    x,y,yaw=pose; result=min(world.bounds.width/2-abs(x),world.bounds.length/2-abs(y))
    for o in world.objects:
        if not o.blocking:continue
        a=math.radians(o.yaw_deg);c,s=math.cos(a),math.sin(a)
        dx,dy=x-o.center[0],y-o.center[1]
        qx=abs(dx*c+dy*s)-o.footprint[0]/2; qy=abs(-dx*s+dy*c)-o.footprint[1]/2
        d=math.hypot(max(qx,0),max(qy,0))+min(max(qx,qy),0)
        result=min(result,d)
    return float(result-robot.collision_radius)
