import {orbitFit} from './map-orbit.ts';
export type V3 = [number, number, number];
export type Mat4 = Float32Array;
export const add = (a: V3,b: V3): V3 => [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const sub = (a: V3,b: V3): V3 => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const scale = (a: V3,n: number): V3 => [a[0]*n,a[1]*n,a[2]*n];
export const cross = (a: V3,b: V3): V3 => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const dot = (a: V3,b: V3) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export function normalize(a: V3): V3 { const d=Math.hypot(...a)||1;return scale(a,1/d); }
export function multiply(a: Mat4,b: Mat4): Mat4 {
  const out=new Float32Array(16);
  for(let col=0;col<4;col++)for(let row=0;row<4;row++)out[col*4+row]=a[row]*b[col*4]+a[4+row]*b[col*4+1]+a[8+row]*b[col*4+2]+a[12+row]*b[col*4+3];
  return out;
}
export function lookAt(eye: V3,target: V3): Mat4 {
  const z=normalize(sub(eye,target)),x=normalize(cross([0,1,0],z)),y=cross(z,x);
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
}
export function ortho(left: number,right: number,bottom: number,top: number,near: number,far: number): Mat4 {
  return new Float32Array([2/(right-left),0,0,0,0,2/(top-bottom),0,0,0,0,-2/(far-near),0,-(right+left)/(right-left),-(top+bottom)/(top-bottom),-(far+near)/(far-near),1]);
}
export function project(matrix: Mat4,p: V3,width: number,height: number) {
  const x=matrix[0]*p[0]+matrix[4]*p[1]+matrix[8]*p[2]+matrix[12];
  const y=matrix[1]*p[0]+matrix[5]*p[1]+matrix[9]*p[2]+matrix[13];
  const w=matrix[3]*p[0]+matrix[7]*p[1]+matrix[11]*p[2]+matrix[15];
  return {x:(x/w+1)*width/2,y:(1-y/w)*height/2};
}
export function cameraMatrix(width: number,height: number,focus = 0,panX = 0,panY = 0,yaw = 0,pitch = 0): Mat4 {
  const aspect=Math.max(.2,width/Math.max(1,height));
  const span=Math.max(20,34/aspect)*orbitFit(yaw,pitch);
  const baseY=15.9+panY*.35,radius=Math.hypot(baseY,32),elevation=Math.atan2(baseY,32)+pitch;
  const eye:V3=yaw===0&&pitch===0?[panX*.7+focus*.6,16.5+panY*.35,32]:[Math.sin(yaw)*Math.cos(elevation)*radius+panX*.7+focus*.6,.6+Math.sin(elevation)*radius,Math.cos(yaw)*Math.cos(elevation)*radius];
  return multiply(ortho(-span*aspect/2,span*aspect/2,-span/2+1,span/2+1,.1,120),lookAt(eye,[focus*.35,.6,0]));
}
export function pixelRatio(value: number) { return Math.max(1,Math.min(1.6,Number.isFinite(value)?value:1)); }
export function guideScale(pixelsPerUnit:number) {return Math.max(.24,Math.min(.65,pixelsPerUnit*2.6/110));}
export function worldPixelsPerUnit(width:number,height:number) {return height/Math.max(20,34/Math.max(.2,width/Math.max(1,height)));}

export function renderSize(width: number,height: number,dpr: number) {
  const ratio=Math.min(pixelRatio(dpr),Math.sqrt(2_800_000/Math.max(1,width*height)));
  return {width:Math.max(1,Math.floor(width*ratio)),height:Math.max(1,Math.floor(height*ratio))};
}
