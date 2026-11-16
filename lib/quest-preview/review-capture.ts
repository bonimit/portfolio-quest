/** Browser-side screenshot export of this page's rendered DOM and live scene canvas. */
const resources=new Map<string,Promise<string>>();
function dataUrl(url:string){
 if(url.startsWith('data:'))return Promise.resolve(url);
 let saved=resources.get(url);if(!saved){saved=fetch(url).then(r=>{if(!r.ok)throw Error(`Capture asset failed: ${r.status}`);return r.blob();}).then(blob=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(blob);}));resources.set(url,saved);}return saved;
}
let fontCache:Promise<string>|undefined;
const nextTask=()=>new Promise<void>(resolve=>{const channel=new MessageChannel();channel.port1.onmessage=()=>{channel.port1.close();channel.port2.close();resolve();};channel.port2.postMessage(0);});
export async function waitForReviewScene(section:HTMLElement,id:string,light:string){
 for(let attempt=0;attempt<100;attempt++){if(section.dataset.reviewScene===id&&section.dataset.light===light){await nextTask();return;}await nextTask();}
 throw Error('Scene did not finish rendering for capture.');
}
function fonts(){return fontCache??= (async()=>{
 const rules:string[]=[];
 for(const sheet of [...document.styleSheets]){let css:CSSRuleList;try{css=sheet.cssRules;}catch{continue;}for(const rule of [...css])if(rule instanceof CSSFontFaceRule){let text=rule.cssText;for(const match of [...text.matchAll(/url\(["']?([^"')]+)["']?\)/g)])text=text.replace(match[0],`url("${await dataUrl(new URL(match[1],sheet.href??location.href).href)}")`);rules.push(text);}}
 return rules.join('\n');
 })();}
export async function captureReviewPage(section:HTMLElement,scene:string){
 await document.fonts.ready;
 const clone=section.cloneNode(true) as HTMLElement,header=document.querySelector<HTMLElement>('.site-header'),headerCopy=header?.cloneNode(true) as HTMLElement|undefined;
 const headerHeight=header?.getBoundingClientRect().height??0;
 const originals=[section,...section.querySelectorAll<HTMLElement|SVGElement>('*'),...(header?[header,...header.querySelectorAll<HTMLElement|SVGElement>('*')]:[])],copies=[clone,...clone.querySelectorAll<HTMLElement|SVGElement>('*'),...(headerCopy?[headerCopy,...headerCopy.querySelectorAll<HTMLElement|SVGElement>('*')]:[])];
 for(let i=0;i<originals.length;i++){
  const original=originals[i],copy=copies[i],style=getComputedStyle(original);
  if(original.classList.contains('scene-study-capture')||original.classList.contains('scene-study-season-fade')||original.classList.contains('scene-study-label')||style.display==='none'||style.visibility==='hidden'){copy.remove();continue;}
  copy.setAttribute('style',[...style].map(key=>`${key}:${style.getPropertyValue(key)};`).join(''));
  if(original instanceof HTMLCanvasElement){const image=document.createElement('img');image.src=original.classList.contains('scene-study-canvas')?scene:original.toDataURL();image.setAttribute('style',copy.getAttribute('style')??'');copy.replaceWith(image);}
  if(original instanceof HTMLImageElement){(copy as HTMLImageElement).src=await dataUrl(original.currentSrc||original.src);copy.removeAttribute('srcset');copy.removeAttribute('sizes');}
 }
 const width=section.clientWidth,height=section.clientHeight+headerHeight;clone.style.position='absolute';clone.style.inset=`${headerHeight}px 0 auto`;clone.style.margin='0';clone.style.width=`${width}px`;clone.style.height=`${section.clientHeight}px`;
 const host=document.createElement('div');host.style.cssText=`position:relative;width:${width}px;height:${height}px;overflow:hidden`;host.append(clone);
 if(headerCopy){headerCopy.style.cssText+=`;position:absolute;inset:0 0 auto;width:${width}px;height:${headerHeight}px`;const frame=headerCopy.querySelector<HTMLElement>('.site-header-frame');if(frame)frame.style.cssText+=`;position:absolute;inset:0 0 auto;width:${width}px`;const nav=headerCopy.querySelector<HTMLElement>('.compact-header');if(nav)nav.style.width=`${width-40}px`;host.append(headerCopy);}
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${await fonts()}</style>${new XMLSerializer().serializeToString(host)}</div></foreignObject></svg>`;
 const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await image.decode();
 const canvas=document.createElement('canvas');canvas.width=width*2;canvas.height=height*2;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Screenshot canvas unavailable');ctx.scale(2,2);ctx.drawImage(image,0,0);return canvas.toDataURL('image/png');
}
