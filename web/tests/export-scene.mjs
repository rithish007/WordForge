import {readFileSync} from 'node:fs';
import {BoxGeometry,Mesh,Group,Vector3} from 'three';
import {objectMesh,wallMeshes,WORLD_ROTATION} from '../lib/geometry.ts';
const world=JSON.parse(readFileSync(process.argv[2],'utf8'));
const root=new Group();root.rotation.set(...WORLD_ROTATION);
const meshes=[...world.objects.map(o=>({id:o.id,...objectMesh(o)})),...wallMeshes(world)];
const result={};
for(const o of meshes){
 const mesh=new Mesh(new BoxGeometry(...o.size));mesh.position.set(...o.position);
 mesh.rotation.set(...(o.rotation??[0,0,0]));root.add(mesh);root.updateMatrixWorld(true);
 const vertices=mesh.geometry.attributes.position;const xy=[];
 for(let i=0;i<vertices.count;i++){
  const local=new Vector3().fromBufferAttribute(vertices,i);
  const actualWorld=local.clone().applyMatrix4(mesh.matrixWorld);
  const pickedWorld=root.worldToLocal(actualWorld.clone());
  xy.push(pickedWorld.toArray());
 }
 result[o.id]=xy;
}
const point=new Vector3(3,-2,0);
root.updateMatrixWorld(true);
result.pointer_roundtrip=root.worldToLocal(root.localToWorld(point.clone())).toArray();
console.log(JSON.stringify(result));
