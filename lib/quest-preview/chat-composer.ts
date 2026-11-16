/** Preserve multiline input and IME confirmation; Enter sends without consuming multiline or IME input. */
export function submitsChatMessage(event:{key:string;shiftKey:boolean;isComposing:boolean;keyCode?:number;defaultPrevented?:boolean}){
  return event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&event.keyCode!==229&&!event.defaultPrevented;
}
