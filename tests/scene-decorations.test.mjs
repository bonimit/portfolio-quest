import test from 'node:test';
import assert from 'node:assert/strict';
import {isBroadway} from '../lib/quest-preview/culture-scenes.ts';
import {THREE_PATH_STOPS,threePathId} from '../lib/quest-preview/three-path-catalog.ts';
import {makeSceneDecorations,decorationPlan,frogPose,FROG_HOME,DECORATION_LOTS} from '../lib/quest-preview/scene-decorations.ts';
import {STUDY_PET_SPACE} from '../lib/quest-preview/pet-space.ts';
import {STUDY_ROUTES} from '../lib/quest-preview/study-navigation.ts';
import {studyModel} from '../lib/quest-preview/study-renderer.ts';
import {ROAD_ROUTE,BOAT_ROUTE,ROAD_HALF_WIDTH,makeRoadVehicle} from '../lib/quest-preview/scene-traffic.ts';
import {makeThreePathGeometry} from '../lib/quest-preview/three-path-world.ts';
import {makeBangkokRiverfront,makeBangkokBoats} from '../lib/quest-preview/bangkok-river.ts';
function distance(a,b,p){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(a[0]+dx*t-p[0],a[1]+dz*t-p[1]);}
test('every scene has themed plants and street props, with no winter frogs or Bangkok snow',()=>{
 const species=new Set(),street=new Set();
 for(const v of THREE_PATH_STOPS){const d=makeSceneDecorations(v),plan=decorationPlan(v);if(v.place==='centralpark'||v.place==='nikko')assert.equal(d.base.length,0,'The custom park and forest own their scenery');else assert.ok(d.base.length>0,threePathId(v));assert.equal(d.base.length%24,0);assert.ok(d.base.every(Number.isFinite));plan.trees.forEach(t=>species.add(t));street.add(plan.street);
  const cold=v.season==='winter'&&v.city!=='bangkok';assert.equal(d.frog.length>0,!cold&&!isBroadway(v)&&v.place!=='centralpark'&&v.place!=='nikko',threePathId(v));
  if(v.city==='nyc'&&!v.place)assert.equal(plan.street,'taxi');if(v.city==='bangkok'&&!v.place)assert.equal(plan.street,'tuktuk');
  if(v.city==='bangkok')assert.equal([...d.base].some((value,i)=>i%8===6&&value===18),false);
 }assert.ok(species.size>=8);assert.equal(street.size,6);
});
test('garden decorations stay clear of every entry path and complete pet clearing',()=>{
 for(const lot of DECORATION_LOTS){
  for(const [left,right,back,front] of Object.values(STUDY_PET_SPACE.bounds)){const dx=Math.max(left-lot.x,0,lot.x-right),dz=Math.max(back-lot.z,0,lot.z-front);assert.ok(Math.hypot(dx,dz)>lot.radius+.7);}
  for(const route of Object.values(STUDY_ROUTES)){const points=[...route.via,route.door];for(let i=1;i<points.length;i++)assert.ok(distance(points[i-1],points[i],[lot.x,lot.z])>lot.radius+.55);}
 }
});
test('frogs crouch, arc between two lily pads, land and return without leaving the pond',()=>{
 assert.ok(frogPose(1.8).squash<1);assert.ok(frogPose(2.225).y>.5);assert.equal(frogPose(2.7).y,0);assert.equal(frogPose(2.7).x,.75);assert.equal(frogPose(5.55).x,0);
 for(let t=0;t<11.2;t+=.025){const p=frogPose(t);assert.ok(Math.hypot(FROG_HOME[0]+p.x+9.4,FROG_HOME[2]+p.z-3.65)+.27<1.05);assert.ok(p.y>=0&&p.y<=.55);assert.deepEqual(frogPose(t,true),{x:0,y:0,z:0,squash:1});}
});
test('ambient garden motion preserves the scene and stops when paused or reduced',()=>{
 const model=studyModel({city:'tokyo',season:'autumn',light:'day'}),rest=new Float32Array(model.geometry);assert.equal(model.ambientMotion,true);assert.ok(model.update(2.225,null,false));assert.notDeepEqual(model.geometry,rest);assert.ok(model.geometry.every(Number.isFinite));model.update(2.225,null,true);const stopped=new Float32Array(model.geometry);model.update(9,null,true);assert.deepEqual(model.geometry,stopped);
 assert.equal(studyModel({city:'nyc',season:'winter',light:'day'}).ambientMotion,true); // Traffic also runs in winter.
});

test('traffic follows smooth closed routes at steady speed without a loop-boundary jump',()=>{
 for(const [route,speed]of [[ROAD_ROUTE,.85],[BOAT_ROUTE,.62]]){
  const dt=.01,period=route.length/speed;
  for(let t=0;t<period;t+=period/200){const a=route.pose(t*speed),b=route.pose((t+dt)*speed);assert.ok(Math.abs(Math.hypot(b.x-a.x,b.z-a.z)-speed*dt)<.001);const turn=Math.atan2(Math.sin(b.angle-a.angle),Math.cos(b.angle-a.angle));assert.ok(Math.abs(turn)<.08);}
  const a=route.pose(route.length-.0001),b=route.pose(.0001);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<.001);assert.ok(Math.abs(Math.atan2(Math.sin(a.angle-b.angle),Math.cos(a.angle-b.angle)))<.002);
 }
});
function flatVertices(mesh){const points=new Map();for(let i=0;i<mesh.length;i+=8)points.set(mesh[i].toFixed(4)+','+mesh[i+2].toFixed(4),[mesh[i],mesh[i+2]]);return [...points.values()];}
function worldPoint(p,pose,scale){const c=Math.cos(pose.angle),s=Math.sin(pose.angle);return [pose.x+scale*(p[0]*c-p[1]*s),pose.z+scale*(p[0]*s+p[1]*c)];}
test('entire moving cars stay on the road and outside the paths and pet clearings',()=>{
 const line=Array.from({length:256},(_,i)=>ROAD_ROUTE.pose(i/256*ROAD_ROUTE.length)).map(p=>[p.x,p.z]);
 for(const kind of ['taxi','tuktuk'])for(let i=0;i<160;i++){
  const pose=ROAD_ROUTE.pose(i/160*ROAD_ROUTE.length);
  for(const vertex of flatVertices(makeRoadVehicle(kind))){const p=worldPoint(vertex,pose,.8),edge=Math.min(...line.map((a,j)=>distance(a,line[(j+1)%line.length],p)));assert.ok(edge<=ROAD_HALF_WIDTH+.02,`${kind} crosses curb by ${edge-ROAD_HALF_WIDTH}`);
   for(const [left,right,back,front]of Object.values(STUDY_PET_SPACE.bounds)){const dx=Math.max(left-p[0],0,p[0]-right),dz=Math.max(back-p[1],0,p[1]-front);assert.ok(Math.hypot(dx,dz)>.7,`${kind} enters pet clearing`);}
   for(const route of Object.values(STUDY_ROUTES)){const nodes=[...route.via,route.door];for(let j=1;j<nodes.length;j++)assert.ok(distance(nodes[j-1],nodes[j],p)>.6,`${kind} crosses entry path`);}
  }
 }
});
test('complete boat silhouettes remain over real river geometry throughout bends and turnarounds',()=>{
 const variant={city:'bangkok',season:'summer',light:'day'},water=makeBangkokRiverfront(variant),triangles=[];
 for(let i=0;i<water.length;i+=24)if(water[i+6]===7)triangles.push([[water[i],water[i+2]],[water[i+8],water[i+10]],[water[i+16],water[i+18]]]);
 function contains(p){return triangles.some(([a,b,c])=>{const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);if(Math.abs(area)<1e-8)return false;const u=((b[0]-p[0])*(c[1]-p[1])-(b[1]-p[1])*(c[0]-p[0]))/area,v=((c[0]-p[0])*(a[1]-p[1])-(c[1]-p[1])*(a[0]-p[0]))/area;return u>=-.0001&&v>=-.0001&&1-u-v>=-.0001;});}
 const boats=makeBangkokBoats(variant);
 for(let index=0;index<boats.length;index++){const vertices=flatVertices(boats[index]),scale=index===2?.65:.5;for(let i=0;i<180;i++){const pose=BOAT_ROUTE.pose(i/180*BOAT_ROUTE.length);for(const vertex of vertices){const p=worldPoint(vertex,pose,scale);assert.ok(contains(p),`Boat ${index} crosses bank at ${p}, phase ${i}`);}}}
});
test('traffic animates without hover, freezes in place, and resumes with finite geometry',()=>{
 const model=studyModel({city:'bangkok',season:'summer',light:'day'});assert.equal(model.ambientMotion,true);const before=new Float32Array(model.geometry);model.update(4,null,false);assert.notDeepEqual(model.geometry,before);model.update(4,null,true);const paused=new Float32Array(model.geometry);model.update(30,null,true);assert.deepEqual(model.geometry,paused);model.update(4.1,null,false);assert.notDeepEqual(model.geometry,paused);assert.ok(model.geometry.every(Number.isFinite));
});

test('boats pass one another and keep clear of the temple quay and landing pier',()=>{
 function hull(points){const p=[...points].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),half=items=>{const out=[];for(const q of items){while(out.length>1&&cross(out.at(-2),out.at(-1),q)<=0)out.pop();out.push(q);}return out;};return [...half(p).slice(0,-1),...half(p.toReversed()).slice(0,-1)];}
 function overlap(a,b){for(const shape of [a,b])for(let i=0;i<shape.length;i++){const p=shape[i],q=shape[(i+1)%shape.length],axis=[p[1]-q[1],q[0]-p[0]],pa=a.map(p=>p[0]*axis[0]+p[1]*axis[1]),pb=b.map(p=>p[0]*axis[0]+p[1]*axis[1]);if(Math.max(...pa)<Math.min(...pb)||Math.max(...pb)<Math.min(...pa))return false;}return true;}
 const boats=makeBangkokBoats({city:'bangkok',season:'summer',light:'day'}).map(mesh=>hull(flatVertices(mesh))),box=(l,r,b,f)=>[[l,b],[r,b],[r,f],[l,f]],solid=[box(2.65,7.15,-9.45,-6.75),box(6.925,9.075,-8.45,-6.35),box(4,6.8,-7.55,-6.95),box(5,5.8,-7.35,-6.85)];
 for(let i=0;i<600;i++){const moving=boats.map((mesh,index)=>{const pose=BOAT_ROUTE.pose((i/600+index/3)*BOAT_ROUTE.length);return mesh.map(p=>worldPoint(p,pose,index===2?.65:.5));});for(let j=0;j<moving.length;j++){for(const land of solid)assert.equal(overlap(moving[j],land),false,`Boat ${j} touches the temple or pier at ${i}`);for(let k=j+1;k<moving.length;k++)assert.equal(overlap(moving[j],moving[k]),false,`Boats ${j}/${k} touch at ${i}`);}}
});

test('old scene props and snow banks do not obstruct the new driving surface',()=>{
 for(const variant of THREE_PATH_STOPS){const kind=decorationPlan(variant).street;if(variant.city==='nyc'||kind!=='taxi'&&kind!=='tuktuk')continue;const base=makeThreePathGeometry(variant).layers.base;
  for(let i=0;i<base.length;i+=8){if(base[i+1]<.75||base[i+6]===7)continue; // Rain streaks are weather, not solid obstacles.
  const r=Math.hypot(base[i]-9.9,base[i+2]-3.8);assert.ok(Math.abs(r-1.4)>ROAD_HALF_WIDTH,`${threePathId(variant)} contains an old prop on the road at ${base[i]}, ${base[i+2]}`);}
 }
});

test('Broadway street decorations contain no garden plants, flowers, fruit stalls or ponds',()=>{
 for(const v of THREE_PATH_STOPS.filter(isBroadway)){const d=makeSceneDecorations(v);assert.equal(d.frog.length,0);const materials=new Set(Array.from(d.base).filter((_,i)=>i%8===6));for(const material of [1,6,7,15])assert.equal(materials.has(material),false);assert.equal(d.vehicle.length,0);}
});

test('NYC uses a street fleet instead of a vehicle on the old roundabout, with clear side lanes',()=>{
 for(const v of THREE_PATH_STOPS.filter(v=>v.city==='nyc')){
  assert.equal(makeSceneDecorations(v).vehicle.length,0);
  if(isBroadway(v))continue;
  const base=makeThreePathGeometry(v).layers.base;
  for(let i=0;i<base.length;i+=8){if(base[i+1]<.4||base[i+1]>1.6||base[i+6]===10)continue;assert.ok(base[i]<=9.13||base[i]>=10.67||base[i+2]<=.8||base[i+2]>=6.2,`${threePathId(v)} has an obstacle in its side street`);}
 }
});
