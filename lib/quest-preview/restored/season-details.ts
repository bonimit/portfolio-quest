import type {Sculpture,MATERIAL} from './world.ts';
import type {SceneVariant} from './variants.ts';
/** Small original seasonal installations keep the two destination approaches clear. */
export function addSeasonDetails(g:Sculpture,m:typeof MATERIAL,v:SceneVariant){
  const parasol=(x:number,z:number,material:typeof m.copper|typeof m.vermilion)=>{
    g.beam([x,.35,z],[x,2.5,z],.055,m.wood);
    g.ring([x,2.15,z],1.15,.06,.5,material,10);
    g.ring([x,.75,z],.52,.52,.07,m.wood,16);
    for(const dx of [-.75,.75])g.box([x+dx,.5,z],[.35,.45,.45],m.plaster);
  };
  if(v.city==='nyc'){
    if(v.season==='spring'){
      for(const x of [-8.2,8.4]){
        g.box([x,.48,3.4],[1.6,.3,.7],m.brick);
        for(let i=0;i<7;i++){
          const px=x-.65+i*.21;
          g.beam([px,.6,3.4],[px,.95+(i%2)*.12,3.4],.035,m.evergreen);
          g.crown([px,1.02+(i%2)*.12,3.4],[.12,.18,.12],m.flower,i);
        }
      }
    }else if(v.season==='summer'){
      parasol(-8,4.3,m.copper);parasol(9.4,3,m.copper);
      g.box([7.7,.37,5.1],[1.5,.035,1.1],m.flower);
      for(const dx of [-.4,.4])g.box([7.7+dx,.4,5.1],[.05,.035,1.1],m.plaster);
    }else if(v.season==='autumn'){
      for(const x of [-8.2,8.7])for(let i=0;i<3;i++){
        const px=x+(i-1)*.45,pz=3.5+(i%2)*.3,r=.25+(i%2)*.1;
        g.crown([px,.35+r,pz],[r,r*.85,r],m.flower,i);
        g.beam([px,.35+r*1.8,pz],[px+.04,.35+r*2.2,pz],.045,m.wood);
      }
      g.box([8.7,.42,4.5],[1.6,.15,.6],m.wood);
    }
  }else if(v.city==='tokyo'&&v.season==='summer'){
    // Courtyard festival streamers and round paper fans, distinct from blossom season.
    for(const x of [-8.8,8.8]){
      g.beam([x,.4,2.5],[x,3.3,2.5],.05,m.wood);
      g.box([x,2.6,2.5],[.5,1.1,.025],m.vermilion);
      g.box([x,2.65,2.53],[.08,.8,.02],m.plaster);
    }
    for(const x of [-7.8,7.8]){
      g.beam([x,.4,4.7],[x,1.2,4.7],.04,m.wood);
      g.crown([x,1.4,4.7],[.3,.3,.035],m.flower);
    }
  }else if(v.city==='bangkok'){
    if(v.season==='summer'){
      parasol(-9,4.2,m.vermilion);
      for(const [x,z]of [[7.8,3.2],[-9.3,.2]]){
        g.ring([x,.35,z],.4,.5,.4,m.brick,12);
        g.crown([x,1,z],[.7,.5,.6],m.leaf);
        for(let i=0;i<5;i++)g.crown([x+Math.sin(i*2)*.55,1.25+Math.cos(i*2)*.2,z+.3],[.18,.16,.15],m.flower,i);
      }
      for(let i=0;i<5;i++){
        const x=-8.3+Math.sin(i*2)*.5,z=.1+i*.5;
        g.ring([x,.4,z],.18,.18,.02,m.leaf,10);
        g.crown([x,.47,z],[.08,.1,.08],m.flower);
      }
    }else if(v.season==='raining'){
      // Visible shelter and collecting barrels accompany the existing rain and puddles.
      parasol(9,2.5,m.vermilion);
      for(const x of [-9,8.4]){
        g.ring([x,.4,4.8],.3,.35,.65,m.metal,12);
        g.ring([x,1.06,4.8],.29,.29,.025,m.water,12);
      }
    }else if(v.season==='winter'){
      // Cool dry-season lantern market, no snow.
      g.beam([-4,3.6,-4.6],[4,3.6,-4.6],.035,m.wood);
      for(const x of [-4,4])g.beam([x,.4,-4.6],[x,3.6,-4.6],.05,m.wood);
      for(let i=0;i<9;i++){
        const x=-3.6+i*.9;g.beam([x,3.6,-4.6],[x,3.2,-4.6],.025,m.wood);
        g.crown([x,3,-4.6],[.22,.28,.22],m.lamp,i);
      }
      for(const x of [-8.6,8.6])for(let i=0;i<4;i++)g.crown([x+Math.sin(i*2)*.4,.65,3+Math.cos(i*2)*.4],[.2,.22,.2],m.flower,i);
    }
  }
}
