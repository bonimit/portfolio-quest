'use client';
import {CloseIcon} from '@/components/ui/close-icon';
import {submitsChatMessage} from '@/lib/quest-preview/restored/chat-composer';
import Link from 'next/link';
import {useCallback,useEffect,useRef,useState,type FormEvent,type MouseEvent} from 'react';
import {GuidePortrait} from '@/components/entrance/guide-portrait';
import {GUIDE_INPUT_LIMIT,localGuideProvider,resolveGuideAction,type GuideAnswer} from '@/lib/guide/local-guide';
import {ConversationActivity} from '@/lib/guide/conversation-activity';
import {dismissesCompanion,shouldRestoreCompanionFocus,suggestedPath} from '@/lib/guide/panel-interaction';
import type {AvatarActivity} from '@/lib/guide/assistant-motion';
import type {Destination} from '@/lib/quest-preview/actors';
type Message={id:number;question:string;answer?:GuideAnswer;error?:string};
type Props={paused:boolean;onClose:(restore:boolean)=>void;onSuggest:(path:Destination|null)=>void;onChoose:(event:MouseEvent<HTMLAnchorElement>,path:Destination)=>void};
/** Compact island conversation shared by the main entrance and its design preview. */
export function QuestGuide({paused,onClose,onSuggest,onChoose}:Props){
  const panel=useRef<HTMLElement>(null),input=useRef<HTMLTextAreaElement>(null),history=useRef<HTMLDivElement>(null);
  const releaseOverlay=useRef<()=>void>(()=>{});
  const player=useRef<ConversationActivity|null>(null),mounted=useRef(false),counter=useRef(0),pending=useRef(false);
  const [activity,setActivity]=useState<AvatarActivity>('wave');
  const [question,setQuestion]=useState(''),[messages,setMessages]=useState<Message[]>([]);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[announcement,setAnnouncement]=useState('');
  const close=useCallback(()=>{const restore=shouldRestoreCompanionFocus(panel.current,document.activeElement);releaseOverlay.current();onClose(restore);},[onClose]);
  useEffect(()=>{
    mounted.current=true;panel.current?.focus({preventScroll:true});
    player.current=new ConversationActivity(setActivity);player.current.greet();
    return()=>{mounted.current=false;player.current?.destroy();};
  },[]);
  useEffect(()=>{if(history.current)history.current.scrollTop=history.current.scrollHeight;},[messages]);
  useEffect(()=>{
    const log=history.current;if(!log)return;
    // A viewport/keyboard resize must keep the latest reply above the composer.
    const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(()=>{log.scrollTop=log.scrollHeight;});
    observer?.observe(log);return()=>observer?.disconnect();
  },[]);
  useEffect(()=>{
    const node=panel.current;if(!node)return;
    const phone=matchMedia('(max-width:40rem), (max-width:64rem) and (max-height:30rem)');
    const viewport=window.visualViewport;
    const siblings=new Map<HTMLElement,boolean>();
    let overflow:string|null=null;
    const release=()=>{
      for(const [sibling,inert]of siblings)sibling.inert=inert;
      siblings.clear();
      if(overflow!==null){document.body.style.overflow=overflow;overflow=null;}
      node.removeAttribute('role');node.removeAttribute('aria-modal');
    };
    releaseOverlay.current=release;
    const resize=()=>{
      node.style.setProperty('--guide-viewport-height',`${viewport?.height??window.innerHeight}px`);
      node.style.setProperty('--guide-viewport-top',`${viewport?.offsetTop??0}px`);
    };
    const mode=()=>{
      resize();
      if(!phone.matches){release();return;}
      node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');
      for(const sibling of Array.from(node.parentElement?.children??[]))if(sibling!==node&&sibling instanceof HTMLElement&&!siblings.has(sibling)){siblings.set(sibling,sibling.inert);sibling.inert=true;}
      if(overflow===null){overflow=document.body.style.overflow;document.body.style.overflow='hidden';}
      if(!node.contains(document.activeElement))node.focus({preventScroll:true});
    };
    const tab=(event:KeyboardEvent)=>{
      if(!phone.matches||event.key!=='Tab')return;
      const items=Array.from(node.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(item=>item.getClientRects().length>0);
      const first=items[0],last=items.at(-1);
      if(!first){event.preventDefault();node.focus();return;}
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===node)){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===node)){event.preventDefault();first.focus();}
    };
    mode();phone.addEventListener('change',mode);viewport?.addEventListener('resize',resize);viewport?.addEventListener('scroll',resize);window.addEventListener('resize',resize);node.addEventListener('keydown',tab);
    return()=>{release();releaseOverlay.current=()=>{};phone.removeEventListener('change',mode);viewport?.removeEventListener('resize',resize);viewport?.removeEventListener('scroll',resize);window.removeEventListener('resize',resize);node.removeEventListener('keydown',tab);};
  },[]);
  async function ask(value:string){
    if(pending.current)return;
    const text=value.trim();
    if(!text){setError('Enter a question or choose an example.');return;}
    pending.current=true;setBusy(true);setError('');setQuestion('');player.current?.idle();
    const id=++counter.current;setMessages(items=>[...items.slice(-5),{id,question:text}]);
    try{
      const answer=await localGuideProvider.respond(text);if(!mounted.current)return;
      setMessages(items=>items.map(item=>item.id===id?{...item,answer}:item));
      onSuggest(suggestedPath(answer));player.current?.answer(answer.avatarCue);
      setAnnouncement(`Reply ${id}. ${answer.text}`);
    }catch{
      if(!mounted.current)return;
      const failure='The local guide could not reply. Try again, or choose either building.';
      setMessages(items=>items.map(item=>item.id===id?{...item,error:failure}:item));
      setAnnouncement(`Reply ${id}. ${failure}`);onSuggest(null);player.current?.idle();
    }finally{
      pending.current=false;
      if(mounted.current){setBusy(false);if(shouldRestoreCompanionFocus(panel.current,document.activeElement))input.current?.focus({preventScroll:true});}
    }
  }
  function submit(event:FormEvent){event.preventDefault();void ask(question);}
  return <aside ref={panel} id="companion-panel" className="guide-dialog quest-conversation" tabIndex={-1} aria-labelledby="quest-guide-title" aria-describedby="quest-guide-disclosure" onKeyDown={event=>{
    if(dismissesCompanion(event.nativeEvent,!!panel.current?.contains(event.target as Node))){event.preventDefault();close();}
  }}>
    <header><div className="guide-identity"><GuidePortrait activity={activity} paused={paused}/><div><h2 id="quest-guide-title">Wayfinder<span aria-hidden="true">.</span></h2><p id="quest-guide-disclosure">Scripted guide · Not AI</p></div></div><button className="guide-close" type="button" onClick={close} aria-label="Close guide"><CloseIcon/></button></header>
    <div className="guide-history" ref={history} role="log" aria-label="Conversation history" aria-live="off" tabIndex={0}>
      {!messages.length?<p className="quest-chat-welcome">Choose a path, or ask me about this website.</p>:messages.map(message=><div className="guide-exchange" key={message.id}>
        <p className="quest-message-user">{message.question}</p>
        {message.answer?<><p className="quest-message-guide"><strong>Wayfinder</strong>{message.answer.text}</p><nav aria-label={`Destinations for reply ${message.id}`}>{message.answer.actions.map(id=>{const action=resolveGuideAction(id);return action?<Link key={id} href={action.href} onClick={event=>{if(id==='portfolio'||id==='world'||id==='concepts')onChoose(event,id);}}>{action.label}</Link>:null;})}</nav></>:message.error?<p className="quest-message-guide">{message.error}</p>:<p className="quest-message-guide">Preparing local reply…</p>}
      </div>)}
    </div>
    <form className="quest-chat-composer" onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor="quest-guide-question">Ask about this website</label>
      <span className="sr-only" id="quest-guide-composer-help">Enter to send. Shift+Enter for a new line.</span>
      <div className="guide-input-row">
        <textarea rows={2} ref={input} id="quest-guide-question" value={question} onChange={event=>{setQuestion(event.target.value);setError('');}} maxLength={GUIDE_INPUT_LIMIT} onKeyDown={event=>{if(submitsChatMessage(event.nativeEvent)){event.preventDefault();void ask(question);}}} autoComplete="off" placeholder="What would you like to explore?" aria-invalid={!!error} aria-describedby={`quest-guide-composer-help ${error?'quest-guide-error':'quest-guide-disclosure'}`}/>
        <div className="quest-composer-toolbar">
          <div className="guide-examples" role="group" aria-label="Example questions">{[{label:'Help me choose',question:'Help me choose'},{label:'Adventure?',question:'Is Adventure playable?'}].map(prompt=><button key={prompt.question} type="button" disabled={busy} onClick={()=>void ask(prompt.question)}><span>{prompt.label}</span></button>)}</div>
          <button className="guide-send" type="submit" disabled={busy} aria-label="Send question"><svg aria-hidden="true" viewBox="0 0 24 24" focusable="false"><path d="m21 3-7 18-4-7-7-4Z"/><path d="m10 14 11-11"/></svg></button>
        </div>
      </div>
      {error?<p id="quest-guide-error" role="alert">{error}</p>:null}
    </form>
    <div className="sr-only" role="status" aria-atomic="true">{announcement}</div>
  </aside>;
}
