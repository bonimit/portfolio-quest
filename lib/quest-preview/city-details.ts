import type {Sculpture,MATERIAL} from './world.ts';
import {addTokyoSeasons} from './tokyo-seasons.ts';
import type {SceneVariant} from './variants.ts';
type Materials=typeof MATERIAL;
/** Original architectural details; the owner's raster is a visual reference only. */
export function addCityDetails(g:Sculpture,m:Materials,v:SceneVariant){
  const planter=(x:number,y:number,z:number,size=.35)=>{
    g.box([x,y,z],[size,.22,size],m.brick);
    g.crown([x,y+.25,z],[size*.65,.22,size*.6],m.evergreen,x+z);
  };
  const facade=(x:number,z:number,w:number,h:number,columns:number)=>{
    const floors=Math.floor(h/.72);
    for(let row=0;row<floors;row++)for(let col=0;col<columns;col++){
      const bx=x-w*.38+(columns===1?0:col/(columns-1)*w*.76),by=.8+row*.72;
      g.box([bx,by,z],[w/columns*.52,.43,.055],m.ink);
      g.box([bx,by,z+.04],[w/columns*.38,.32,.025],m.glass);
      g.box([bx,by-.24,z+.07],[w/columns*.65,.055,.13],m.plaster);
    }
    for(let i=0;i<=columns;i++)g.box([x-w/2+i/columns*w,h/2+.3,z+.08],[.045,h,.07],m.plaster);
    for(const y of [.4,h+.25,h+.4])g.box([x,y,z-.5],[w+.12,.08,1.1],m.plaster);
  };
  if(v.city==='nyc'){
    // Street-wall detail: cornices, pilasters, brickwork, rooftop machinery and gardens.
    for(const [x,z,w,h]of [[-2,-7.3,1.3,5.8],[-.25,-7.3,1.5,7.1],[1.6,-7.6,1.2,5.1],[3.2,-7,1.4,6],[4.9,-7.4,1,4.5]]){
      facade(x,z+.58,w,h,3);
      g.box([x,h+.7,z],[w*.7,.35,.75],m.plaster);
      for(const dx of [-.3,.3])g.box([x+dx,h+.95,z],[.15,.2,.35],m.metal);
      for(let i=0;i<4;i++)g.box([x-w*.4+i*w*.27,h+.55,z+.5],[.035,.3,.035],m.metal);
      g.beam([x-w*.45,h+.7,z+.5],[x+w*.45,h+.7,z+.5],.035,m.metal);
    }
    for(const x of [-8.5,-5.3,-2.4]){
      const h=x===-5.3?5.85:x===-8.5?4.75:5.15;
      for(const dx of [-1.05,1.05])g.box([x+dx,h/2,-1.38],[.11,h,.15],m.plaster);
      for(let i=0;i<8;i++)g.box([x-1.2+i*.34,h-.12,-1.3],[.13,.2,.23],m.plaster);
      for(const dx of [-.75,.75])planter(x+dx,h+.25,-2.6,.4);
      g.box([x+.5,h+.35,-3.5],[.6,.6,.5],m.metal);
      for(let i=0;i<4;i++)g.box([x+.5,h+.38+i*.1,-3.23],[.45,.035,.03],m.ink);
      for(const y of [1.35,3,4.65]){
        g.box([x-.9,y,-1.28],[.06,.7,.05],m.plaster);
        g.box([x+.9,y,-1.28],[.06,.7,.05],m.plaster);
      }
    }
    // Clocked art-deco cap on the central tower and a slender spire.
    for(let i=0;i<3;i++)g.box([-.25,7.55+i*.23,-7.3],[1.2-i*.27,.22,.85-i*.16],m.plaster);
    g.beam([-.25,8.1,-7.3],[-.25,9.1,-7.3],.045,m.metal);
    for(const x of [-9.5,8.8]){
      g.box([x,.38,1.3],[1.2,.12,2.4],m.path);
      for(const z of [.5,2.1])g.beam([x,.4,z],[x,1,z],.05,m.metal);
      g.beam([x,1,.5],[x,1,2.1],.05,m.metal);
    }
  }else if(v.city==='tokyo'){
    // Mount Fuji is a deliberately stylized geographic backdrop to the Tokyo study.
    const levels=[[3.6,.3],[2.9,1.1],[1.95,2.4],[1,3.8],[.4,4.9],[.22,5.2]];
    for(let row=1;row<levels.length;row++)for(let i=0;i<28;i++){
      const point=(j:number,r:number,y:number):[number,number,number]=>{
        const a=j/28*Math.PI*2;return [Math.cos(a)*r*1.35,y*1.42,-8.5+Math.sin(a)*r*.72];
      };
      const [r0,y0]=levels[row-1],[r1,y1]=levels[row];
      const snow=row>=(v.season==='winter'?2:v.season==='summer'?5:4);
      g.quad(point(i,r0,y0),point(i,r1,y1),point(i+1,r1,y1),point(i+1,r0,y0),snow?m.snow:m.rock,.92+.08*Math.sin(i*2.3));
    }
    g.ring([0,5.15*1.42,-8.5],.22*1.35,.22*1.35,.08*1.42,m.snow,28);
    addTokyoSeasons(g,m,v);
    // Three-tier pagoda: swept eaves, vermilion columns and gilded finial.
    const px=8.3,pz=-5.6;
    for(let floor=0;floor<3;floor++){
      const y=.6+floor*1.1,w=2.3-floor*.35;
      g.box([px,y+.35,pz],[w*.65,.8,w*.6],m.vermilion);
      g.box([px,y+.85,pz],[w,.13,w*.9],m.metal);
      g.ring([px,y+.87,pz],w*.7,w*.15,.55,m.rock,4,1,Math.PI/4);
      for(const dx of [-1,1])g.beam([px+dx*w*.45,y+.85,pz+.5],[px+dx*w*.6,y+1.04,pz+.5],.07,m.gold);
    }
    g.beam([px,4.3,pz],[px,5.1,pz],.045,m.gold);
    for(let i=0;i<5;i++)g.ring([px,4.35+i*.13,pz],.16,.16,.045,m.gold,12);
    // Shop awnings, tile ridges, paper lanterns and lattice detail.
    for(const x of [-1.1,.65,2.2]){
      g.box([x,1.3,-5.45],[1.05,1.2,.025],m.glass);
      for(let i=0;i<5;i++)g.box([x-.5+i*.25,1.3,-5.42],[.035,1.6,.04],m.wood);
      g.box([x,2.2,-5.1],[1.35,.12,.65],m.vermilion);
      for(const dx of [-.45,.45]){
        g.crown([x+dx,1.8,-4.9],[.14,.23,.14],m.lamp);
        g.box([x+dx,1.8,-4.74],[.03,.25,.02],m.vermilion);
      }
    }
    for(let i=0;i<13;i++){
      const x=-7.6+i*.36;
      g.beam([x,3.3,-1],[x*.55-2.4,4.1,-2.8],.035,m.plaster,.8);
    }
    for(const x of [-7.2,-3.4,3.3,6.9])planter(x,.5,-1,.45);
  }else{
    // Temple roof ornaments and a chedi-like stepped silhouette, without copied iconography.
    for(const y of [2.95,3.9])for(const side of [-1,1]){
      g.beam([5.1+side*1.4,y,-1.5],[5.1+side*1.8,y+.7,-1.5],.085,m.gold);
      g.beam([5.1+side*1.8,y+.7,-1.5],[5.1+side*1.68,y+1,-1.5],.06,m.gold);
    }
    for(let i=0;i<7;i++)g.ring([5.1,4.4+i*.23,-2.7],.6-i*.065,.52-i*.065,.22,m.gold,16);
    g.ring([5.1,6,-2.7],.16,.015,1.1,m.gold,16);
    for(const dx of [-.95,.95]){
      g.box([5.1+dx,1.5,-2.48],[.1,2.2,.1],m.gold);
      for(let i=0;i<5;i++)g.ring([5.1+dx,.6+i*.4,-2.48],.09,.09,.06,m.gold,8);
    }
    // Open-sided tuk-tuk: three wheels, roof, driver screen, bench and chrome rails.
    const x=9.1,z=4.3;
    g.box([x,.7,z],[1.25,.5,2.1],m.evergreen);
    g.box([x,1.55,z+.3],[1.45,.16,1.65],m.vermilion);
    for(const dx of [-.57,.57])for(const dz of [-.4,1])g.beam([x+dx,.75,z+dz],[x+dx,1.55,z+dz],.045,m.gold);
    g.box([x,1,z+.75],[1.05,.35,.35],m.vermilion);
    g.box([x,1.2,z-.65],[1.05,.55,.04],m.glass);
    g.box([x,.6,z-1.1],[.7,.25,.35],m.gold);
    g.crown([x,.35,z-1],[.15,.3,.3],m.ink);
    for(const dx of [-.68,.68])g.crown([x+dx,.35,z+.7],[.17,.3,.3],m.ink);
    for(const dx of [-.42,.42])g.crown([x+dx,.75,z-1.1],[.12,.1,.06],m.lamp);
    g.beam([x-.6,.9,z+.95],[x+.6,.9,z+.95],.035,m.metal);
    // Market baskets, fruit pyramids and striped awnings.
    for(const x of [-1.6,.4,2.4]){
      for(const dx of [-.4,.1,.5]){
        g.ring([x+dx,1.3,-5.1],.2,.25,.16,m.wood,12);
        for(let i=0;i<3;i++)g.crown([x+dx+Math.sin(i*2)*.12,1.6,-5.1+Math.cos(i*2)*.12],[.13,.13,.13],m.flower,i);
      }
      for(let i=0;i<5;i++)g.box([x-.65+i*.32,2.16,-4.93],[.15,.08,.55],m.plaster);
    }
    g.ring([-7.9,.44,-.9],.65,.85,.18,m.wood,16);
    g.box([-7.9,.7,-.9],[.45,.08,1.1],m.vermilion);
  }
  // Seasonal architecture: broad roof snow is visible in both WebGL and fallback views.
  if(v.season==='winter'&&v.city!=='bangkok'){
    if(v.city==='nyc'){
      for(const [x,y,z,w,d]of [[-8.5,4.87,-3.1,2.5,2.5],[-5.3,6,-2.8,3.5,2.95],[-2.4,5.27,-3.1,2.5,2.5],[5.1,3.85,-3,4.8,2.8]])g.box([x,y,z],[w,.14,d],m.snow);
    }else{
      g.box([-5.3,3.4,-1.1],[4.8,.1,.45],m.snow);
      g.box([5.1,4.55,-2.7],[4.8,.11,.6],m.snow);
    }
    for(let i=0;i<22;i++){
      const x=-10+(i*3.7)%20,z=-5+(i*2.3)%12;
      if(Math.abs(x)>2)g.crown([x,.37,z],[.4,.12,.27],m.snow,i);
    }
  }
  if(v.season==='spring')for(const x of [-8,7.6])for(let i=0;i<8;i++)g.crown([x+Math.sin(i*2)*.7,.5,2+Math.cos(i*2)*.7],[.15,.15,.15],m.flower,i);
  if(v.season==='summer')for(const x of [-9,9])planter(x,.45,1,.6);
  if(v.season==='autumn')for(let i=0;i<16;i++)g.box([-9+(i*3.17)%18,.38,1+(i*1.9)%5],[.22,.04,.18],m.copper,i);
}
