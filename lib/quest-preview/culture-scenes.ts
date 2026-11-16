import {Sculpture,MATERIAL as m} from './restored/world.ts';
import {PlaceDetails} from './restored/place-scenes/details.ts';
import type {SceneVariant} from './variants.ts';
import {BROADWAY_PROGRAM} from './broadway-shows.ts';
import {makeRoadVehicle} from './scene-traffic.ts';
import {person,palm,sign,letters,NEON,type Limb} from './culture-geometry.ts';
export type CultureKind='visitor'|'surfer'|'kayaker'|'paddler'|'speedboat'|'skier'|'lift'|'sky-lantern'|'taxi-queue'|'genie'|'wind-leaf';
export type CultureActor={id:string;kind:CultureKind;mesh:Float32Array;limbs:Limb[];phase:number;side?:number};
export const COAST_ISLANDS=[[-6.8,-8.5,.55],[-4.7,-8.6,.66],[-1.6,-9.3,.48],[1.8,-9.1,.58],[5.2,-8.5,.62],[11.7,-2.9,.32],[.1,-9.5,.4]] as const;
export const COAST_SHORE=[[-12.4,-1.1],[-10,-3.3],[-6,-4.9],[-2.8,-5.3],[2.8,-5.3],[6,-4.9],[10,-3.3],[12.4,-1.1]] as const;
export const COAST_BACK=[[-12.4,-4],[-10,-7.1],[-6.4,-9.5],[-2.8,-10.25],[2.8,-10.25],[6.4,-9.5],[10,-7.1],[12.4,-4]] as const;
export const SKI_BOUNDS={left:-12.1,right:-9.5,back:-5.6,front:3.7};
export function isBroadway(v:SceneVariant){return v.city==='nyc'&&(!v.place||v.place==='rockefeller');}
export {BROADWAY_SHOWS} from './broadway-shows.ts';
export function isCoastal(v:SceneVariant){return v.place==='okinawa'||v.place==='krabi';}
export function replacesCultureBackdrop(v:SceneVariant){return isCoastal(v)||v.place==='hokkaido'||v.city==='nyc'&&(!v.place||v.place==='rockefeller');}
function coast(g:Sculpture,krabi:boolean){
 for(let i=1;i<COAST_SHORE.length;i++){
  const a=COAST_SHORE[i-1],b=COAST_SHORE[i],c=COAST_BACK[i],d=COAST_BACK[i-1];g.quad([a[0],.36,a[1]],[b[0],.36,b[1]],[c[0],.36,c[1]],[d[0],.36,d[1]],m.water);
  g.beam([a[0],.39,a[1]],[b[0],.39,b[1]],.12,m.path);
 }
 for(const [index,[x,z,r]]of COAST_ISLANDS.entries()){
  g.ring([x,.37,z],r*1.2,r*1.2,.08,m.path,16);
  if(krabi){
   const height=1.35+(index%3)*.55,sides=11,profile=[.7,1.0,.82,.93,.46],point=(level:number,j:number):[number,number,number]=>{const a=j/sides*Math.PI*2,rough=1+.17*Math.sin(j*2.1+level*.8+index);return [x+Math.cos(a)*r*profile[level]*rough+level*.025,.43+level/4*height,z+Math.sin(a)*r*.72*profile[level]*rough];};
   for(let level=0;level<4;level++)for(let j=0;j<sides;j++)g.quad(point(level,j),point(level+1,j),point(level+1,j+1),point(level,j+1),j%4?m.stone:m.rock,.9+(j%3)*.05);
   for(let j=0;j<sides;j++)g.tri([x+.12,height+.5,z],point(4,j),point(4,j+1),m.stone);
   for(const [dx,dz]of [[-.25,0],[.2,.15],[0,-.17]])g.crown([x+dx*r,height+.45,z+dz*r],[r*.42,.16,r*.36],m.leaf,index);
  }
  else{g.crown([x,.64,z],[r,.38,r*.75],m.rock,index);g.crown([x,.84,z],[r*.85,.2,r*.68],m.leaf,index);if(index%2===0)palm(g,x,.87,z,.42);}
 }
 // A rolling break on the near-left water, clear of the paddling channels.
 for(let i=0;i<20;i++){const x=-11.7+i*.12,z=-3.35+Math.sin(i/19*Math.PI)*.2,y=.44+Math.sin(i/19*Math.PI)*.33;g.crown([x,y,z],[.16,.08,.12],i%3?m.water:m.plaster,i);}
 for(let i=0;i<12;i++)g.box([-9+i*1.45,.39,-6.75-Math.sin(i*.7)*.15],[.43,.015,.035],m.glass,0,1.2);
 const d=new PlaceDetails(g);for(const [x,z]of [[-11.6,1.4],[11.6,1.3]]){palm(g,x,.3,z,.7);g.box([x,.47,z+.8],[.9,.08,.65],m.plaster);}
 d.box(-3.9,.4,-4.75,1.5,.12,.6,m.wood);d.box(4.0,.4,-4.75,1.5,.12,.6,m.wood);
}
function marquee(g:Sculpture,x:number,z:number,label:string){
 const d=new PlaceDetails(g);g.box([x,1.55,z],[2.7,2.5,1.5],m.brick);g.box([x,2.9,z+.85],[3.05,.48,.85],m.vermilion);sign(g,label,x,2.93,z+1.29,2.8,.43,m.copper);
 for(let i=0;i<15;i++)g.box([x-1.35+i*.19,2.63,z+1.28],[.065,.07,.05],m.lamp,0,NEON);
 d.door(x,z+.8,.35,.85,1.9);for(const side of [-1,1])g.box([x+side*.95,1.55,z+.81],[.55,1.5,.05],m.glass,0,4);
}
function newYork(g:Sculpture,v:SceneVariant){
 const full=isBroadway(v);
 if(full){
  g.box([0,.29,-6.2],[23,.08,2.6],m.stone);for(let i=0;i<9;i++)g.box([-10+i*2.5,.34,-5.2],[.9,.02,.13],m.path);
  const labels=BROADWAY_PROGRAM.billboards;
  for(const [i,x]of [-9.6,-6.5,-3.25,0,3.25,6.5,9.6].entries()){
   const h=[7.0,5.8,4.8,4.3,4.8,5.8,7.0][i],w=2.35,z=-8.0-(i%2)*.35;
   g.box([x,.3+h/2,z],[w,h,1.65],i%2?m.brick:m.metal);g.box([x,h+.4,z],[w+.15,.18,1.85],m.stone);
   for(let row=0;row<Math.floor(h/.7);row++)for(let col=0;col<3;col++)g.box([x+(col-1)*.64,.85+row*.7,z+.84],[.36,.4,.025],(row+col)%3?m.glass:m.lamp,0,v.light==='night'?3.8:1);
   sign(g,labels[i],x,2.7+(i%2)*.5,z+.91,2.1,1.1,[m.glass,m.flower,m.vermilion,m.gold][i%4]);
   if(i%2===0){sign(g,'LIVE',x,h-.15,z+.93,1.75,.45,m.copper);g.box([x-w*.48,h*.57,z+.9],[.1,h*.8,.05],m.glass,0,NEON);}
  }
  for(const x of [-11.1,11.1]){g.box([x,3.8,-9.4],[1.6,7,1.8],m.metal);for(let row=0;row<9;row++)for(const dx of [-.42,.42])g.box([x+dx,.9+row*.7,-8.47],[.26,.34,.03],m.glass,0,v.light==='night'?3.8:1);g.beam([x,7.3,-9.4],[x,8.1,-9.4],.045,m.metal);}
  marquee(g,-4.4,-5.9,BROADWAY_PROGRAM.marquees[0]);marquee(g,4.4,-5.9,BROADWAY_PROGRAM.marquees[1]);
  sign(g,'BROADWAY',-8.9,3.6,-6.9,2.8,.5,m.flower);
  // Original lamp silhouette beside the Aladdin sign.
  g.crown([-3.25,4.45,-7.2],[.5,.18,.2],m.gold);g.beam([-2.9,4.46,-7.2],[-2.55,4.68,-7.2],.085,m.gold);g.ring([-3.25,4.66,-7.2],.14,.14,.09,m.gold,12);g.crown([-3.25,4.76,-7.2],[.055,.07,.055],m.gold);
  letters(g,'THEATRE DISTRICT',0,3.56,-7.04,.22,m.flower,NEON);
  sign(g,'TIMES SQUARE',0,4.15,-7.06,4.25,.52,m.glass);
  for(const x of [-11,-7.5,7.5,11]){g.beam([x,.3,-5.7],[x,2.3,-5.7],.055,m.ink);g.crown([x,2.32,-5.7],[.13,.13,.13],m.lamp);}
 }else{
  sign(g,'BROADWAY',9.9,2.5,-7.0,2.65,.65,m.copper);g.beam([9.9,.3,-7],[9.9,2.2,-7],.08,m.ink);
 }
 if(v.light==='night')for(const [x,z,mat]of [[-4.3,-4.8,m.flower],[4.3,-4.8,m.glass],[-9.4,-5.1,m.gold],[9.4,-5.1,m.vermilion]] as const)g.crown([x,.35,z],[.8,.025,.45],mat,0);
}
function hakuba(g:Sculpture){
 const d=new PlaceDetails(g);
 // A connected jagged Northern Alps ridge, replacing the solitary Yotei cone.
 for(const [i,[x,h,w]]of [[-8.5,3.3,2.3],[-5.1,4.4,2.5],[-1.6,5.2,2.7],[2.2,4.8,2.4],[5.8,3.9,2.4],[9,3.0,2]].entries()){
  const z=-8.0+(i%2)*.4;g.ring([x,.3,z],w,.1,h,m.stone,7,1,i*.5);g.ring([x,h*.45,z],w*.58,.04,h*.58,m.snow,7,1,i*.5);
 }
 // A broad piste with a gentle downhill grade and an adjacent drag-lift return lane.
 g.quad([-12.1,4.18,-5.6],[-12.1,.55,3.7],[-9.5,.55,3.7],[-9.5,4.18,-5.6],m.snow);
 for(const z of [-5.1,-2.3,.5,3.3]){const y=.55+(3.7-z)/9.3*3.63;g.beam([-9.65,y,z],[-9.65,y+1.8,z],.075,m.metal);g.beam([-10.1,y+1.8,z],[-9.4,y+1.8,z],.075,m.metal);}
 for(const x of [-10.3,-9.95])g.beam([x,5.78,-5.1],[x,2.5,3.3],.035,m.ink);
 for(const [i,x]of [-7.2,-3.6,0,3.6,7.2].entries()){
  const z=-6.3-(i%2)*.4;g.box([x,1.05,z],[2.5,1.5,1.25],m.wood);d.roof(x,1.85,z,2.8,1.6,.65,m.snow);
  for(const dx of [-.78,.78])g.box([x+dx,1.06,z+.65],[.53,.8,.035],m.lamp,0,3.8);
  sign(g,['SAKE','BAR','HAKUBA','JAZZ','SKI BAR'][i],x,1.9,z+.88,2.4,.42,i%2?m.flower:m.copper);
  for(let j=0;j<9;j++)g.crown([x-1.1+j*.27,2.2,z+.75],[.04,.04,.04],m.lamp);
 }
}
function chiangMai(g:Sculpture,v:SceneVariant){
 for(const z of [-5.6,-7.1]){g.beam([-10,3.4,z],[10,3.4,z],.028,m.wood);for(const side of [-1,1])g.beam([side*10,.3,z],[side*10,3.45,z],.07,m.wood);
  for(let i=0;i<7;i++){const x=-9+i*3,y=3.25-Math.sin(i/6*Math.PI)*.35;g.ring([x,y-.42,z],.13,.17,.4,v.light==='night'?m.gold:m.plaster,12,v.light==='night'?6:1);g.ring([x,y-.46,z],.15,.15,.04,m.gold,8);}}
 // Warm temple uplights echo the reference without adding festival visitors.
 if(v.light==='night')for(const [x,z,size]of [[-8.7,-6,1.12],[9.2,-7.1,.8]])for(let i=0;i<4;i++)g.ring([x,1.87+i*.37*size,z],(1.32-i*.2)*size,(1.32-i*.2)*size,.045,m.gold,12,3.8);
 sign(g,'YI PENG',-5,1.5,-5.3,2.6,.5,m.gold);
 if(v.light==='night')for(let i=0;i<24;i++){const a=i/24*Math.PI*2;g.crown([Math.cos(a)*10,.39,-5.6+Math.sin(a)*1.1],[.075,.1,.075],m.lamp,i);}
}
function makeActor(id:string,kind:CultureKind,phase:number,side=0):CultureActor{
 const g=new Sculpture();let limbs:Limb[]=[];
 if(kind==='wind-leaf'){g.quad([-.12,0,0],[0,.035,-.07],[.14,0,0],[0,-.015,.07],id.endsWith('0')?m.gold:m.copper);g.quad([0,-.015,.07],[.14,0,0],[0,.035,-.07],[-.12,0,0],m.copper);return {id,kind,mesh:new Float32Array(g.values),limbs,phase,side};}
 if(kind==='taxi-queue')return {id,kind,mesh:makeRoadVehicle('taxi'),limbs,phase,side};
 if(kind==='genie'){
  // Original friendly blue stage genie, floating above a little brass lamp.
  g.crown([0,.15,0],[.4,.14,.22],m.gold);g.beam([.25,.17,0],[.57,.3,0],.06,m.gold);
  for(let i=0;i<6;i++){const a=i*.8;g.crown([Math.sin(a)*.12,.35+i*.12,Math.cos(a)*.07],[.09+i*.025,.11,.09+i*.016],m.water);}
  g.crown([0,1.27,0],[.38,.48,.25],m.water);g.box([0,.91,0],[.54,.12,.38],m.gold);g.crown([0,1.94,0],[.27,.3,.24],m.water);
  g.crown([0,2.17,-.02],[.23,.11,.22],m.ink);g.crown([0,2.31,-.03],[.09,.14,.09],m.ink);
  for(const dx of [-.1,.1]){g.crown([dx,1.98,.22],[.065,.067,.03],m.plaster);g.crown([dx,1.98,.247],[.026,.035,.012],m.ink);}
  g.beam([-.09,1.81,.22],[.09,1.81,.22],.025,m.ink);g.crown([.28,1.98,0],[.045,.07,.03],m.gold);
  g.beam([-.28,1.52,0],[-.58,1.2,.08],.14,m.water);g.beam([-.58,1.2,.08],[-.16,1.18,.27],.13,m.water);g.crown([-.16,1.18,.27],[.11,.1,.09],m.water);
  const start=g.values.length;g.beam([.27,1.56,0],[.54,1.75,0],.14,m.water);g.beam([.54,1.75,0],[.55,2.07,0],.12,m.water);g.ring([.55,1.94,0],.1,.1,.1,m.gold,10);g.crown([.55,2.15,0],[.11,.14,.07],m.water);limbs=[{start,end:g.values.length,pivot:[.27,1.56,0],axis:'z',amount:.13,phase:0}];
 }else if(kind==='sky-lantern'){
  // Open, rounded paper shell with a warm candle at its lower opening.
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2,b=(i+1)/14*Math.PI*2,r=.15;g.quad([Math.cos(a)*r,0,Math.sin(a)*r],[Math.cos(a)*r,.42,Math.sin(a)*r],[Math.cos(b)*r,.42,Math.sin(b)*r],[Math.cos(b)*r,0,Math.sin(b)*r],m.gold,6);}
  g.ring([0,.012,0],.126,.126,.015,m.copper,14);g.ring([0,.41,0],.151,.151,.018,m.gold,14,6);g.beam([-.13,.025,0],[.13,.025,0],.012,m.wood);g.crown([0,.06,0],[.038,.07,.038],m.lamp,0);
 }else if(kind==='speedboat'){
  g.crown([0,.13,0],[1.05,.2,.32],m.plaster);g.box([-.15,.28,0],[1.1,.08,.5],m.copper);g.box([.35,.48,0],[.09,.4,.5],m.glass);g.box([-.84,.1,0],[.15,.36,.18],m.ink);limbs=person(g,m.vermilion,'sit');
  for(const s of [-1,1])g.beam([-1.1,.01,s*.18],[-1.3,.01,s*.25],.045,m.plaster);
 }else if(kind==='kayaker'){
  g.crown([0,.1,0],[.83,.14,.23],m.copper);g.crown([0,.23,0],[.34,.04,.18],m.ink);person(g,m.vermilion,'sit');const start=g.values.length;g.beam([.17,.83,-.8],[.17,.83,.8],.035,m.wood);for(const s of [-1,1])g.box([.17,.83,s*.83],[.12,.04,.29],m.gold);limbs=[{start,end:g.values.length,pivot:[.17,.83,0],axis:'x',amount:.45,phase:0}];
 }else if(kind==='paddler'){
  g.crown([0,.04,0],[.82,.055,.25],m.plaster);person(g,m.glass,'stand');const start=g.values.length;g.beam([.22,.92,.25],[.4,-.08,.44],.035,m.wood);g.box([.4,-.06,.44],[.1,.25,.045],m.ink);limbs=[{start,end:g.values.length,pivot:[.22,.92,.25],axis:'z',amount:.3,phase:0}];
 }else if(kind==='surfer'){
  g.crown([0,.03,0],[.7,.05,.23],m.vermilion);person(g,m.glass,'surf');
 }else if(kind==='skier'){
  limbs=person(g,id.endsWith('0')?m.vermilion:m.glass,'ski');for(const s of [-1,1]){g.box([.12,-.015,s*.11],[.95,.045,.07],m.copper);g.beam([.22,.64,s*.22],[-.2,-.03,s*.36],.025,m.metal);}
 }else if(kind==='lift'){
  g.box([0,.3,0],[.6,.1,.42],m.vermilion);g.beam([0,.05,0],[0,1.15,0],.04,m.ink);g.box([-.23,.62,0],[.06,.5,.42],m.wood);person(g,m.flower,'sit');
 }else{
  limbs=person(g,side<0?m.copper:m.flower,'walk');if(id.includes('market'))g.crown([.24,.45,.23],[.15,.12,.15],m.gold);
 }
 return {id,kind,mesh:new Float32Array(g.values),limbs,phase,side};
}
export function makeCultureScene(v:SceneVariant){
 const g=new Sculpture(),actors:CultureActor[]=[];
 if(v.season==='autumn')for(let i=0;i<24;i++)actors.push(makeActor(`gust-leaf-${i}`,'wind-leaf',i/24));
 if(isCoastal(v)){
  coast(g,v.place==='krabi');actors.push(makeActor('surf-0','surfer',0),makeActor('kayak-0','kayaker',0),makeActor('kayak-1','kayaker',.5),makeActor('paddle-0','paddler',0),makeActor('speedboat-0','speedboat',0));
 }else if(v.place==='hokkaido'){
  hakuba(g);actors.push(makeActor('ski-0','skier',0),makeActor('ski-1','skier',.34),makeActor('ski-2','skier',.67),makeActor('lift-0','lift',0));
 }else if(v.city==='nyc'){
  newYork(g,v);if(isBroadway(v)){actors.push(makeActor('street-genie','genie',0));for(let i=0;i<12;i++)actors.push(makeActor(`queued-taxi-${i}`,'taxi-queue',i));}
 }else if(v.place==='inthanon'){
  chiangMai(g,v);if(v.light==='night')for(let i=0;i<10;i++)actors.push(makeActor(`festival-${i}`,'sky-lantern',i/10,i%2?-1:1));
 }else if(v.city==='tokyo'){
  // A few local paper lights and tiny food/tea signs enliven the garden streets.
  sign(g,v.place==='kyoto'?'TEA':'ART',-4.4,1.8,-3.8,1.2,.45,m.copper);for(const x of [-4.8,4.8]){g.beam([x,.3,-3.5],[x,2,-3.5],.04,m.wood);g.crown([x,2,-3.5],[.16,.23,.16],m.lamp);}
 }
 return {base:new Float32Array(g.values),actors};
}
