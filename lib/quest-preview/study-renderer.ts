import {CONCEPT_SCENE_STUDY} from './concept-scene-study.ts';
import {makeThreePathGeometry,type BuildingBounds} from './three-path-world.ts';
import {frogPose,FROG_HOME} from './scene-decorations.ts';
import {cloudDrift} from './scene-weather-motion.ts';
import {placeCulture} from './culture-motion.ts';
import {roadVehiclePose,riverBoatPose,placeTraffic} from './scene-traffic.ts';
import {STUDY_ROUTES,STUDY_PORTALS} from './study-navigation.ts';
import {createQuestRenderer} from './renderer.ts';
import {cityCameraRig,cameraFromRig,destinationCamera,blendRig,type CameraRig} from './city-camera.ts';
import {project,normalize,dot,type Mat4,type V3} from './math.ts';
import {worldPalette,atmosphere} from './palette.ts';
import {ENTRY_TIMING,smooth,type EntryFrame} from './destination-transition.ts';
import type {Actors,Destination} from './actors.ts';
import type {SceneVariant} from './variants.ts';
import {captureSceneFrame,fadeSceneFrame,clearSceneTransition} from './scene-transition.ts';

export function studyTargets(matrix:Mat4,width:number,height:number,bounds=makeThreePathGeometry(CONCEPT_SCENE_STUDY).bounds){
 return Object.fromEntries((Object.keys(STUDY_ROUTES) as Destination[]).map(id=>{
  const b:BuildingBounds=bounds[id],points=[];
  for(const x of [b.min[0],b.max[0]])for(const z of [b.min[2],b.max[2]])for(const y of [b.min[1],b.max[1]])points.push(project(matrix,[x,y,z],width,height));
  const left=Math.min(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y));
  return [id,{left,top,width:Math.max(44,Math.max(...points.map(p=>p.x))-left),height:Math.max(44,Math.max(...points.map(p=>p.y))-top)}];
 })) as Record<Destination,{left:number;top:number;width:number;height:number}>;
}
/** One model drives GPU and software rendering, including physical hover pivots. */
export function studyModel(variant:SceneVariant=CONCEPT_SCENE_STUDY){
 const parts=[{id:'banner',path:'portfolio',pivot:[1.7,3.1,-.85],mode:'rotate'},{id:'curtains',path:'concepts',pivot:[-7.8,2.31,.84],mode:'rotate'},...[-.9,0,.9].map((dx,i)=>({id:`lantern-${i}`,path:'world',pivot:[7.8+dx,3.5,-.4],mode:'rotate'}))];
 const composition=makeThreePathGeometry(variant);
 for(const id of Object.keys(composition.layers)){const match=id.match(/^neon-(text|lights)-(concepts|portfolio|world)$/);if(match)parts.push({id,path:match[2],pivot:[0,0,0],mode:match[1]});}
 const base=composition.layers.base,layers=parts.map(part=>composition.layers[part.id]);
 const frog=composition.layers.frog??new Float32Array(),frogStart=base.length+layers.reduce((sum,g)=>sum+g.length,0);
 const traffic=Object.entries(composition.layers).filter(([id])=>id==='vehicle'||id.startsWith('boat-')).map(([id,source])=>({id,source,start:0}));
 const cultures=(composition.culture??[]).map(actor=>({actor,start:0}));
 const geometry=new Float32Array(frogStart+frog.length+traffic.reduce((sum,p)=>sum+p.source.length,0)+cultures.reduce((sum,p)=>sum+p.actor.mesh.length,0));geometry.set(base);geometry.set(frog,frogStart);
 let trafficOffset=frogStart+frog.length;for(const part of traffic){part.start=trafficOffset;trafficOffset+=part.source.length;geometry.set(part.source,part.start);const index=Number(part.id.slice(5));placeTraffic(geometry,part.start,part.source,part.id==='vehicle'?roadVehiclePose(0):riverBoatPose(0,index),part.id==='vehicle'?.8:index===2?.65:.5,part.id!=='vehicle');}
 for(const part of cultures){part.start=trafficOffset;trafficOffset+=part.actor.mesh.length;geometry.set(part.actor.mesh,part.start);placeCulture(geometry,part.start,part.actor,0);}
 let offset=base.length,lastTime=0;const segments=parts.map((part,i)=>{const start=offset;geometry.set(layers[i],offset);offset+=layers[i].length;return {...part,start,source:layers[i],weight:0,angle:0};});
 const clouds:number[]=[];for(let i=0;i<base.length;i+=8)if(base[i+6]===10)clouds.push(i);
 let previousFrog=frogPose(0,true);
 return {geometry,bounds:composition.bounds,ambientMotion:clouds.length>0||frog.length>0||traffic.length>0||cultures.length>0,update(time:number,focus:Destination|null,staticMotion:boolean){
  const dt=Math.min(.1,Math.max(0,time-lastTime));lastTime=time;let changed=false;
  for(const [i,part]of segments.entries()){
   const target=!staticMotion&&part.path===focus?1:0;part.weight+= (target-part.weight)*(1-Math.exp(-dt*7));if(staticMotion)part.weight=0;
   if(part.mode!=='rotate'){
    if(part.weight<.0001){if(part.angle!==0){geometry.set(part.source,part.start);part.angle=0;changed=true;}continue;}
    for(let v=0;v<part.source.length;v+=8){const o=part.start+v;
     if(part.mode==='text'){geometry[o]=part.source[v]+part.weight*Math.sin(time*1.8)*.11;geometry[o+1]=part.source[v+1]+part.weight*Math.sin(time*2.4)*.035;}
     else geometry[o+7]=part.source[v+7]+part.weight*Math.sin(time*2.2-part.source[v]*.8-part.source[v+1]*1.4)*.4;
    }
    part.angle=part.weight;changed=true;continue;
   }
   const angle=part.weight*Math.sin(time*(part.id==='banner'?2.7:3.3)+i*.9)*(part.id==='curtains'?.09:.1);
   if(angle===0&&part.angle!==0){geometry.set(part.source,part.start);part.angle=0;changed=true;continue;}
   if(Math.abs(angle-part.angle)<.00001)continue;part.angle=angle;changed=true;
   const c=Math.cos(angle),s=Math.sin(angle),[px,py]=part.pivot;
   for(let v=0;v<part.source.length;v+=8){
    const x=part.source[v]-px,y=part.source[v+1]-py,nx=part.source[v+3],ny=part.source[v+4],o=part.start+v;
    geometry[o]=px+x*c-y*s;geometry[o+1]=py+x*s+y*c;
    geometry[o+3]=nx*c-ny*s;geometry[o+4]=nx*s+ny*c;
   }
  }
  if(!staticMotion&&clouds.length){for(const i of clouds){const drift=cloudDrift(time,base[i+2]>3?2.3:base[i]<0?0:1.6);geometry[i]=base[i]+drift.x;geometry[i+1]=base[i+1]+drift.y;}changed=true;}
  if(frog.length){
   const pose=frogPose(time,staticMotion);
   if(Object.keys(pose).some(key=>pose[key as keyof typeof pose]!==previousFrog[key as keyof typeof pose])){
    if(staticMotion)geometry.set(frog,frogStart);
    else for(let i=0;i<frog.length;i+=8){const o=frogStart+i;geometry[o]=frog[i]+pose.x;geometry[o+1]=FROG_HOME[1]+(frog[i+1]-FROG_HOME[1])*pose.squash+pose.y;geometry[o+2]=frog[i+2]+pose.z;
     const nx=frog[i+3],ny=frog[i+4]/pose.squash,nz=frog[i+5],length=Math.hypot(nx,ny,nz)||1;geometry[o+3]=nx/length;geometry[o+4]=ny/length;geometry[o+5]=nz/length;
    }
    previousFrog=pose;changed=true;
   }
  }
  if(!staticMotion&&traffic.length){
   for(const part of traffic){const index=Number(part.id.slice(5));placeTraffic(geometry,part.start,part.source,part.id==='vehicle'?roadVehiclePose(time):riverBoatPose(time,index),part.id==='vehicle'?.8:index===2?.65:.5,part.id!=='vehicle');}
   changed=true;
  }
  if(!staticMotion&&cultures.length){for(const part of cultures)placeCulture(geometry,part.start,part.actor,time);changed=true;}
  return changed?geometry:null;
 }};
}
export type StudyRenderer={mode:'webgl'|'software';capture:()=>string;destroy:()=>void;variant:(variant:SceneVariant)=>void;update:(poses:Actors,entry:EntryFrame|null)=>void;projectFloor:(x:number,z:number)=>{x:number;y:number};pixelsPerUnit:()=>number;buildings:()=>ReturnType<typeof studyTargets>;orbit:(yaw:number,pitch:number)=>void;focus:(path:Destination|null)=>void;motion:(paused:boolean,reduced:boolean)=>void};
function seasonFade(canvas:HTMLCanvasElement){
 const layer=canvas.ownerDocument.createElement('canvas');layer.className='scene-study-season-fade';layer.setAttribute('aria-hidden','true');canvas.after(layer);
 return {layer,show(){layer.getAnimations().forEach(animation=>animation.cancel());fadeSceneFrame(layer);},destroy(){clearSceneTransition(layer);layer.remove();}};
}
export function createStudyRenderer(canvas:HTMLCanvasElement,onDraw:()=>void,preferSoftware=false,initial:SceneVariant=CONCEPT_SCENE_STUDY):StudyRenderer{
 let model=studyModel(initial);
 try{
  if(preferSoftware)throw Error('Software preview requested');
  const gpu=createQuestRenderer(canvas,onDraw,()=>{}, {initialVariant:initial,fullOrbit:true,geometryLightSensitive:true,geometry:variant=>{model=studyModel(variant);return model.geometry;},animateGeometry:(time,focus,staticMotion)=>model.update(time,focus,staticMotion),ambientMotion:()=>model.ambientMotion,routes:STUDY_ROUTES,portals:STUDY_PORTALS,hitTargets:(matrix,w,h)=>studyTargets(matrix,w,h,model.bounds)});
  const fade=seasonFade(canvas);
  let last:Actors|null=null,entry:EntryFrame|null=null;
  return {mode:'webgl',capture:gpu.capture,destroy(){fade.destroy();gpu.destroy();},variant(next){if(gpu.variant(next,fade.layer))fade.show();},update(poses,next){if(poses===last&&next===entry)return;last=poses;entry=next;gpu.journey(next);gpu.actors(poses);},projectFloor:gpu.projectFloor,pixelsPerUnit:gpu.pixelsPerUnit,buildings:gpu.buildings,orbit:gpu.orbit,focus:gpu.focus,motion:gpu.motion};
 }catch{
  // A fresh canvas is required if WebGL claimed a context before failing.
  const replacement=canvas.cloneNode(false) as HTMLCanvasElement;canvas.replaceWith(replacement);
  return softwareRenderer(replacement,model,onDraw,initial);
 }
}
/** Actual triangle projection also works when browser GPU acceleration is unavailable. */
function softwareRenderer(canvas:HTMLCanvasElement,model:ReturnType<typeof studyModel>,onDraw:()=>void,initial:SceneVariant):StudyRenderer{
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)throw Error('Canvas rendering unavailable');
 const fade=seasonFade(canvas);let variant=initial;
 let width=1,height=1,yaw=0,pitch=0,paused=false,reduced=false,focus:Destination|null=null,entry:EntryFrame|null=null,entryBase:CameraRig|null=null,returning:{rig:CameraRig;start:number}|null=null;
 let pixels:ImageData|null=null,depthBuffer=new Float32Array(0);
 let matrix:Mat4,lastPoses:Actors|null=null,frame=0,time=0,last=performance.now(),disposed=false,dirty=true;
 let palette=worldPalette(variant),weather=atmosphere(variant),sun=normalize(weather.direction);
 const baseRig=()=>cityCameraRig(variant.city,width,height,0,0,0,yaw,pitch,0,'restored',true);
 const currentRig=()=>{if(entry&&entryBase)return destinationCamera(entryBase,entry,width,height,false,STUDY_PORTALS[entry.destination]);if(returning){const t=smooth((performance.now()-returning.start)/ENTRY_TIMING.return);const rig=blendRig(returning.rig,baseRig(),t);if(t>=1)returning=null;return rig;}return baseRig();};
 const refreshCamera=()=>{matrix=cameraFromRig(currentRig(),width,height);};
 function draw(now:number){
  frame=0;if(disposed||document.hidden)return;
  const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(!paused&&!reduced)time+=dt;
  const animated=model.update(time,focus,paused||reduced);if(animated)dirty=true;
  if(entry||returning)dirty=true;
  refreshCamera();
  if(dirty){
   dirty=false;
   const cw=canvas.width,ch=canvas.height;
   if(!pixels||pixels.width!==cw||pixels.height!==ch){pixels=ctx!.createImageData(cw,ch);depthBuffer=new Float32Array(cw*ch);}
   pixels.data.fill(0);depthBuffer.fill(Infinity);const data=pixels.data,geometry=model.geometry;
   for(let i=0;i<geometry.length;i+=24){
    const points=[0,8,16].map(o=>{const p=project(matrix,geometry.slice(i+o,i+o+3) as unknown as V3,cw,ch);return {...p,z:matrix[2]*geometry[i+o]+matrix[6]*geometry[i+o+1]+matrix[10]*geometry[i+o+2]+matrix[14]};});
    const [a,b,c]=points,area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);if(Math.abs(area)<.00001)continue;
    const minX=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),maxX=Math.min(cw-1,Math.ceil(Math.max(a.x,b.x,c.x))),minY=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),maxY=Math.min(ch-1,Math.ceil(Math.max(a.y,b.y,c.y)));
    if(minX>maxX||minY>maxY)continue;
    const material=Math.round(geometry[i+6]),tone=geometry[i+7];
    const colors=[0,8,16].map(o=>{
     const n=normalize([geometry[i+o+3],geometry[i+o+4],geometry[i+o+5]]),sky=.5+.5*n[1],diffuse=Math.max(0,dot(n,sun));
     return [0,1,2].map(j=>{let v=palette[material*3+j]*tone*((weather.ground[j]*(1-sky)+weather.sky[j]*sky)*weather.fill+weather.sun[j]*diffuse*.83);if(material===9)v=palette[material*3+j]*(variant.light==='night'?1.85:1.1);if(tone>3)v=palette[material*3+j]*tone*(variant.light==='night'?1.35:.45);if(tone>5.5&&tone<6.5)v=[1,.16,.012][j]*(variant.light==='night'?2:1);return Math.round(Math.pow(1-Math.exp(-Math.max(0,v)*weather.exposure),1/2.2)*255);});
    });
    for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
     const u=((b.x-x-.5)*(c.y-y-.5)-(b.y-y-.5)*(c.x-x-.5))/area,v=((c.x-x-.5)*(a.y-y-.5)-(c.y-y-.5)*(a.x-x-.5))/area,w=1-u-v;
     if(u<-.00001||v<-.00001||w<-.00001)continue;
     const z=u*a.z+v*b.z+w*c.z,index=y*cw+x;if(z>=depthBuffer[index])continue;depthBuffer[index]=z;
     for(let j=0;j<3;j++)data[index*4+j]=u*colors[0][j]+v*colors[1][j]+w*colors[2][j];data[index*4+3]=255;
    }
   }
   ctx!.putImageData(pixels,0,0);
  }
  onDraw();if(!disposed&&!paused&&!reduced&&(focus||returning||entry||model.ambientMotion))frame=requestAnimationFrame(draw);
 }
 const invalidate=()=>{if(!frame&&!disposed&&!document.hidden){last=performance.now();frame=requestAnimationFrame(draw);}};
 const resize=()=>{width=Math.max(1,canvas.clientWidth);height=Math.max(1,canvas.clientHeight);const fit=Math.min(1,850/width,650/height);canvas.width=Math.round(width*fit);canvas.height=Math.round(height*fit);dirty=true;refreshCamera();invalidate();};
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{dirty=true;invalidate();}};document.addEventListener('visibilitychange',visibility);resize();
 return {mode:'software',capture(){resize();draw(performance.now());return canvas.toDataURL('image/png');},destroy(){disposed=true;fade.destroy();cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);},variant(next){if(JSON.stringify(next)===JSON.stringify(variant))return;captureSceneFrame(canvas,fade.layer);variant=next;model=studyModel(variant);palette=worldPalette(variant);weather=atmosphere(variant);sun=normalize(weather.direction);dirty=true;refreshCamera();invalidate();fade.show();},update(poses,next){if(lastPoses===poses&&entry===next)return;lastPoses=poses;if(next&&!entry){entryBase=baseRig();returning=null;}if(!next&&entry){returning={rig:currentRig(),start:performance.now()};entryBase=null;}entry=next;refreshCamera();if(entry||returning){dirty=true;invalidate();}},projectFloor(x,z){return project(matrix,[x,.4,z],width,height);},pixelsPerUnit(){return height/currentRig().span;},buildings(){return studyTargets(matrix,width,height,model.bounds);},orbit(a,b){yaw=a;pitch=b;dirty=true;refreshCamera();invalidate();},focus(path){focus=path;invalidate();},motion(a,b){paused=a;reduced=b;dirty=true;invalidate();}};
}
