import {ASSISTANT_ATLAS} from '../guide/assistant-atlas.ts';
import {entryPortal,smooth,type EntryFrame} from './destination-transition.ts';
import type {ActorPose} from './actors.ts';
import type {Mat4} from './math.ts';
import {PoseBlend,POSE_BLEND_MS} from './avatar-animation.ts';
import {PROVIDED_AVATAR,frameBounds,providedFrame} from './provided-avatar.ts';
export const GUIDE_HEIGHT=2.6;
/** Source atlas remains untouched. Upright world billboard uses the measured foot anchor. */
export function createJourneyDrawing(gl:WebGL2RenderingContext,invalidate:(duration?:number)=>void,actorHeight=GUIDE_HEIGHT){
 const vertex=`#version 300 es
 precision highp float; precision highp int;
 uniform mat4 camera;uniform vec3 actor;uniform vec3 portal;uniform vec3 right;
 uniform vec2 size;uniform int pass;uniform float stairs;uniform float footAnchor;
 out vec2 uv;
 void main(){
  vec2 points[6]=vec2[6](vec2(-.5,0.),vec2(.5,0.),vec2(-.5,1.),vec2(-.5,1.),vec2(.5,0.),vec2(.5,1.));
  vec2 q=points[gl_VertexID];uv=vec2(q.x+.5,1.-q.y);vec3 p;
  if(pass==0)p=actor+right*q.x*size.x+vec3(0.,(q.y-footAnchor)*size.y,0.);
  else if(pass==1)p=actor+vec3(q.x*size.x,.015,(q.y-.5)*size.y);
  else if(stairs>.5)p=portal+vec3(q.x*size.x,.015,(q.y-.5)*size.y);
  else p=portal+vec3(q.x*size.x,q.y*size.y,.015);
  gl_Position=camera*vec4(p,1.);
 }`;
 const fragment=`#version 300 es
 precision highp float; precision highp int;
 uniform sampler2D atlas;uniform vec2 tile;uniform vec2 fromTile;uniform vec2 grid;uniform vec4 crop;uniform float poseMix;uniform int pass;uniform float opacity;uniform float opening;uniform float push;uniform vec3 routeColor;
 in vec2 uv;out vec4 color;
 void main(){
  if(pass==0){vec2 padded=crop.xy+clamp(uv,vec2(.006),vec2(.994))*crop.zw;vec4 incoming=texture(atlas,(tile+padded)/grid);vec4 outgoing=texture(atlas,(fromTile+padded)/grid);float a=mix(outgoing.a,incoming.a,poseMix);vec3 rgb=mix(outgoing.rgb,incoming.rgb,poseMix);color=vec4(rgb*opacity,a*opacity);if(color.a<.05)discard;}
  else if(pass==1){float a=(1.-smoothstep(.12,.5,length(uv-.5)))*.24*opacity;if(a<.01)discard;color=vec4(vec3(.07,.12,.14)*a,a);}
  else{if(opening<.01)discard;float glow=1.-smoothstep(.1,.7,length(uv-.5));vec3 inside=routeColor*(.12+.22*glow);color=vec4(mix(inside,routeColor,push)*opening,opening);}
 }`;
 const shaders:WebGLShader[]=[];
 const compile=(type:number,source:string)=>{const s=gl.createShader(type);if(!s)throw Error('Sprite shader unavailable');shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s)||'Sprite shader failed');return s;};
 const program=gl.createProgram();if(!program)throw Error('Sprite program unavailable');
 try{gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||'Sprite program failed');}catch(e){shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);throw e;}
 const names=['camera','actor','portal','right','size','pass','stairs','atlas','tile','fromTile','grid','crop','footAnchor','poseMix','opacity','opening','push','routeColor'] as const;
 const uniforms=Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(program,n)])) as Record<typeof names[number],WebGLUniformLocation|null>;
 let root:HTMLElement|null=null,texture:WebGLTexture|null=null,observer:MutationObserver|null=null;
 const blend=new PoseBlend();
 function attach(node:HTMLElement){
  if(texture&&root===node)return true;
  const image=node.querySelector<HTMLImageElement>('.assistant-sheet');if(!image?.complete||!image.naturalWidth)return false;
  if(!texture)texture=gl.createTexture();if(!texture)return false;
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,texture);
  // Premultiply before linear filtering so transparent RGB cannot bleed into the silhouette.
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  observer?.disconnect();root=node;observer=typeof MutationObserver==='undefined'?null:new MutationObserver(()=>invalidate(POSE_BLEND_MS+40));observer?.observe(node,{attributes:true,attributeFilter:['data-frame','data-pose','data-motion']});invalidate();return true;
 }
 function draw(camera:Mat4,pose:ActorPose,frame:EntryFrame|null){
  if(!root||!texture)return;
  gl.useProgram(program);gl.bindVertexArray(null);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  gl.uniformMatrix4fv(uniforms.camera,false,camera);
  const length=Math.hypot(camera[0],camera[4],camera[8]);gl.uniform3fv(uniforms.right,[camera[0]/length,camera[4]/length,camera[8]/length]);
  gl.uniform3fv(uniforms.actor,[pose.x,frame?.floorY??.4,pose.z]);gl.uniform1f(uniforms.opacity,frame?.opacity??1);
  if(frame){
   const portal=entryPortal(frame.city,frame.destination,frame.edition);
   gl.uniform1i(uniforms.pass,2);gl.uniform3fv(uniforms.portal,portal.point);gl.uniform2f(uniforms.size,portal.width,portal.height);gl.uniform1f(uniforms.stairs,portal.stairs?1:0);
   gl.uniform1f(uniforms.opening,smooth(frame.elapsed/450));gl.uniform1f(uniforms.push,frame.push);
   gl.uniform3fv(uniforms.routeColor,frame.destination==='portfolio'?[247/255,154/255,59/255]:[229/255,240/255,234/255]);gl.drawArrays(gl.TRIANGLES,0,6);
  }
  gl.depthMask(false);gl.uniform1i(uniforms.pass,1);gl.uniform2f(uniforms.size,1.2,.7);gl.drawArrays(gl.TRIANGLES,0,6);
  gl.depthMask(true);gl.uniform1i(uniforms.pass,0);
  const supplied=root.dataset.atlas==='provided',atlas=supplied?PROVIDED_AVATAR:ASSISTANT_ATLAS;
  const index=supplied?providedFrame(Number(root.dataset.frame)):Math.max(0,Math.min(41,Number(root.dataset.frame)||0));
  if(supplied){
    const [x,y,w,h]=frameBounds(index),height=actorHeight*140/176*h/(h-2);
    gl.uniform2f(uniforms.size,height*w/h,height);gl.uniform1f(uniforms.footAnchor,1/h);
    gl.uniform4f(uniforms.crop,x/atlas.width,y/atlas.height,w/atlas.width,h/atlas.height);
  }else{
    gl.uniform2f(uniforms.size,actorHeight*ASSISTANT_ATLAS.width/ASSISTANT_ATLAS.height,actorHeight);gl.uniform1f(uniforms.footAnchor,16/176);gl.uniform4f(uniforms.crop,0,0,1,1);
  }
  // As with the pets, supplied walking poses never dissolve into overlapping legs.
  const state=blend.sample(root.dataset.pose??'idle-front',index,performance.now(),supplied||root.dataset.motion==='static');
  gl.uniform2f(uniforms.grid,atlas.columns,atlas.rows);
  gl.uniform2f(uniforms.tile,index%atlas.columns,Math.floor(index/atlas.columns));
  gl.uniform2f(uniforms.fromTile,state.from%atlas.columns,Math.floor(state.from/atlas.columns));gl.uniform1f(uniforms.poseMix,state.mix);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(uniforms.atlas,1);gl.drawArrays(gl.TRIANGLES,0,6);gl.disable(gl.BLEND);
 }
 return {attach,draw,destroy(){observer?.disconnect();if(texture)gl.deleteTexture(texture);shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);root=null;}};
}
