import {FOREST_TREES,FOREST_BEAR_ROUTE,FOREST_BOAR_ROUTE,makeKaruizawaScene,forestTreeKind} from '../lib/quest-preview/karuizawa.ts';
import {makeCentralParkScene} from '../lib/quest-preview/central-park.ts';
import {makeKyotoCanal,kyotoBridgePoint} from '../lib/quest-preview/organic-water.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {makeNycSceneDetails,HIGHLINE_DECK,hasAstorPlace,ASTOR_PLACE} from '../lib/quest-preview/nyc-scene-details.ts';
import {STUDY_ROUTES} from '../lib/quest-preview/study-navigation.ts';
import {BROADWAY_SHOWS} from '../lib/quest-preview/broadway-shows.ts';
import {THREE_PATH_STOPS,threePathFromQuery,threePathId,threePathTitle,threePathHref,REVIEW_PLACES} from '../lib/quest-preview/three-path-catalog.ts';
import {makeCultureScene,COAST_ISLANDS,SKI_BOUNDS} from '../lib/quest-preview/culture-scenes.ts';
import {culturePose,placeCulture,CULTURE_PATHS,skiHeight} from '../lib/quest-preview/culture-motion.ts';
import {makeThreePathGeometry} from '../lib/quest-preview/three-path-world.ts';
import {studyModel} from '../lib/quest-preview/study-renderer.ts';
import {STUDY_PET_SPACE} from '../lib/quest-preview/pet-space.ts';
test('Hakuba replaces Niseko in review labels and URLs while old saved links remain usable',()=>{
 const hakuba=threePathFromQuery('place-hakuba','night');assert.equal(hakuba.place,'hokkaido');assert.equal(threePathId(hakuba),'place-hakuba');assert.match(threePathTitle(hakuba),/Hakuba/);assert.doesNotMatch(threePathTitle(hakuba),/Niseko|Hokkaido/);assert.equal(threePathId(threePathFromQuery('place-hokkaido','day')),'place-hakuba');assert.match(REVIEW_PLACES.hokkaido.description,/Alps/);assert.match(REVIEW_PLACES.rockefeller.title,/Times Square.*Broadway/);
});
test('walking figures are absent in every scene while sports participants, riders and lanterns remain',()=>{
 for(const v of THREE_PATH_STOPS){const scene=makeCultureScene(v);assert.ok(scene.actors.every(a=>a.kind!=='visitor'));assert.equal(scene.base.length%24,0);assert.ok(scene.base.every(Number.isFinite));for(const actor of scene.actors){assert.ok(actor.mesh.length>0&&actor.mesh.length%24===0);assert.ok(actor.mesh.every(Number.isFinite));}
  if(v.place==='okinawa'||v.place==='krabi')for(const kind of ['surfer','kayaker','paddler','speedboat'])assert.ok(scene.actors.some(a=>a.kind===kind));
  if(v.place==='hokkaido'){assert.ok(scene.actors.filter(a=>a.kind==='skier').length>=3);assert.ok(scene.actors.some(a=>a.kind==='lift'));}
 }
 const day=makeCultureScene({city:'bangkok',season:'winter',place:'inthanon',light:'day'}),night=makeCultureScene({city:'bangkok',season:'winter',place:'inthanon',light:'night'});assert.equal(day.actors.filter(a=>a.kind==='sky-lantern').length,0);assert.equal(night.actors.filter(a=>a.kind==='sky-lantern').length,10);assert.notDeepEqual(day.base,night.base);
});
function waterTriangles(mesh){const triangles=[];for(let i=0;i<mesh.length;i+=24)if(mesh[i+6]===7)triangles.push([[mesh[i],mesh[i+2]],[mesh[i+8],mesh[i+10]],[mesh[i+16],mesh[i+18]]]);return triangles;}
function contains(triangles,p){return triangles.some(([a,b,c])=>{const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);if(Math.abs(area)<1e-8)return false;const u=((b[0]-p[0])*(c[1]-p[1])-(b[1]-p[1])*(c[0]-p[0]))/area,v=((c[0]-p[0])*(a[1]-p[1])-(c[1]-p[1])*(a[0]-p[0]))/area;return u>=-.0001&&v>=-.0001&&1-u-v>=-.0001;});}
test('water sports and speedboats remain in the bays and clear the small islands over full loops',()=>{
 const scene=makeCultureScene({city:'tokyo',season:'summer',place:'okinawa',light:'day'}),water=waterTriangles(scene.base);assert.ok(COAST_ISLANDS.length>=7);
 for(const actor of scene.actors.filter(a=>a.kind!=='visitor')){
  const buffer=new Float32Array(actor.mesh);for(let frame=0;frame<160;frame++){const time=frame*.35;placeCulture(buffer,0,actor,time);for(let i=0;i<buffer.length;i+=8){const point=[buffer[i],buffer[i+2]];assert.ok(contains(water,point),`${actor.kind} leaves water at ${point} time ${time}`);for(const [x,z,r]of COAST_ISLANDS)assert.ok(Math.hypot(point[0]-x,point[1]-z)>r*1.2,`${actor.kind} crosses island ${x}, ${z} at ${point}, time ${time}`);}}
 }
});
test('skiers stay over the graded piste and visitors stay outside complete pet clearings',()=>{
 for(const variant of [{city:'tokyo',season:'winter',place:'hokkaido',light:'day'},{city:'nyc',season:'summer',light:'day'}])for(const actor of makeCultureScene(variant).actors){
  if(actor.kind!=='visitor'&&actor.kind!=='skier')continue;const buffer=new Float32Array(actor.mesh);for(let i=0;i<120;i++){placeCulture(buffer,0,actor,i*.4);const pose=culturePose(actor,i*.4);if(actor.kind==='skier')assert.ok(Math.abs(pose.y-skiHeight(pose.z)-.035)<.0001);
   for(let j=0;j<buffer.length;j+=8){const x=buffer[j],z=buffer[j+2];if(actor.kind==='skier')assert.ok(x>=SKI_BOUNDS.left&&x<=SKI_BOUNDS.right&&z>=SKI_BOUNDS.back&&z<=SKI_BOUNDS.front,`Skier leaves piste ${x}, ${z}`);for(const [left,right,back,front]of Object.values(STUDY_PET_SPACE.bounds))assert.ok(Math.hypot(Math.max(left-x,0,x-right),Math.max(back-z,0,z-front))>.7);}
  }
 }
});
test('culture motion changes articulated people and lanterns, and pause holds their exact positions',()=>{
 for(const variant of [{city:'tokyo',season:'summer',place:'okinawa',light:'day'},{city:'tokyo',season:'winter',place:'hokkaido',light:'night'},{city:'bangkok',season:'winter',place:'inthanon',light:'night'}]){
  const model=studyModel(variant),initial=new Float32Array(model.geometry);model.update(2,null,false);assert.notDeepEqual(model.geometry,initial);assert.ok(model.geometry.every(Number.isFinite));model.update(2,null,true);const paused=new Float32Array(model.geometry);model.update(20,null,true);assert.deepEqual(model.geometry,paused);
 }
 assert.ok(CULTURE_PATHS.speedboat.length>20);
});

test('Yi Peng lanterns visibly rise into the sky with gentle lateral drift',()=>{
 const actor=makeCultureScene({city:'bangkok',season:'winter',place:'inthanon',light:'night'}).actors.find(a=>a.kind==='sky-lantern'&&a.phase===.2);assert.ok(actor);const a=culturePose(actor,0),b=culturePose(actor,4);assert.ok(b.y-a.y>1.5);assert.ok(Math.abs(b.x-a.x)>.02);assert.ok(Math.abs(a.x)>6);const mesh=new Float32Array(actor.mesh);placeCulture(mesh,0,actor,4);assert.ok(mesh.every(Number.isFinite));
});

test('NYC taxis travel in opposing straight street lanes, remain separated and do not park',()=>{
 for(const variant of THREE_PATH_STOPS.filter(v=>v.city==='nyc')){
  const actors=makeCultureScene(variant).actors,taxis=actors.filter(a=>a.kind==='taxi'),broadway=!variant.place||variant.place==='rockefeller';
  assert.equal(taxis.length,['centralpark','highline'].includes(variant.place)?0:broadway?4:6);
  for(const taxi of taxis){const a=culturePose(taxi,.2),b=culturePose(taxi,2.2);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>.3);assert.equal(a.angle,b.angle);assert.equal(broadway?a.z:a.x,broadway?b.z:b.x);}
  for(let frame=0;frame<90;frame++){
   const boxes=taxis.filter(a=>culturePose(a,frame*.4).scale>.03).map(actor=>{const mesh=new Float32Array(actor.mesh);placeCulture(mesh,0,actor,frame*.4);const xs=[],zs=[];for(let i=0;i<mesh.length;i+=8){xs.push(mesh[i]);zs.push(mesh[i+2]);}return {left:Math.min(...xs),right:Math.max(...xs),back:Math.min(...zs),front:Math.max(...zs)};});
   for(const [i,a]of boxes.entries()){
    if(broadway)assert.ok(a.left>=-11.8&&a.right<=11.8&&a.back>=-6&&a.front<=-3.7);
    else assert.ok(a.left>=9.075&&a.right<=10.725&&a.back>=.8&&a.front<=6.2);
    for(const b of boxes.slice(i+1))assert.ok(a.right<b.left||b.right<a.left||a.front<b.back||b.front<a.back);
   }
  }
 }
 const genie=makeCultureScene({city:'nyc',season:'summer',light:'night'}).actors.find(a=>a.kind==='genie');assert.ok(genie);assert.notEqual(culturePose(genie,0).y,culturePose(genie,1).y);
});

test('Broadway musical names are unique across entrances, billboards, marquees and posters',()=>{assert.equal(BROADWAY_SHOWS.length,14);assert.equal(new Set(BROADWAY_SHOWS).size,BROADWAY_SHOWS.length);assert.ok(BROADWAY_SHOWS.includes('ALADDIN'));assert.ok(BROADWAY_SHOWS.includes('WICKED'));assert.ok(BROADWAY_SHOWS.includes('THE LION KING'));assert.equal(BROADWAY_SHOWS.includes('CATS'),false);});

test('hover moves only the selected Broadway lettering and chases its lights; pause restores both',()=>{
 const v={city:'nyc',season:'summer',light:'night'},layers=makeThreePathGeometry(v).layers;let offset=layers.base.length+['banner','curtains','lantern-0','lantern-1','lantern-2'].reduce((n,id)=>n+layers[id].length,0);const ranges=Object.entries(layers).filter(([id])=>id.startsWith('neon-')).map(([id,mesh])=>{const start=offset;offset+=mesh.length;return {id,start,end:offset};});assert.equal(ranges.length,6);
 for(const path of ['concepts','portfolio','world']){const model=studyModel(v),rest=new Float32Array(model.geometry);for(let i=1;i<=8;i++)model.update(i*.1,path,false);for(let i=0;i<layers.base.length;i+=8)if(layers.base[i+6]!==10)assert.deepEqual(model.geometry.slice(i,i+8),rest.slice(i,i+8));
  for(const range of ranges){const before=rest.slice(range.start,range.end),active=model.geometry.slice(range.start,range.end);if(range.id.endsWith(path)){assert.notDeepEqual(active,before);if(range.id.includes('lights')){for(let i=0;i<active.length;i++)if(i%8!==7)assert.equal(active[i],before[i]);assert.ok(active.every((n,i)=>i%8!==7||n>3&&n<5.7));}else for(let i=0;i<active.length;i++)if(i%8>1)assert.equal(active[i],before[i]);}else assert.deepEqual(active,before);}
  model.update(1,path,true);for(const range of ranges)assert.deepEqual(model.geometry.slice(range.start,range.end),rest.slice(range.start,range.end));
 }
});

test('cloud clusters drift and autumn gusts lift leaves; pause freezes both',()=>{
 const v={city:'tokyo',season:'autumn',light:'day'},scene=makeCultureScene(v);assert.equal(scene.actors.filter(a=>a.kind==='wind-leaf').length,24);const leaf=scene.actors.find(a=>a.kind==='wind-leaf');assert.ok(culturePose(leaf,2).x-culturePose(leaf,0).x>2);
 const model=studyModel(v),rest=new Float32Array(model.geometry),cloud=[];for(let i=0;i<rest.length;i+=8)if(rest[i+6]===10)cloud.push(i);assert.ok(cloud.length);model.update(3,null,false);assert.ok(cloud.some(i=>model.geometry[i]!==rest[i]));model.update(3,null,true);const stopped=new Float32Array(model.geometry);model.update(10,null,true);assert.deepEqual(model.geometry,stopped);
});

test('High Line additions stay on the elevated rear walkway and do not occupy the ground routes',()=>{
 const v=threePathFromQuery('place-highline','day'),mesh=makeNycSceneDetails(v);
 assert.equal(HIGHLINE_DECK.length,9);assert.ok(mesh.length>0&&mesh.length%24===0);assert.ok(mesh.every(Number.isFinite));
 const materials=new Set();for(let i=0;i<mesh.length;i+=8){assert.ok(mesh[i+1]>2.5);assert.ok(mesh[i+2]<-4.5);materials.add(mesh[i+6]);}
 for(const material of [5,6,11,14,19])assert.ok(materials.has(material));
 assert.equal(makeNycSceneDetails(threePathFromQuery('place-centralpark','day')).length,0);
});
test('Astor Place has a signed stairwell only in the selected NYC scenes, clear of all entry routes',()=>{
 assert.equal(ASTOR_PLACE.label,'ASTOR PLACE');
 for(const v of THREE_PATH_STOPS){
  const expected=v.city==='nyc'&&!v.place&&['spring','autumn'].includes(v.season);assert.equal(hasAstorPlace(v),expected);
  if(!expected)continue;
  const day=makeNycSceneDetails({...v,light:'day'}),night=makeNycSceneDetails({...v,light:'night'});
  assert.ok(day.length>0&&day.length%24===0&&day.every(Number.isFinite));assert.notDeepEqual(day,night);
  const maxX=Math.max(...Array.from(day).filter((_,i)=>i%8===0));
  for(const route of Object.values(STUDY_ROUTES))for(const [x]of [...route.via,route.door])assert.ok(x-maxX>.9);
 }
});

test('Central Park duck boats stay inside the organic lake and frisbee play stays on its own lawn',()=>{
 const variant=threePathFromQuery('place-centralpark','day'),actors=makeCultureScene(variant).actors,water=waterTriangles(makeCentralParkScene()),boats=actors.filter(a=>a.kind==='duck-boat');
 assert.equal(boats.length,3);assert.equal(actors.filter(a=>a.kind==='picnicker').length,6);assert.ok(water.length>=96);
 for(const boat of boats){const mesh=new Float32Array(boat.mesh);for(let frame=0;frame<72;frame++){placeCulture(mesh,0,boat,frame*.5);for(let i=0;i<mesh.length;i+=8)assert.ok(contains(water,[mesh[i],mesh[i+2]]),'duck boat leaves the lake');}}
 const dog=actors.find(a=>a.kind==='park-dog'),disc=actors.find(a=>a.kind==='frisbee'),owner=actors.find(a=>a.kind==='frisbee-owner');assert.ok(dog&&disc&&owner);assert.ok(owner.limbs.length);
 assert.notEqual(culturePose(dog,0).x,culturePose(dog,1.8).x);assert.ok(culturePose(dog,2.2).y>.5);
 for(let t=0;t<12;t+=.2){const p=culturePose(dog,t);assert.ok(p.x>=-6&&p.x<=-3&&p.z<5);assert.equal(culturePose(owner,t).x,-6);if(t%6>2.6)assert.ok(Math.hypot(culturePose(disc,t).x-p.x,culturePose(disc,t).z-p.z)<.5);}
});
test('Central Park stays free of street traffic while High Line retains moving cyclists',()=>{
 for(const place of ['centralpark','highline']){const actors=makeCultureScene(threePathFromQuery('place-'+place,'day')).actors;assert.equal(actors.filter(a=>a.kind==='taxi').length,0);const bikes=actors.filter(a=>a.kind==='park-cyclist');assert.equal(bikes.length,place==='centralpark'?0:4);for(const bike of bikes){const a=culturePose(bike,.2),b=culturePose(bike,2.2);assert.equal(a.x,b.x);assert.ok(Math.abs(a.z-b.z)>.2);}}
});
test('Kyoto walkers follow the curved bridges and tea guests remain seated on their mats',()=>{
 const actors=makeCultureScene(threePathFromQuery('place-kyoto','day')).actors,walkers=actors.filter(a=>a.kind==='kimono-walker'),guests=actors.filter(a=>a.kind==='tea-guest');assert.equal(walkers.length,4);assert.ok(walkers.some(a=>a.id==='geisha-bridge'));assert.equal(guests.length,3);
 for(const actor of walkers){const a=kyotoBridgePoint(actor.home[0],0),b=kyotoBridgePoint(actor.home[0],1),dx=b[0]-a[0],dz=b[2]-a[2];let low=1,high=0;for(let t=0;t<24;t+=.2){const p=culturePose(actor,t),f=((p.x-a[0])*dx+(p.z-a[2])*dz)/(dx*dx+dz*dz),lateral=Math.abs((p.x-a[0])*dz-(p.z-a[2])*dx)/Math.hypot(dx,dz);assert.ok(f>=-.001&&f<=1.001&&lateral<.16);assert.ok(Math.abs(p.y-(.52+Math.sin(f*Math.PI)*.25))<.002);low=Math.min(low,f);high=Math.max(high,f);}assert.ok(high-low>.95);}
 for(const guest of guests){assert.deepEqual(culturePose(guest,0),culturePose(guest,30));assert.ok(culturePose(guest,0).z<5.5);}
 const canal=makeKyotoCanal(),water=waterTriangles(canal),xs=water.flatMap(t=>t.map(p=>p[0]));assert.equal(water.length,192);assert.ok(Math.min(...xs)<-11&&Math.max(...xs)>-8.3);
});
test('Hakuba has a broad high Alps silhouette with a mix of large peaks and lower foothills',()=>{
 const mesh=makeCultureScene(threePathFromQuery('place-hakuba','day')).base,high=[],lower=[];
 for(let i=0;i<mesh.length;i+=8)if(mesh[i+6]===18&&mesh[i+2]<-5){if(mesh[i+1]>6)high.push([mesh[i],mesh[i+1]]);else if(mesh[i+1]>2)lower.push(mesh[i]);}
 assert.ok(high.length>0&&lower.length>0);assert.ok(Math.max(...high.map(p=>p[1]))>8);assert.ok(Math.max(...high.map(p=>p[0]))-Math.min(...high.map(p=>p[0]))>10);assert.ok(Math.min(...lower)<-7&&Math.max(...lower)>7);
});

test('Karuizawa replaces Nikko in labels and links, and the surf coast includes Okinawa in its name',()=>{
 const forest=threePathFromQuery('place-karuizawa','night');assert.equal(forest.place,'nikko');assert.equal(threePathId(forest),'place-karuizawa');assert.match(threePathTitle(forest),/Karuizawa/);assert.doesNotMatch(threePathTitle(forest),/Nikko/);assert.deepEqual(threePathFromQuery('place-nikko','night'),forest);assert.match(REVIEW_PLACES.okinawa.title,/Okinawa surf coast/);
});
test('Karuizawa has dense pine canopy while the three entrance routes stay clear',()=>{
 assert.ok(FOREST_TREES.length>=75);
 let covered=0,total=0;
 for(let x=-7;x<=7;x+=.4)for(let z=-8.4;z<=-6.4;z+=.4){if(Math.hypot(x/14,z/11.6)>.8)continue;total++;if(FOREST_TREES.some(t=>Math.hypot(t.x-x,t.z-z)<t.width))covered++;}
 assert.ok(covered/total>.6,'the rear forest canopy must cover most ground');
 for(const tree of FOREST_TREES){assert.ok(Math.hypot(tree.x/14,tree.z/11.6)<.88);for(const route of Object.values(STUDY_ROUTES)){const nodes=[...route.via,route.door];for(let i=1;i<nodes.length;i++){const a=nodes[i-1],b=nodes[i],dx=b[0]-a[0],dz=b[1]-a[1],f=Math.max(0,Math.min(1,((tree.x-a[0])*dx+(tree.z-a[1])*dz)/(dx*dx+dz*dz)));assert.ok(Math.hypot(tree.x-a[0]-f*dx,tree.z-a[1]-f*dz)>=1.39);}}}
});
test('Karuizawa bear walks clear of buildings and pet areas, and detailed birds flap above the forest',()=>{
 const variant=threePathFromQuery('place-karuizawa','day'),actors=makeCultureScene(variant).actors,bear=actors.find(a=>a.kind==='forest-bear'),birds=actors.filter(a=>a.kind==='forest-bird'),bounds=makeThreePathGeometry(variant).bounds;
 assert.ok(bear&&bear.limbs.length===4);assert.equal(birds.length,5);assert.ok(birds.every(b=>b.limbs.length===2));assert.notDeepEqual(culturePose(bear,0),culturePose(bear,2));
 const mesh=new Float32Array(bear.mesh);
 for(let frame=0;frame<120;frame++){
  placeCulture(mesh,0,bear,frame/120*FOREST_BEAR_ROUTE.length/.4);
  for(let i=0;i<mesh.length;i+=24){const x=mesh[i],y=mesh[i+1],z=mesh[i+2];for(const b of Object.values(bounds))assert.ok(x<b.min[0]||x>b.max[0]||z<b.min[2]||z>b.max[2]||y<b.min[1]||y>b.max[1],'bear crosses a building');for(const [left,right,back,front]of Object.values(STUDY_PET_SPACE.bounds))assert.ok(Math.hypot(Math.max(left-x,0,x-right),Math.max(back-z,0,z-front))>.7);}
 }
 for(const bird of birds){const mesh=new Float32Array(bird.mesh);placeCulture(mesh,0,bird,1);const before=new Float32Array(mesh);placeCulture(mesh,0,bird,1.1);assert.notDeepEqual(mesh,before);assert.ok(mesh.every(Number.isFinite));assert.ok(culturePose(bird,2).y>4);}
});

test('Karuizawa spring is shareable, flower-rich and distinct from autumn while tree positions stay stable',()=>{
 const autumn=threePathFromQuery('place-karuizawa','day'),spring=threePathFromQuery('place-karuizawa','day','spring');assert.equal(spring.season,'spring');assert.match(threePathHref(spring),/season=spring/);assert.equal(threePathFromQuery('place-karuizawa','day','invalid').season,'autumn');
 const a=makeKaruizawaScene(autumn),b=makeKaruizawaScene(spring);assert.notDeepEqual(a,b);assert.ok(b.length>a.length);
 const kinds=new Set(FOREST_TREES.map((t,i)=>forestTreeKind(i,t.z)));for(const kind of ['pine','cedar','birch','maple'])assert.ok(kinds.has(kind));
});
test('woodland boar family has a larger mother and three striped piglets following her trail',()=>{
 const v=threePathFromQuery('place-karuizawa','day'),family=makeCultureScene(v).actors.filter(a=>a.kind==='forest-boar'),bounds=makeThreePathGeometry(v).bounds;assert.equal(family.length,4);const mother=family.find(a=>a.phase===0);assert.ok(mother);
 for(let i=0;i<100;i++){
  const time=i/100*FOREST_BOAR_ROUTE.length/.32;
  for(const actor of family){const pose=culturePose(actor,time);assert.ok(actor.phase===0?pose.scale>.7:pose.scale<.4);const mesh=new Float32Array(actor.mesh);placeCulture(mesh,0,actor,time);assert.ok(mesh.every(Number.isFinite));for(let j=0;j<mesh.length;j+=24){const x=mesh[j],y=mesh[j+1],z=mesh[j+2];for(const b of Object.values(bounds))assert.ok(x<b.min[0]||x>b.max[0]||z<b.min[2]||z>b.max[2]||y<b.min[1]||y>b.max[1],'boar crosses a building');}}
 }
});
test('Broadway taxis keep constant larger size over their full rear-street trip',()=>{
 const actors=makeCultureScene({city:'nyc',season:'summer',light:'day'}).actors.filter(a=>a.kind==='taxi');assert.equal(actors.length,4);
 for(const actor of actors)for(let t=0;t<45;t+=.2){const p=culturePose(actor,t);assert.equal(p.scale,.72);assert.ok(p.z< -4&&Math.abs(p.x)<=10.7);}
});
