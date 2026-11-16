import {CITIES,type Season} from './variants.ts';
export function nextStudySeason(season:Season):Season{
 const seasons:readonly Season[]=CITIES.tokyo.seasons;
 return seasons[(Math.max(0,seasons.indexOf(season))+1)%seasons.length];
}
