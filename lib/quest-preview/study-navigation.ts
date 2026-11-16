import type {EntryRoutes,Destination} from './actors.ts';
import type {Portal} from './destination-transition.ts';
export const STUDY_ROUTES:EntryRoutes={
 portfolio:{center:[0,-2.6],door:[0,-.92],via:[[0,6.4],[0,2.8]],width:5,depth:3.9},
 concepts:{center:[-7.8,-.7],door:[-7.8,.61],via:[[0,6.4],[0,2.8],[-3.2,2],[-7.8,1.2]],width:2.95,depth:2.74},
 world:{center:[7.8,-.4],door:[7.8,-.38],via:[[0,6.4],[0,2.8],[3.2,2],[7.8,1.2]],width:5.2,depth:1.2},
};
export const STUDY_PORTALS:Record<Destination,Portal>={
 portfolio:{point:[0,.4,-.96],inside:[0,.4,-1.8],width:1.15,height:2.65,stairs:false,speed:3.8,pitch:0},
 concepts:{point:[-7.8,.4,.61],inside:[-7.8,.4,-.3],width:.8,height:1.85,stairs:false,speed:3.8,pitch:0},
 world:{point:[7.8,.4,-.4],inside:[7.8,.4,-1.3],width:2.7,height:3.3,stairs:false,speed:3.8,pitch:0},
};
