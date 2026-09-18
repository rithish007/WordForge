from .specs import WorldSpec, WorldObject
def obj(id,kind,xy,wh,height=2.2,yaw=0):
    return dict(id=id,label=id.replace('_',' ').title(),type=kind,center=xy,footprint=wh,height=height,yaw_deg=yaw)
def fixtures():
    base=dict(schema_version=1,id='crossdock',name='The cross-dock',type='warehouse',
        bounds=dict(width=20,length=16,height=5),grid=dict(resolution=.1),
        zones=[dict(id='receiving',label='Receiving',type='receiving',center=[-8,-6],extent=[2,2]),
               dict(id='packing',label='Packing',type='packing',center=[8,6],extent=[2,2])],
        objects=[obj('rack_west_south','rack',[-4,-4],[2,4]),
                 obj('rack_west_north','rack',[-4,4],[2,4]),
                 obj('rack_east_south','rack',[4,-4],[2,4]),
                 obj('rack_east_north','rack',[4,4],[2,4]),
                 obj('pallet_north','pallet',[0,6],[1.2,1],.6,20),
                 obj('packing_bench','packing_station',[8,2],[1.4,2],1),
                 obj('charger_south','charger',[0,-7],[1.2,.5],.6)],
        assumptions=['Astra-authored local fixture. Primitive bodies; no live model call.',
            'Bounds are clear interior floor dimensions. All distances are metres.'])
    first=WorldSpec.model_validate(base)
    rotated=first.model_copy(deep=True);rotated.id='angled_depot';rotated.name='Angled depot'
    rotated.objects[0].yaw_deg=15;rotated.objects[1].yaw_deg=-15
    rotated.objects.append(WorldObject.model_validate(
        obj('crate_centre','crate',[0,0],[1.4,1.4],1.1,30)))
    blocked=first.model_copy(deep=True);blocked.id='sealed_crossdock';blocked.name='Sealed cross-dock'
    blocked.objects.append(WorldObject.model_validate(
        obj('cross_aisle_barrier','barrier',[0,0],[20,.3],1.1)))
    for world in [first,rotated,blocked]:
        counts={}
        for item in world.objects:
            counts[item.type]=counts.get(item.type,0)+1
            item.label=f"{item.type.replace('_',' ').capitalize()} {counts[item.type]}"
    return {w.id:w for w in [first,rotated,blocked]}
WORLDS=fixtures()
