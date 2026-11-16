import type { CSSProperties } from 'react';

const style = (key: string, value: string | number) => ({[key]:value}) as CSSProperties;
/** Same lightweight CSS illustrations as AD1; decorative, no canvas or timers. */
export function LivePreview({kind}:{kind:string}) {
  const bars=(count:number,extra?:(i:number)=>CSSProperties)=>Array.from({length:count},(_,i)=><i key={i} style={{'--k':i,...extra?.(i)} as CSSProperties}/>);
  if(kind==='seat')return <span className="pv pv-seat">{Array.from({length:10},(_,i)=><i key={i} className={i===1||i===6?'w':''} style={style('--k',(i*7)%10)}/>)}</span>;
  if(kind==='chat')return <span className="pv pv-chat"><i style={style('--k',0)}/><i className="me" style={style('--k',1)}/><i className="dots" style={style('--k',2)}><b/><b/><b/></i></span>;
  if(kind==='cards')return <span className="pv pv-cards">{Array.from({length:8},(_,i)=><i key={i} style={style('--k',i)}>?</i>)}</span>;
  if(kind==='budget')return <span className="pv pv-budget"><span className="jar"><b/></span><span className="coin"/></span>;
  if(kind==='poster')return <span className="pv pv-poster"><span className="sheet"><i className="a"/><i className="b"/><i className="c"/></span></span>;
  if(kind==='dash')return <span className="pv pv-dash">{bars(7,i=>style('--h',`${[55,80,40,95,65,30,75][i]}%`))}</span>;
  if(kind==='api')return <span className="pv pv-api">{bars(5,i=>style('--w',`${[70,45,85,55,35][i]}%`))}</span>;
  return <span className="pv pv-fest">{[...'FEST'].map((c,i)=><i key={c} style={style('--k',i)}>{c}</i>)}</span>;
}
