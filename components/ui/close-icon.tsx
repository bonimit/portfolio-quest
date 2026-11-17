/** Shared X glyph for dismissing panels, dialogs, menus and removable filters. */
export function CloseIcon({size=20}:{size?:number}){
 return <svg className="app-close-icon" viewBox="0 0 24 24" width={size} height={size} style={{width:size,height:size,flexShrink:0}} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"/></svg>;
}
