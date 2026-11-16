import type {Sculpture,MATERIAL,Material} from './world.ts';
import type {SceneVariant} from './variants.ts';
import type {V3} from './math.ts';
/** Large original seasonal set pieces. Every installation sits outside the two entry routes. */
export function addSeasonDetails(g:Sculpture,m:typeof MATERIAL,v:SceneVariant){
  const pond=(x:number,z:number,rx:number,rz:number,ice=false)=>{
    g.crown([x,.37,z],[rx+.22,.12,rz+.22],ice?m.snow:m.stone);
    g.crown([x,.48,z],[rx,.07,rz],m.water);
  };
  const parasol=(x:number,z:number,material:Material,r=1.35)=>{
    g.beam([x,.35,z],[x,2.7,z],.07,m.wood);
    g.ring([x,2.3,z],r,.06,.5,material,12);
    g.ring([x,.9,z],.55,.55,.08,m.wood,16);
    for(const dx of [-.85,.85])g.box([x+dx,.5,z],[.4,.45,.5],m.plaster);
  };
  const stall=(x:number,z:number,cloth:Material)=>{
    for(const dx of [-1.45,1.45])for(const dz of [-.8,.8])g.beam([x+dx,.35,z+dz],[x+dx,2.6,z+dz],.09,m.wood);
    g.box([x,1.1,z+.5],[3.1,.75,.8],m.wood);g.box([x,1.52,z+.5],[3.3,.1,1],m.plaster);
    for(let i=0;i<6;i++){
      const a=x-1.8+i*.6,b=a+.6,material=i%2?m.plaster:cloth;
      g.quad([a,2.6,z+1.2],[b,2.6,z+1.2],[b,3.2,z],[a,3.2,z],material);
      g.quad([a,3.2,z],[b,3.2,z],[b,2.6,z-1.2],[a,2.6,z-1.2],material);
      g.box([(a+b)/2,2.45,z+1.2],[.6,.3,.04],material);
    }
  };
  const pumpkin=(x:number,y:number,z:number,r=.3)=>{
    g.crown([x,y,z],[r,r*.8,r],m.flower,x);
    g.beam([x,y+r*.7,z],[x+.04,y+r*1.15,z],.05,m.wood);
  };
  const snowman=(x:number,z:number)=>{
    g.crown([x,1,z],[.75,.75,.7],m.snow);g.crown([x,1.9,z],[.53,.57,.5],m.snow);
    g.ring([x,2.42,z],.62,.62,.1,m.ink,12);g.ring([x,2.5,z],.4,.36,.45,m.ink,12);
    for(const y of [.8,1.15,1.5])g.box([x,y,z+.67],[.09,.09,.05],m.ink);
    for(const dx of [-.18,.18])g.box([x+dx,2.05,z+.45],[.08,.08,.08],m.ink);
    g.beam([x,1.9,z+.48],[x,1.85,z+.9],.11,m.copper);
    g.box([x,1.65,z],[1.05,.18,1.02],m.vermilion);
    for(const side of [-1,1])g.beam([x+side*.55,1.25,z],[x+side*1.3,1.85,z],.07,m.wood);
  };
  const floweringBank=(x:number,z:number,color:Material)=>{
    g.crown([x,.46,z],[2.35,.18,1.4],m.leaf,x);
    for(let i=0;i<5;i++)g.crown([x+Math.sin(i*2.4)*1.65,.72,z+Math.cos(i*2.4)*.75],[.65,.23,.42],color,i);
  };
  const bridge=(x:number,z:number)=>{
    for(let i=0;i<9;i++){
      const t=i/8,zz=z-1.8+t*3.6,y=.55+Math.sin(t*Math.PI)*.65;
      g.box([x,y,zz],[1.9,.13,.43],m.vermilion);
      for(const side of [-1,1]){
        g.beam([x+side*.95,y,zz],[x+side*.95,y+.65,zz],.06,m.vermilion);
        if(i<8){const nt=(i+1)/8;g.beam([x+side*.95,y+.65,zz],[x+side*.95,1.2+Math.sin(nt*Math.PI)*.65,z-1.8+nt*3.6],.07,m.vermilion);}
      }
    }
  };
  if(v.city==='nyc'){
    if(v.season==='spring'){
      floweringBank(-9.2,3.2,m.flower);floweringBank(9.6,3.2,m.flower);
      // Tall white garden trellises give spring its own silhouette.
      for(const x of [-10,10.2]){
        for(const dx of [-1.2,1.2])g.beam([x+dx,.4,1.5],[x+dx,2.9,1.5],.1,m.plaster);
        g.beam([x-1.35,2.9,1.5],[x+1.35,2.9,1.5],.12,m.plaster);
        for(const dx of [-1,-.3,.4,1.1])g.box([x+dx,2.95,1.5],[.08,.12,1.2],m.plaster);
      }
    }else if(v.season==='summer'){
      pond(-8.4,3.3,3,2.1);
      parasol(-10.2,5.5,m.copper);parasol(10,3.8,m.copper,1.7);
      // Open poolside deck with broad striped towels and loungers.
      g.box([9.8,.42,2.8],[3.6,.15,4.2],m.path);
      for(const x of [8.9,10.8]){
        g.box([x,.65,2],[.7,.3,1.7],m.plaster);g.box([x,.85,1.3],[.7,.55,.2],m.copper);
        g.box([x,.83,2.3],[.6,.03,.9],m.flower);
      }
    }else if(v.season==='autumn'){
      for(const x of [-10,10]){
        stall(x,3,m.copper);
        for(let i=0;i<5;i++)pumpkin(x-1.1+i*.55,1.85,3.5,.26+(i%2)*.07);
        for(const dx of [-1,0,1])pumpkin(x+dx,.75,5.1,.4);
      }
    }else if(v.season==='winter'){
      pond(-8.7,3,3.05,2.35,true);
      // A complete rail silhouette reads as an ice rink at small sizes.
      for(let i=0;i<14;i++){
        const a=i/14*Math.PI*2,b=(i+1)/14*Math.PI*2;
        const point=(angle:number,y:number):V3=>[-8.7+Math.cos(angle)*3.25,y,3+Math.sin(angle)*2.55];
        g.beam(point(a,.48),point(a,1.05),.055,m.metal);g.beam(point(a,1.05),point(b,1.05),.065,m.plaster);
      }
      snowman(9.8,3);g.box([9.7,.55,5],[3,.35,1.1],m.snow);
    }
  }else if(v.city==='tokyo'){
    if(v.season==='spring'){
      // Large hanami picnic islands beneath the blossom crowns.
      for(const x of [-9.3,9.6]){
        g.crown([x,.4,3.3],[2.5,.1,1.7],m.flower);
        g.box([x,.55,3.3],[2.7,.04,1.8],m.vermilion);
        for(const dx of [-.9,0,.9])g.box([x+dx,.58,3.3],[.05,.03,1.8],m.plaster);
        g.box([x,.8,3.3],[1.7,.3,.8],m.wood);
        for(const dx of [-.5,.5])g.ring([x+dx,.97,3.3],.12,.16,.17,m.plaster,10);
        for(const dx of [-1.8,1.8]){
          g.beam([x+dx,.4,2],[x+dx,2.7,2],.06,m.wood);g.crown([x+dx,2.65,2],[.34,.48,.34],m.lamp);
        }
      }
    }else if(v.season==='summer'){
      // Prominent original festival tower, well outside the studio entrance.
      const x=-10,z=3;
      g.box([x,.6,z],[3.7,.5,3.3],m.wood);
      for(const dx of [-1.2,1.2])for(const dz of [-1,1])g.beam([x+dx,.7,z+dz],[x+dx,3.8,z+dz],.12,m.vermilion);
      g.box([x,2.1,z],[2.7,.2,2.4],m.wood);
      for(let i=0;i<7;i++)g.box([x-1.4+i*.46,2.65,z+1.2],[.46,1,.06],i%2?m.plaster:m.vermilion);
      g.ring([x,3.8,z],2.15,.15,.8,m.vermilion,4,1,Math.PI/4);
      for(const dx of [-1.5,1.5])for(const dz of [-1.3,1.3])g.crown([x+dx,3.3,z+dz],[.25,.34,.25],m.lamp);
      pond(9.6,3.3,2.2,2.1);
      for(let i=0;i<5;i++)g.ring([8.4+i*.5,.58,3+Math.sin(i)*.7],.3,.3,.025,m.leaf,10);
    }else if(v.season==='autumn'){
      pond(-9.2,3.2,2.7,2.25);bridge(-9.2,3.2);
      stall(10,3,m.vermilion);
      for(let i=0;i<5;i++)pumpkin(8.9+i*.55,1.8,3.5,.27); // Stylized persimmon harvest display.
    }else if(v.season==='winter'){
      // Deep sculpted snowdrifts replace the garden silhouette.
      for(const [x,z]of [[-8.6,5.3],[9.8,2.3],[9.1,5]])g.crown([x,.55,z],[2.25,.48,1.5],m.snow,x);
      snowman(9.8,3.5);
      // Snow follows both pitched studio roof planes rather than a thin trim.
      for(const [x,y,z,w,d]of [[-5.3,3.1,-2.8,4.8,4],[-5.8,4,-3.1,3,2.5]]){
        g.quad([x-w/2,y+.18,z+d/2],[x+w/2,y+.18,z+d/2],[x+w*.28,y+1.08,z],[x-w*.28,y+1.08,z],m.snow);
        g.quad([x-w*.28,y+1.08,z],[x+w*.28,y+1.08,z],[x+w/2,y+.18,z-d/2],[x-w/2,y+.18,z-d/2],m.snow);
      }
    }
  }else if(v.city==='bangkok'){
    if(v.season==='raining'){
      // A broad canal garden and high timber boardwalk, not flooded entry routes.
      pond(-9,3.1,3,2.8);pond(9.8,3,2.1,2.5);
      for(let i=0;i<15;i++)g.box([-9.1,.8,.3+i*.4],[1.45,.13,.34],m.wood);
      for(const z of [.5,2.5,4.5,5.8])for(const dx of [-.7,.7]){
        g.beam([-9.1+dx,.35,z],[-9.1+dx,1.45,z],.065,m.wood);
      }
      stall(10,2.5,m.ink);
      // Long-tail boat: open hull, seating and a long aft motor pole.
      g.ring([-11,.53,3.2],.5,.72,.2,m.wood,4,1,Math.PI/4);
      g.box([-11,.78,3.2],[.6,.16,2.5],m.copper);
      g.beam([-11,.7,4.3],[-11,.4,6],.055,m.metal);
    }else if(v.season==='summer'){
      pond(-9,3,2.8,2.4);
      for(const dx of [-1,1]){
        g.beam([-9+dx,.6,3],[-9+dx*.4,2.1,3],.07,m.water,1.4);
        g.beam([-9+dx*.4,2.1,3],[-9,1.8,3],.06,m.water,1.4);
      }
      stall(10,3,m.vermilion);floweringBank(9.9,5.6,m.flower);
      for(let i=0;i<4;i++)pumpkin(8.9+i*.7,1.8,3.5,.32); // Original summer fruit display.
    }else if(v.season==='winter'){
      // Cool-season market: substantial pale canopies and a tall lantern pavilion.
      stall(-10,3,m.plaster);
      const x=10,z=3;
      for(const dx of [-1.5,1.5])g.beam([x+dx,.4,z],[x+dx,4.2,z],.1,m.gold);
      g.beam([x-1.6,4.2,z],[x+1.6,4.2,z],.12,m.gold);
      for(const dx of [-1.05,0,1.05])for(const y of [1.8,2.8,3.8])g.crown([x+dx,y,z],[.38,.43,.38],m.lamp,dx+y);
      g.box([x,.52,z],[3.5,.3,2.2],m.wood);
      g.beam([-4,3.6,-4.6],[4,3.6,-4.6],.035,m.wood);
      for(const x of [-4,4])g.beam([x,.4,-4.6],[x,3.6,-4.6],.05,m.wood);
      for(let i=0;i<9;i++)g.crown([-3.6+i*.9,3.1,-4.6],[.24,.3,.24],m.lamp,i);
    }
  }
}
