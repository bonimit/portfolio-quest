import {isSnow, type SceneVariant} from '../variants.ts';
export {type Season, type Light} from '../variants.ts';
const base = ['#826452','#73886b','#c7b79d','#e0d9c5','#cb7850','#795344','#497562','#608d99','#263b41','#ffd392','#d6dedb','#e7b6aa'];
export function hexLinear(hex: string) {
  return hex.slice(1).match(/../g)!.map(value => Math.pow(parseInt(value, 16) / 255, 2.2));
}
export function worldPalette(variant: SceneVariant) {
  const {city, season} = variant;
  const colors = [...base];
  if (city === 'nyc') {
    colors[3] = '#a66c56'; colors[4] = '#72847b'; colors[5] = '#584940'; colors[8] = '#25363a';
  } else if (city === 'tokyo') {
    colors[3] = '#ddd3be'; colors[4] = '#bb5b43'; colors[5] = '#624a3c'; colors[9] = '#ffd6aa';
  } else {
    colors[1] = '#748968'; colors[3] = '#e2c9a1'; colors[4] = '#dc9a42';
    colors[5] = '#805647'; colors[6] = '#47785c'; colors[7] = '#5b9493';
  }
  if (season === 'spring') {
    colors[1] = '#8f9f77'; colors[6] = city === 'tokyo' ? '#dfb5c0' : '#8aab77'; colors[11] = '#edc5c9';
  } else if (season === 'autumn') {
    colors[1] = '#a39268'; colors[6] = city === 'tokyo' ? '#be6b4e' : '#ba8550'; colors[11] = '#ebbb69';
  } else if (season === 'raining') {
    colors[0] = '#5b655a'; colors[1] = '#64816c'; colors[2] = '#849b92'; colors[6] = '#386b55'; colors[10] = '#9eafba';
  } else if (isSnow(variant)) {
    colors[1] = '#cbd6d3'; colors[2] = '#c8cac3'; colors[6] = '#829992'; colors[10] = '#edf0e8';
  } else if (city === 'bangkok' && season === 'winter') {
    // An expressly northern-inspired cool-season palette, without Bangkok snow.
    colors[1] = '#a4a075'; colors[6] = '#839275'; colors[11] = '#ebc586';
  }
  return new Float32Array([...colors,'#bc8958','#9f9b8c','#e1d1b1','#66834b','#d3a1a0'].flatMap(hexLinear));
}
export function atmosphere(variant: SceneVariant) {
  const {city, season, light} = variant;
  const wet = season === 'raining';
  if (light === 'day') return {
    fog: hexLinear(wet ? '#afc4c4' : city === 'bangkok' ? '#e4ceac' : '#c9d5ce'),
    sky: hexLinear(wet ? '#c4d6d4' : '#dbe8e3'),
    sun: wet ? [.73,.84,.87] : city === 'bangkok' ? [1.35,1.02,.7] : [1.25,1.07,.8],
    fill: wet ? .72 : .64, exposure: 1.03,
  };
  return {
    fog: hexLinear(wet ? '#344b59' : city === 'tokyo' ? '#494c6b' : '#405568'),
    sky: hexLinear(wet ? '#7e9ca6' : '#889aaa'),
    sun: city === 'tokyo' ? [.63,.7,1.08] : [.66,.76,.99],
    fill: .33, exposure: 1.15,
  };
}
