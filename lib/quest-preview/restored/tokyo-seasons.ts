import type {Sculpture,MATERIAL} from './world.ts';
import type {SceneVariant} from './variants.ts';
import type {V3} from './math.ts';
/** Original seasonal vignettes; a playful Japan study, not a literal Tokyo ski resort. */
export function addTokyoSeasons(g:Sculpture,m:typeof MATERIAL,v:SceneVariant){
  if(v.city!=='tokyo')return;
  if(v.season==='spring'){
    // Airy five-petal blossoms at the front of the existing pink crowns.
    for(const [x,z,s]of [[-9.5,-.4,.82],[9.4,.1,.84],[7.7,4.7,.74],[-5.6,5.9,.7]]){
      for(let i=0;i<9;i++){
        const a=i*2.4,cx=x+Math.cos(a)*s*.8,cy=(2.5+Math.sin(i*1.7)*.6)*s,cz=z+.72*s;
        for(let petal=0;petal<5;petal++){
          const a=petal*Math.PI*2/5,b=a+.8;
          g.tri([cx,cy,cz+.04],[cx+Math.cos(a)*.19,cy+Math.sin(a)*.19,cz],[cx+Math.cos(b)*.19,cy+Math.sin(b)*.19,cz],m.flower,1.1);
        }
        g.crown([cx,cy,cz+.05],[.035,.035,.025],m.gold,i);
      }
    }
    // A few larger fallen petals beside the pond, clear of both entrances.
    for(let i=0;i<12;i++)g.tri([-9+i*.22,.4,2.7],[-8.85+i*.22,.4,2.8],[-9+i*.22,.43,2.98],m.flower);
  }else if(v.season==='autumn'){
    // Kaki: round orange fruit, short stems and green four-point calyces.
    for(const [x,z,s]of [[-9.5,-.4,.82],[9.4,.1,.84],[7.7,4.7,.74],[-5.6,5.9,.7]])for(let i=0;i<5;i++){
      const cx=x+Math.sin(i*2.3)*s*.65,cy=(2.35+Math.cos(i*1.7)*.35)*s,cz=z+.72*s;
      g.crown([cx,cy,cz],[.15,.15,.14],m.flower,i);
      g.beam([cx,cy+.13,cz],[cx,cy+.24,cz],.025,m.wood);
      for(let j=0;j<4;j++){
        const a=j*Math.PI/2;
        g.tri([cx-.035,cy+.14,cz],[cx+Math.cos(a)*.13,cy+.16,cz+Math.sin(a)*.13],[cx+.035,cy+.14,cz],m.evergreen);
      }
    }
    // A small harvest basket reinforces the fruit silhouette at mobile scale.
    g.ring([-8,.45,3.5],.35,.46,.36,m.wood,12);
    for(const [dx,dz]of [[-.18,0],[.17,.08],[0,-.15]])g.crown([-8+dx,.88,3.5+dz],[.19,.16,.18],m.flower,dx);
  }else if(v.season==='winter'){
    // Snow slope and original miniature skier at the island's outer left edge.
    const topZ=-4,bottomZ=1.7,topY=1.65,bottomY=.48;
    const surface=(x:number,z:number):V3=>[x,topY+(bottomY-topY)*(z-topZ)/(bottomZ-topZ),z];
    g.quad(surface(-11.7,topZ),surface(-11.7,bottomZ),surface(-9.7,bottomZ),surface(-9.7,topZ),m.snow);
    g.tri(surface(-11.7,topZ),[-11.7,.3,topZ],surface(-11.7,bottomZ),m.snow,.86);
    for(const x of [-11.45,-9.95])for(const z of [-3.5,-1.3,1]){
      const p=surface(x,z);g.beam(p,[x,p[1]+.45,z],.04,m.vermilion);
    }
    for(const dx of [-.16,.16]){
      g.beam(surface(-10.7+dx,-3.8),surface(-10.7+dx,1.3),.025,m.stone,1.2);
    }
    const [x,y,z]=surface(-10.7,-.6);
    for(const dx of [-.15,.15]){
      const a=surface(x+dx,z-.55),b=surface(x+dx,z+.65);a[1]+=.045;b[1]+=.045;
      g.beam(a,b,.075,m.vermilion);
      g.beam([x+dx,y+.08,z],[x+dx*.6,y+.46,z-.18],.11,m.ink);
    }
    g.box([x,y+.68,z-.14],[.44,.48,.3],m.copper);
    g.crown([x,y+1.08,z-.12],[.23,.23,.22],m.gold);
    g.crown([x,y+1.2,z-.12],[.245,.16,.235],m.vermilion);
    g.box([x,y+1.07,z+.08],[.32,.1,.045],m.ink);
    for(const side of [-1,1]){
      g.beam([x+side*.19,y+.8,z-.1],[x+side*.4,y+.53,z+.1],.08,m.copper);
      g.beam([x+side*.4,y+.53,z+.1],[x+side*.56,y-.08,z-.48],.025,m.metal);
    }
  }
}
