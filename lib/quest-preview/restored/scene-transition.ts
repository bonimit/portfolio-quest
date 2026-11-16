export const SCENE_TRANSITION_MS=1100;
export const SCENE_TRANSITION_EASING='cubic-bezier(.22,1,.36,1)';
/** Pixel-exact copy of the live camera; no image decode or fixed-aspect fallback. */
export function captureSceneFrame(source:HTMLCanvasElement,target:HTMLCanvasElement){
  target.width=source.width;target.height=source.height;
  target.getContext('2d')?.drawImage(source,0,0);
}
export function clearSceneTransition(layer:HTMLCanvasElement){
  layer.getAnimations().forEach(animation=>animation.cancel());
  layer.width=1;layer.height=1;
}
export function fadeSceneFrame(layer:HTMLCanvasElement){
  const animation=layer.animate([{opacity:1},{opacity:0}],{duration:SCENE_TRANSITION_MS,easing:SCENE_TRANSITION_EASING,fill:'forwards'});
  animation.onfinish=()=>{layer.width=1;layer.height=1;};
}
