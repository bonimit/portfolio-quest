'use client';
import {CloseIcon} from '@/components/ui/close-icon';
import {submitsChatMessage} from '@/lib/quest-preview/chat-composer';
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
/** Compact preview-only conversation. The provider and protected entrance stay unchanged. */
export function QuestGuide({paused,onClose,onSuggest,onChoose}:Props){
  const panel=useRef<HTMLElement>(null),input=useRef<HTMLTextAreaElement>(null),history=useRef<HTMLDivElement>(null);
  const player=useRef<ConversationActivity|null>(null),mounted=useRef(false),counter=useRef(0),pending=useRef(false);
  const [activity,setActivity]=useState<AvatarActivity>('wave');
  const [question,setQuestion]=useState(''),[messages,setMessages]=useState<Message[]>([]);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[announcement,setAnnouncement]=useState('');
  const close=useCallback(()=>onClose(shouldRestoreCompanionFocus(panel.current,document.activeElement)),[onClose]);
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
    <div className="quest-chat-avatar" aria-hidden="true"><GuidePortrait activity={activity} paused={paused}/></div>
    <h2 id="quest-guide-title" className="sr-only">Wayfinder guide</h2>
    <div className="guide-history" ref={history} role="log" aria-label="Conversation history" aria-live="off" tabIndex={0}>
      {!messages.length?<p className="quest-chat-welcome">Still deciding? I can help. Choose Portfolio for the editorial website, or Adventure for a non-playable preview.</p>:messages.map(message=><div className="guide-exchange" key={message.id}>
        <p className="quest-message-user"><strong className="sr-only">You: </strong>{message.question}</p>
        {message.answer?<><p className="quest-message-guide"><strong className="sr-only">Wayfinder: </strong>{message.answer.text}</p><nav aria-label={`Destinations for reply ${message.id}`}>{message.answer.actions.map(id=>{const action=resolveGuideAction(id);return action?<Link key={id} href={action.href} onClick={event=>{if(id==='portfolio'||id==='world')onChoose(event,id);}}>{action.label}</Link>:null;})}</nav></>:message.error?<p>{message.error}</p>:<p>Preparing local reply…</p>}
      </div>)}
    </div>
    <div className="guide-examples" aria-label="Example questions">{[{label:'Show work',question:'Where is selected work?'},{label:'Adventure?',question:'Is Adventure playable?'},{label:'Pick for me',question:'Help me choose'}].map(prompt=><button key={prompt.question} type="button" disabled={busy} onClick={()=>void ask(prompt.question)}><span>{prompt.label}</span></button>)}</div>
    <form onSubmit={submit} noValidate><label className="sr-only" htmlFor="quest-guide-question">Ask about this website</label><span className="sr-only" id="quest-guide-composer-help">Enter to send. Shift+Enter for a new line.</span><div className="guide-input-row"><span className="quest-chat-status" aria-hidden="true"/><textarea rows={1} ref={input} id="quest-guide-question" value={question} onChange={event=>{setQuestion(event.target.value);setError('');}} maxLength={GUIDE_INPUT_LIMIT} onKeyDown={event=>{if(submitsChatMessage(event.nativeEvent)){event.preventDefault();void ask(question);}}} autoComplete="off" placeholder="Ask your guide…" aria-invalid={!!error} aria-describedby={`quest-guide-composer-help ${error?'quest-guide-error':'quest-guide-disclosure'}`}/><button type="submit" disabled={busy} aria-label="Send question">Send</button><button className="guide-close" type="button" onClick={close} aria-label="Close guide"><CloseIcon/></button></div>{error?<p id="quest-guide-error" role="alert">{error}</p>:null}</form>
    <p id="quest-guide-disclosure">Scripted guide · Not AI</p>
    <div className="sr-only" role="status" aria-atomic="true">{announcement}</div>
  </aside>;
}
