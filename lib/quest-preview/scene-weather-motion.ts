/** One rigid offset per cloud cluster; start at the authored position. */
export function cloudDrift(time:number,phase:number){return {x:(Math.sin(time*.12+phase)-Math.sin(phase))*.95,y:(Math.sin(time*.1+phase)-Math.sin(phase))*.1};}
