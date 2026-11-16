export type Season = 'meadow' | 'autumn' | 'frost';
export type Light = 'day' | 'dusk';
export const SEASONS: readonly Season[] = ['meadow','autumn','frost'];
const colors: Record<Season,readonly string[]> = {
  meadow:['#846653','#839d72','#d4c39f','#e7dfc9','#f79a3b','#796048','#477767','#638e9c','#29383a','#ffcb79','#e5e2d9','#f3d7ac'],
  autumn:['#8d6655','#b2a079','#ddc4a0','#eee0c7','#e28a49','#765640','#b57248','#6b969b','#323b3b','#ffd394','#e6d8ca','#ead9b5'],
  frost:['#788589','#c6d2ca','#dcd9c8','#f0eadd','#cc8c5b','#746358','#839b98','#7cabb3','#33464e','#ffce8f','#e8eef0','#e9d0b2'],
};
export function hexLinear(hex: string) { return hex.slice(1).match(/../g)!.map(value=>Math.pow(parseInt(value,16)/255,2.2)); }
export function worldPalette(season: Season) { return new Float32Array(colors[season].flatMap(hexLinear)); }
export function atmosphere(light: Light) {
  return light==='day'
    ? {fog:hexLinear('#c9d5ce'),sky:hexLinear('#dbe8e3'),sun:[1.25,1.07,.8],fill:.64,exposure:1.03}
    : {fog:hexLinear('#4b596b'),sky:hexLinear('#8c9ba8'),sun:[.8,.75,1.05],fill:.38,exposure:1.15};
}
