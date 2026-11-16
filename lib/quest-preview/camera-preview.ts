import {AVATAR_SIZE_INCREASE} from './character-motion.ts';
/** Historical comparison presets stay intact; normal view includes the latest size approval. */
export const CAMERA_PREVIEWS={
 current:{zoom:1,avatar:1,lockAngle:false},
 closer:{zoom:1.15,avatar:1,lockAngle:true},
 avatar:{zoom:1,avatar:1.25,lockAngle:true},
 balanced:{zoom:1.1,avatar:1.25,lockAngle:true},
} as const;
export type CameraPreview=keyof typeof CAMERA_PREVIEWS;
export function cameraPreview(search:string){const key=new URLSearchParams(search).get('cameraPreview');return key&&Object.hasOwn(CAMERA_PREVIEWS,key)?{key:key as CameraPreview,...CAMERA_PREVIEWS[key as CameraPreview],enabled:true}:{key:'balanced' as CameraPreview,...CAMERA_PREVIEWS.balanced,avatar:CAMERA_PREVIEWS.balanced.avatar*AVATAR_SIZE_INCREASE,enabled:false};}
