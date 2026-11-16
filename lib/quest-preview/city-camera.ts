import {multiply,ortho,lookAt,type V3} from './math.ts';
import {entryPortal,smooth,type EntryFrame} from './destination-transition.ts';
import {orbitFit} from './map-orbit.ts';
import {cityLayout} from './city-layout.ts';
import type {City,SceneEdition} from './variants.ts';
/** Same camera for GPU, DOM hit targets and CPU fallback art. Arrival is finite. */
export type CameraRig={eye:V3;target:V3;span:number;offset:number};
export function cityCameraRig(city:City,width:number,height:number,focus=0,panX=0,panY=0,yaw=0,pitch=0,arrival=0,edition:SceneEdition='original',fullOrbit=false):CameraRig{
 const c=cityLayout(city,edition).camera,aspect=Math.max(.2,width/Math.max(1,height));
 const span=(edition==='classic'?Math.max(24,30/aspect):edition==='heritage'?Math.max(26,34/aspect):Math.max(20,34/aspect))*c.fit*orbitFit(yaw,pitch)*(1+arrival*.07);
 const a=fullOrbit?yaw+c.yaw+c.arrivalYaw*arrival:Math.max(-.65,Math.min(.65,yaw+c.yaw+c.arrivalYaw*arrival)),elevation=Math.atan2(15.9,32)+pitch+c.pitch+c.arrivalPitch*arrival,radius=Math.hypot(15.9,32);
 const eye:V3=[Math.sin(a)*Math.cos(elevation)*radius+panX*.7+focus*.6,.6+Math.sin(elevation)*radius+panY*.35,Math.cos(a)*Math.cos(elevation)*radius];
 return {eye,target:[focus*.35,c.targetY,0],span,offset:edition==='classic'||edition==='heritage'?0:1};
}
export function cameraFromRig(r:CameraRig,width:number,height:number){const a=Math.max(.2,width/Math.max(1,height));return multiply(ortho(-r.span*a/2,r.span*a/2,-r.span/2+r.offset,r.span/2+r.offset,.005,120),lookAt(r.eye,r.target));}
export function blendRig(a:CameraRig,b:CameraRig,t:number):CameraRig{if(t<=0)return a;if(t>=1)return b;const mix=(x:number,y:number)=>x+(y-x)*t;return {eye:a.eye.map((x,i)=>mix(x,b.eye[i])) as V3,target:a.target.map((x,i)=>mix(x,b.target[i])) as V3,span:mix(a.span,b.span),offset:mix(a.offset,b.offset)};}
export function cityCameraMatrix(city:City,width:number,height:number,focus=0,panX=0,panY=0,yaw=0,pitch=0,arrival=0,edition:SceneEdition='original'){return cameraFromRig(cityCameraRig(city,width,height,focus,panX,panY,yaw,pitch,arrival,edition),width,height);}
export function destinationCamera(base:CameraRig,f:EntryFrame,width:number,height:number,lockAngle=false,portalOverride?:ReturnType<typeof entryPortal>):CameraRig{
 const p=portalOverride??entryPortal(f.city,f.destination,f.edition),a=Math.max(.2,width/Math.max(1,height));
 const progress=smooth(f.progress),follow=smooth(Math.min(1,f.elapsed/650));
 const mix=(x:number,y:number,t:number)=>x+(y-x)*t;
 const door:V3=p.stairs?[p.point[0],p.point[1],p.point[2]]:[p.point[0],p.point[1]+p.height/2,p.point[2]];
 const target:V3=[mix(f.pose.x,door[0],.2+progress*.45),mix(f.floorY+1.2,door[1],progress),mix(f.pose.z,door[2],.2+progress*.45)];
 const yaw=lockAngle?Math.atan2(base.eye[0]-base.target[0],base.eye[2]-base.target[2]):cityLayout(f.city,f.edition).camera.yaw*(1-progress*.8),elevation=lockAngle?Math.atan2(base.eye[1]-base.target[1],Math.hypot(base.eye[0]-base.target[0],base.eye[2]-base.target[2])):.38;
 const approach:CameraRig={target,eye:[target[0]+Math.sin(yaw)*(lockAngle?Math.cos(elevation):1)*12,target[1]+Math.sin(elevation)*12,target[2]+Math.cos(yaw)*Math.cos(elevation)*12],span:Math.max(7.2,6/a),offset:0};
 const cruising=blendRig(base,approach,follow*(.12+.88*progress));
 // Keep a little head/foot room until the avatar is entirely inside the doorway.
 const entering=blendRig(cruising,{target:door,eye:[door[0]+(lockAngle?Math.sin(yaw)*Math.cos(elevation)*5:0),door[1]+Math.sin(lockAngle?elevation:p.stairs?.8:.18)*5,door[2]+(lockAngle?Math.cos(yaw):1)*Math.cos(lockAngle?elevation:p.stairs?.8:.18)*5],span:Math.max(5.8,4/a),offset:0},smooth(f.entry)*.8);
 const finish:CameraRig={target:door,eye:[door[0]+(lockAngle?Math.sin(yaw)*Math.cos(elevation)*.28:0),door[1]+Math.sin(lockAngle?elevation:p.pitch)*.28,door[2]+(lockAngle?Math.cos(yaw):1)*Math.cos(lockAngle?elevation:p.pitch)*.28],span:Math.min(.7,1.6/a),offset:0};
 return blendRig(entering,finish,f.push);
}
export function arrivalProgress(city:City,elapsed:number,reduced=false){
 if(reduced)return 0;const t=Math.max(0,Math.min(1,elapsed/cityLayout(city).camera.duration));return (1-t)**3;
}
