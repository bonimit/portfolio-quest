/** Front-edge gallery, additive to the existing island. Paths go around its right side. */
export const CONCEPT_GALLERY={center:[0,10.4] as const,door:[0,11.25] as const,via:[[2.4,9.3],[2.4,11.5],[0,11.5]] as const,width:3.4,depth:1.5,roof:3.1};
export const islandPathHref=(path:'portfolio'|'world'|'concepts')=>path==='portfolio'?'/work':path==='world'?'/world':'/concepts';
export const islandPathLabel=(path:'portfolio'|'world'|'concepts')=>path==='portfolio'?'Portfolio':path==='world'?'Adventure':'Concept Lab';
