import {Sculpture,MATERIAL as m} from './restored/world.ts';
import {RIVER_NAVIGATION} from './bangkok-river.ts';
export type TrafficPose={x:number;z:number;angle:number};
type Point=readonly [number,number];
/** Arc-length sampling keeps speed steady through corners and across the closed-loop seam. */
export function closedTrafficPath(points:readonly Point[]){
 const count=points.length,at=(t:number)=>{
  const u=((t%count)+count)%count,i=Math.floor(u),f=u-i,a=points[(i+count-1)%count],b=points[i],c=points[(i+1)%count],d=points[(i+2)%count];
  const value=(j:number)=>.5*(2*b[j]+(-a[j]+c[j])*f+(2*a[j]-5*b[j]+4*c[j]-d[j])*f*f+(-a[j]+3*b[j]-3*c[j]+d[j])*f*f*f);
  const derivative=(j:number)=>.5*((-a[j]+c[j])+2*(2*a[j]-5*b[j]+4*c[j]-d[j])*f+3*(-a[j]+3*b[j]-3*c[j]+d[j])*f*f);
  return {x:value(0),z:value(1),angle:Math.atan2(derivative(1),derivative(0))};
 };
 const steps=count*32,lengths=[0];let previous=at(0);
 for(let i=1;i<=steps;i++){const next=at(i/steps*count);lengths.push(lengths[i-1]+Math.hypot(next.x-previous.x,next.z-previous.z));previous=next;}
 const length=lengths[steps];
 return {length,pose(distance:number):TrafficPose{const target=((distance%length)+length)%length;let low=0,high=steps;while(high-low>1){const mid=(low+high)>>1;if(lengths[mid]<=target)low=mid;else high=mid;}const mix=(target-lengths[low])/(lengths[high]-lengths[low]||1);return at((low+mix)/steps*count);}};
}
export const ROAD_CENTRE:Point=[9.9,3.8],ROAD_HALF_WIDTH=.82;
const roadPoints=Array.from({length:32},(_,i)=>{const a=Math.PI/2+i/32*Math.PI*2;return [ROAD_CENTRE[0]+Math.cos(a)*1.4,ROAD_CENTRE[1]+Math.sin(a)*1.4] as Point;});
export const ROAD_ROUTE=closedTrafficPath(roadPoints);
function riverLane(){
 const line=RIVER_NAVIGATION,normal=(i:number)=>{const a=line[Math.max(0,i-1)],b=line[Math.min(line.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],n=Math.hypot(dx,dz);return [-dz/n,dx/n] as Point;},lane=.4;
 const points:Point[]=line.map((p,i)=>{const n=normal(i);return [p[0]+n[0]*lane,p[1]+n[1]*lane];});
 const end=line[line.length-1],n=normal(line.length-1),direction:Point=[n[1],-n[0]];
 for(let i=1;i<4;i++){const a=i/4*Math.PI;points.push([end[0]+lane*(n[0]*Math.cos(a)+direction[0]*Math.sin(a)),end[1]+lane*(n[1]*Math.cos(a)+direction[1]*Math.sin(a))]);}
 for(let i=line.length-1;i>=0;i--){const p=line[i],n=normal(i);points.push([p[0]-n[0]*lane,p[1]-n[1]*lane]);}
 const start=line[0],sn=normal(0),sd:Point=[sn[1],-sn[0]];
 for(let i=1;i<4;i++){const a=i/4*Math.PI;points.push([start[0]+lane*(-sn[0]*Math.cos(a)-sd[0]*Math.sin(a)),start[1]+lane*(-sn[1]*Math.cos(a)-sd[1]*Math.sin(a))]);}
 return points;
}
export const BOAT_ROUTE=closedTrafficPath(riverLane());
export function roadVehiclePose(time:number){return ROAD_ROUTE.pose(time*.85);}
export function riverBoatPose(time:number,index:number){return BOAT_ROUTE.pose(time*.62+BOAT_ROUTE.length*(.14+index/3));}
export function addTrafficRoad(g:Sculpture,planted=true){
 const steps=96;
 for(let i=0;i<steps;i++){
  const a=ROAD_ROUTE.pose(i/steps*ROAD_ROUTE.length),b=ROAD_ROUTE.pose((i+1)/steps*ROAD_ROUTE.length);
  const edge=(p:TrafficPose,side:number,y:number)=>[p.x-Math.sin(p.angle)*ROAD_HALF_WIDTH*side,y,p.z+Math.cos(p.angle)*ROAD_HALF_WIDTH*side] as [number,number,number];
  g.quad(edge(a,1,.315),edge(b,1,.315),edge(b,-1,.315),edge(a,-1,.315),m.ink);
  for(const side of [-1,1])g.beam(edge(a,side,.325),edge(b,side,.325),.075,i%6<3?m.path:m.stone);
  if(i%8<3){const inset=.8,pa=edge(a,inset,.326),pb=edge(b,inset,.326);g.beam(pa,pb,.025,m.path);}
 }
 g.ring([ROAD_CENTRE[0],.315,ROAD_CENTRE[1]],.56,.56,.1,m.path,32);
 if(!planted){g.ring([ROAD_CENTRE[0],.417,ROAD_CENTRE[1]],.49,.49,.012,m.stone,32);return;}
 g.ring([ROAD_CENTRE[0],.417,ROAD_CENTRE[1]],.49,.49,.012,m.grass,32);
 g.crown([ROAD_CENTRE[0],.54,ROAD_CENTRE[1]],[.38,.15,.26],m.leaf);
}
export function makeRoadVehicle(kind:'taxi'|'tuktuk'){
 const g=new Sculpture();
 if(kind==='tuktuk'){
  g.box([0,.78,0],[2.35,.33,1.05],m.vermilion);g.box([-.52,1.04,0],[.56,.3,.92],m.wood);
  for(const dx of [-1.02,.55])for(const dz of [-.5,.5])g.beam([dx,.88,dz],[dx,1.76,dz],.055,m.metal);
  g.box([-.15,1.8,0],[2.32,.15,1.2],m.gold);g.box([-.15,1.9,0],[1.95,.055,1.08],m.copper);
  g.box([.65,1.32,0],[.12,.62,.84],m.glass);g.box([.98,1.02,0],[.47,.28,.68],m.vermilion);g.box([1.23,1.12,0],[.04,.21,.3],m.lamp);
  for(const [dx,dz]of [[-.78,-.57],[-.78,.57],[1,0]]){g.crown([dx,.54,dz],[.27,.27,.13],m.ink);g.crown([dx,.54,dz+.08],[.12,.12,.055],m.metal);}
  g.beam([.63,1.12,-.3],[.63,1.12,.3],.045,m.ink);g.box([-.8,.91,.57],[.58,.08,.18],m.metal);
 }else{
  g.box([0,.72,0],[2.15,.48,1.03],m.gold);g.box([.09,1.1,0],[1.1,.48,.92],m.glass);g.box([0,1.4,0],[1.32,.1,1.07],m.gold);
  g.box([0,1.54,0],[.42,.17,.24],m.plaster);for(let i=0;i<7;i++)g.box([-.8+i*.24,.88,.525],[.12,.07,.02],i%2?m.plaster:m.ink);
  for(const dx of [-.7,.7])for(const dz of [-.54,.54]){g.crown([dx,.51,dz],[.24,.24,.095],m.ink);g.crown([dx,.51,dz+.05],[.1,.1,.04],m.metal);}
  for(const dz of [-.32,.32])g.box([1.09,.8,dz],[.04,.16,.23],m.lamp);
 }
 return new Float32Array(g.values);
}
export function placeTraffic(target:Float32Array,start:number,mesh:Float32Array,pose:TrafficPose,scale=1,water=false){
 const c=Math.cos(pose.angle),s=Math.sin(pose.angle);
 for(let i=0;i<mesh.length;i+=8){const o=start+i,x=mesh[i]*scale,z=mesh[i+2]*scale,nx=mesh[i+3],nz=mesh[i+5];target[o]=pose.x+x*c-z*s;target[o+1]=water?.4+(mesh[i+1]-.4)*scale:.35+(mesh[i+1]-.3)*scale;target[o+2]=pose.z+x*s+z*c;target[o+3]=nx*c-nz*s;target[o+5]=nx*s+nz*c;}
}

/** NYC roads use opposing straight lanes; vehicles leave and re-enter at street ends. */
export const NYC_STREETS={
 broadway:{min:-10.7,max:10.7,lanes:[-4.3,-5.35],carsPerLane:2,speed:1},
 side:{min:1.2,max:5.8,lanes:[9.5,10.3],carsPerLane:3,speed:.48},
} as const;
export function nycTaxiPose(time:number,index:number,broadway=true){
 const road=broadway?NYC_STREETS.broadway:NYC_STREETS.side,length=road.max-road.min,lane=Math.floor(index/road.carsPerLane)%2;
 const distance=((time*road.speed+(index%road.carsPerLane)*length/road.carsPerLane+(broadway&&lane===1?length*.25:0))%length+length)%length;
 const position=lane===0?road.min+distance:road.max-distance;
 const visibility=Math.min(1,distance/.45,(length-distance)/.45);
 return {x:broadway?position:road.lanes[lane],z:broadway?road.lanes[lane]:position,angle:broadway?(lane?Math.PI:0):(lane?-Math.PI/2:Math.PI/2),scale:broadway?.72:.55*Math.max(0,visibility)};
}
export function addNycStreet(g:Sculpture,broadway:boolean){
 if(broadway){
  // Rear traffic stays behind the three entrance buildings, with covered street exits.
  g.box([0,.32,-4.85],[23.6,.025,2.3],m.ink);
  for(let x=-11;x<=11;x+=1.5)g.box([x,.34,-4.85],[.65,.012,.035],m.gold);
  for(const side of [-1,1]){
   const x=side*10.4;
   g.box([x,1.85,-4.85],[2.8,.3,2.55],m.metal);
   g.box([x,1,-3.65],[2.8,1.7,.18],m.brick);
   g.box([x,1,-6.05],[2.8,1.7,.18],m.brick);
   for(let dx=-1;dx<=1;dx+=.5)g.box([x+dx,2.08,-3.65],[.23,.16,.2],m.stone);
  }
 }else{
  g.box([9.9,.32,3.5],[1.65,.025,5.4],m.ink);
  for(const x of [9.08,10.72])g.box([x,.34,3.5],[.055,.025,5.4],m.stone);
  for(let z=1;z<6;z+=.8)g.box([9.9,.34,z],[.025,.012,.35],m.gold);
 }
}
