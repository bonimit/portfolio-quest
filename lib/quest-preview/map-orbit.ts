export const ORBIT_LIMITS={yaw:50*Math.PI/180,pitchMin:-.1,pitchMax:.2};
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
export function orbitFit(yaw:number,pitch:number){return 1+.28*Math.abs(Math.sin(yaw))+.45*Math.abs(Math.sin(pitch));}
export function boundedOrbit(yaw:number,pitch:number,full=false){return {yaw:full?(Number.isFinite(yaw)?yaw:0):clamp(Number.isFinite(yaw)?yaw:0,-ORBIT_LIMITS.yaw,ORBIT_LIMITS.yaw),pitch:clamp(Number.isFinite(pitch)?pitch:0,ORBIT_LIMITS.pitchMin,ORBIT_LIMITS.pitchMax)};}
/** Pointer state stays outside React. Vertical touch scrolling remains native. */
export class MapOrbit {
  yaw=0;pitch=0;
  private full:boolean;
  constructor(full=false){this.full=full;}
  private drag:{id:number;x:number;y:number;yaw:number;pitch:number;touch:boolean;moved:boolean}|null=null;
  get pointerId(){return this.drag?.id??null;}
  get dragging(){return this.drag!==null;}
  begin(id:number,x:number,y:number,touch=false){
    if(this.drag)return false;
    this.drag={id,x,y,yaw:this.yaw,pitch:this.pitch,touch,moved:false};return true;
  }
  move(id:number,x:number,y:number,width:number,height:number){
    const d=this.drag;if(!d||d.id!==id)return null;
    const dx=x-d.x,dy=y-d.y;
    if(!d.moved&&(Math.hypot(dx,dy)<6||d.touch&&Math.abs(dy)>Math.abs(dx)))return null;
    d.moved=true;
    return this.set(d.yaw+dx/Math.max(200,Math.min(900,width))*2.8,d.pitch-(d.touch?0:dy/Math.max(200,height)*.7));
  }
  end(id:number){if(this.drag?.id!==id)return false;const moved=this.drag.moved;this.drag=null;return moved;}
  cancel(){const d=this.drag;this.drag=null;return d?this.set(d.yaw,d.pitch):null;}
  set(yaw:number,pitch:number){Object.assign(this,boundedOrbit(yaw,pitch,this.full));return {yaw:this.yaw,pitch:this.pitch};}
  reset(){this.drag=null;return this.set(0,0);}
}
