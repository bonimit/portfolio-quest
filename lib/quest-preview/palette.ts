import {placePalette} from './restored/place-scenes/palette.ts';
import {worldPalette as restoredPalette,atmosphere as restoredAtmosphere} from './restored/palette.ts';
import {worldPalette as heritagePalette,atmosphere as heritageAtmosphere} from './heritage/palette.ts';
import {worldPalette as classicPalette,atmosphere as classicAtmosphere} from './classic/palette.ts';
import {worldPalette as originalPalette,atmosphere as originalAtmosphere} from './scenes/original/palette.ts';
import type {V3} from './math.ts';
import {isSnow, type SceneVariant} from './variants.ts';
export {type Season, type Light} from './variants.ts';
const base = ['#826452','#73886b','#c7b79d','#e0d9c5','#cb7850','#795344','#497562','#608d99','#263b41','#ffd392','#d6dedb','#e7b6aa'];
export function hexLinear(hex: string) {
  return hex.slice(1).match(/../g)!.map(value => Math.pow(parseInt(value, 16) / 255, 2.2));
}
export function worldPalette(variant: SceneVariant) {
  if(variant.edition==='restored')return placePalette(variant,restoredPalette({...variant,edition:'restored'}));
  if(variant.edition==='heritage'){const palette=originalPalette(variant);palette.set(heritagePalette(variant));return palette;}
  if(variant.edition==='classic'){const palette=originalPalette(variant);palette.set(classicPalette('meadow'));return palette;}
  if(variant.edition!=='new')return originalPalette(variant);
  const {city, season} = variant;
  const colors = [...base];
  if (city === 'nyc') {
    colors[3] = '#d5c9af'; colors[4] = '#dfa93e'; colors[5] = '#584940'; colors[8] = '#25363a';
  } else if (city === 'tokyo') {
    colors[0] = '#627882'; colors[3] = '#ddd3be'; colors[4] = '#bb5b43'; colors[5] = '#624a3c'; colors[9] = '#ffd6aa';
  } else {
    colors[1] = '#748968'; colors[3] = '#e2c9a1'; colors[4] = '#dc9a42';
    colors[5] = '#805647'; colors[6] = '#47785c'; colors[7] = '#5b9493';
  }
  if(season==='summer'){colors[1]=city==='bangkok'?'#7fa367':'#58865b';colors[6]=city==='tokyo'?'#36734f':'#44824f';colors[11]=city==='bangkok'?'#e8bd3c':'#e7b6aa';}
  if (season === 'spring') {
    colors[1] = city==='tokyo'?'#b5ad82':'#8da85f'; colors[6] = city === 'tokyo' ? '#e5a6bc' : '#e2a6b4'; colors[11] = '#edc5c9';
  } else if (season === 'autumn') {
    colors[1] = '#ac844d'; colors[6] = city === 'tokyo' ? '#b84432' : '#b96932'; colors[11] = city === 'tokyo' ? '#ee8a32' : '#e78b36';
  } else if (season === 'raining') {
    colors[0] = '#5b655a'; colors[1] = '#64816c'; colors[2] = '#849b92'; colors[6] = '#386b55'; colors[10] = '#9eafba';
  } else if (isSnow(variant)) {
    colors[1] = '#d9e2e0'; colors[7]='#aacbd6'; colors[2] = '#c8cac3'; colors[6] = '#829992'; colors[10] = '#edf0e8';
  } else if (city === 'bangkok' && season === 'winter') {
    // An expressly northern-inspired cool-season palette, without Bangkok snow.
    colors[1] = '#b69b68'; colors[6] = '#839275'; colors[11] = '#ebc586';
  }
  return new Float32Array([...colors,'#bc8958','#9f9b8c','#e1d1b1','#66834b','#b74935','#708e9c','#f2f4ed','#d8af57'].flatMap(hexLinear));
}
export function atmosphere(variant: SceneVariant) {
  if(variant.edition==='restored')return restoredAtmosphere({...variant,edition:'restored'});
  if(variant.edition==='heritage')return {...originalAtmosphere(variant),...heritageAtmosphere(variant)};
  if(variant.edition==='classic'){const original=classicAtmosphere(variant.light==='night'?'dusk':'day');return {...originalAtmosphere(variant),...original};}
  if(variant.edition!=='new')return originalAtmosphere(variant);
  const {city, season, light} = variant;
  const wet = season === 'raining';
  if (light === 'day') return {
    fog: hexLinear(wet ? '#afc4c4' : city === 'bangkok' ? '#e4ceac' : city==='tokyo'?'#c4d0e2':'#bed0d6'),
    sky: hexLinear(wet ? '#c4d6d4' : city==='tokyo'?'#d9e1f0':'#dbe8e3'),
    direction: [-12,25,15] as V3, ground:[.2,.24,.23], shadowFloor:wet?.55:.25, cloudGain:1.04,
    sun: wet ? [.73,.84,.87] : city === 'bangkok' ? [1.35,1.02,.7] : [1.25,1.07,.8],
    fill: wet ? .72 : .64, exposure: 1.03,
  };
  const winter=season==='winter'&&city!=='bangkok';
  const spring=season==='spring',autumn=season==='autumn';
  return {
    fog: hexLinear(wet ? '#172c3c' : winter ? '#273951' : spring ? '#302b43' : autumn ? '#2c293c' : city==='bangkok'?'#193332':'#203342'),
    sky: hexLinear(winter ? '#9baccc' : spring ? '#8990b0' : wet ? '#66899a' : '#748da5'),
    direction: (city==='tokyo'?[10,23,8]:city==='nyc'?[12,22,12]:[8,26,12]) as V3,
    ground:[.055,.085,.14], shadowFloor:wet?.72:.58, cloudGain:wet?.19:.25,
    sun: winter?[.22,.31,.5]:wet?[.11,.17,.25]:autumn?[.2,.22,.35]:[.17,.25,.4],
    fill: wet?.24:.26, exposure:1.08,
  };
}
