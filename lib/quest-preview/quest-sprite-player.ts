import {avatarClips,sampleClip,type AvatarPose,type FrameCue} from '../guide/assistant-motion.ts';
import {questWalkFrame} from './avatar-animation.ts';
import {COMPATIBLE_FRAMES,PROVIDED_AVATAR,frameBounds,providedFrame} from './provided-avatar.ts';
import {depthStride} from './depth-walk.ts';

/** Supplied atlas adapter. Shared entrance player/art and pet gait remain untouched. */
export class QuestSpritePlayer {
  private root:HTMLElement;
  private sheet:HTMLImageElement;
  private timer=0;
  private disposed=false;
  private loaded=false;
  private desired:()=>void=()=>this.play('idle-front');
  private onReady?:()=>void;
  private depthLayers:HTMLImageElement[]=[];
  private load=()=>{void this.sheet.decode().catch(()=>undefined).then(()=>{
    if(this.disposed||this.loaded||!this.sheet.naturalWidth)return;
    this.loaded=true;this.root.dataset.loaded='true';this.desired();this.onReady?.();
  });};
  private error=()=>{this.root.dataset.failed='true';this.stop();};
  constructor(root:HTMLElement,onReady?:()=>void){
    this.root=root;this.onReady=onReady;
    const sheet=root.querySelector<HTMLImageElement>('.assistant-sheet');if(!sheet)throw Error('Quest sprite sheet is missing');
    this.sheet=sheet;sheet.addEventListener('load',this.load);sheet.addEventListener('error',this.error);
    if(sheet.complete&&sheet.naturalWidth)this.load();
  }
  get ready(){return this.loaded;}
  private paint(index:number,pose:AvatarPose){
    if(this.disposed||!this.loaded)return;
    const frame=providedFrame(index);
    if(this.root.dataset.pose!==pose)this.root.dataset.pose=pose;
    if(this.root.dataset.frame===String(frame)&&this.sheet.style.width)return;
    this.root.dataset.frame=String(frame);
    const [x,y,w,h]=frameBounds(frame),body=110*140/176,height=body*h/(h-2);
    if(this.root.style){
      this.root.style.height=`calc(${height}px * var(--actor-scale))`;
      this.root.style.width=`calc(${height*w/h}px * var(--actor-scale))`;
      this.root.style.marginTop=`calc(${100-height+height/h}px * var(--actor-scale))`;
    }
    const {width:fw,height:fh,columns,rows}=PROVIDED_AVATAR,sw=fw*columns,sh=fh*rows;
    this.sheet.style.width=`${sw/w*100}%`;this.sheet.style.height=`${sh/h*100}%`;
    this.sheet.style.transform=`translate3d(${-(frame%columns*fw+x)/sw*100}%,${-(Math.floor(frame/columns)*fh+y)/sh*100}%,0)`;
    for(const layer of this.depthLayers)layer.style.cssText=this.sheet.style.cssText;
  }
  stop(){window.clearTimeout(this.timer);this.timer=0;}
  staticFront(){this.stop();delete this.root.dataset.depthWalking;this.desired=()=>this.staticFront();this.paint(0,'idle-front');}
  play(pose:Exclude<AvatarPose,'walk-left'|'walk-right'|'turn'>,onComplete?:()=>void){
    if(this.root.dataset.pose===pose&&this.timer&&!onComplete)return;
    const clip=avatarClips[pose];this.sequence(pose,clip.cues,clip.loop,onComplete);
  }
  sequence(pose:AvatarPose,frames:readonly FrameCue[],loop=false,onComplete?:()=>void){
    this.stop();delete this.root.dataset.depthWalking;this.desired=()=>this.sequence(pose,frames,loop,onComplete);
    if(!this.loaded||this.disposed)return;
    const start=performance.now();
    const tick=()=>{
      if(this.disposed)return;
      const sample=sampleClip(frames,performance.now()-start,loop);
      this.paint(COMPATIBLE_FRAMES[sample.frame]??0,pose);
      if(sample.done){this.timer=0;onComplete?.();}
      else this.timer=window.setTimeout(tick,Math.max(16,sample.remaining));
    };tick();
  }
  walk(facing:'left'|'right',distance:number){
    if(!this.ready)return;
    this.stop();delete this.root.dataset.depthWalking;
    const pose=`walk-${facing}` as const,frame=questWalkFrame(facing,distance);
    this.paint(frame,pose);
  }
  depthWalk(facing:'front'|'back',distance:number){
    if(!this.ready)return;
    this.stop();
    if(!this.depthLayers.length)for(const part of ['left-arm','right-arm','left-leg','right-leg','body']){
      const wrapper=this.root.ownerDocument.createElement('span'),sheet=this.sheet.cloneNode(false) as HTMLImageElement;
      wrapper.className=`quest-depth-layer quest-depth-${part}`;sheet.className='quest-depth-sheet';sheet.removeAttribute('id');
      wrapper.append(sheet);this.root.append(wrapper);this.depthLayers.push(sheet);
    }
    this.paint(facing==='back'?26:0,`idle-${facing}`);
    this.root.dataset.depthWalking=facing;
    const stride=depthStride(distance);
    this.root.style.setProperty('--depth-step',String(stride.step));
    this.root.style.setProperty('--depth-left-lift',`${stride.leftLift}px`);
    this.root.style.setProperty('--depth-right-lift',`${stride.rightLift}px`);
  }
  destroy(){this.disposed=true;this.stop();this.sheet.removeEventListener('load',this.load);this.sheet.removeEventListener('error',this.error);for(const layer of this.depthLayers)layer.parentElement?.remove();delete this.root.dataset.depthWalking;}
}
