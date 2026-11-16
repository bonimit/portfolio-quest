/** Owner-supplied poses.png; measured alpha bounds, no raster edits. */
export const PROVIDED_AVATAR={src:'/quest-preview/guide/poses.png',width:89,height:150,columns:8,rows:10} as const;
export const PROVIDED_BOUNDS:readonly (readonly number[]|null)[]=[[9,5,71,111],[9,5,71,113],[9,5,71,111],[9,5,71,112],[9,5,71,112],null,null,null,[9,5,70,106],[9,5,70,103],[9,5,70,104],[9,5,70,106],[9,5,70,105],[9,5,70,107],[9,5,70,109],[9,5,70,107],[9,5,70,106],[9,5,70,103],[9,5,70,104],[9,5,70,106],[9,5,70,105],[9,5,70,107],[9,5,70,109],[9,5,70,107],[9,5,71,115],[9,5,71,129],[9,5,71,122],[9,5,71,129],[9,5,71,113],null,null,null,[9,5,71,109],[9,5,71,109],[9,5,71,109],null,null,null,null,null,[9,5,78,111],[9,5,75,112],[9,5,78,111],null,null,null,null,null,[9,5,71,117],[9,5,71,118],[9,5,71,125],[9,5,71,113],null,null,null,null,[9,5,71,124],[9,5,71,132],[9,5,74,118],null,null,null,null,null,[9,5,71,141],[9,5,71,130],[9,5,71,121],[9,5,71,141],null,null,null,null,[8,5,72,122],[7,5,73,132],[9,5,71,130],[9,5,71,118],null,null,null,null];
export const PROVIDED_WALK={left:[16,17,18,19,20,21,22,23],right:[8,9,10,11,12,13,14,15]} as const;
/** Existing activity cues retain their semantics; only image addresses change. */
export const COMPATIBLE_FRAMES=[0,1,2,3,4,26,26,26,26,26,24,25,26,27,28,8,9,10,11,12,13,14,16,17,18,19,20,21,22,32,33,34,40,41,42,48,49,50,51,56,57,58] as const;
export function providedFrame(index:number){return Number.isInteger(index)&&PROVIDED_BOUNDS[index]?index:0;}
export function frameBounds(index:number){return PROVIDED_BOUNDS[providedFrame(index)]!;}
