'use client';

import {useRef,useState,type FormEvent} from 'react';
import {Dropdown} from '@/components/ui/dropdown';
import {contactDraftText,contactMailto,type ContactDraft} from '@/lib/contact';

export function ContactComposer({recipient}:{recipient:string|null}) {
  const [status,setStatus]=useState('');
  const [manual,setManual]=useState('');
  const output=useRef<HTMLTextAreaElement>(null);
  const [draft,setDraft]=useState<ContactDraft>({name:'',email:'',topic:'A project',message:''});
  const update=(key:keyof ContactDraft,value:string)=>{setDraft(current=>({...current,[key]:value}));setStatus('');setManual('');};
  async function prepare(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const href=contactMailto(recipient,draft);
    if(href){window.location.href=href;setStatus('Your email app can open this draft. Review it there before sending. Nothing has been submitted by this page.');return;}
    const text=contactDraftText(draft);
    try{await navigator.clipboard.writeText(text);setStatus('Draft copied. Nothing has been sent. A public contact address is not available yet.');}
    catch{setManual(text);setStatus('Copy is unavailable in this browser. Use the draft below to select and copy your message. Nothing has been sent.');}
  }
  return <form className="contact-form" onSubmit={prepare} aria-labelledby="contact-form-title">
    <div className="contact-form-heading"><span className="contact-kicker">A note to start</span><h2 id="contact-form-title">What’s on your mind?</h2></div>
    <div className="contact-field-row"><label>Your name <span className="contact-optional">optional</span><input name="name" autoComplete="name" maxLength={80} value={draft.name} onChange={event=>update('name',event.target.value)}/></label><label>Your email<input name="email" type="email" autoComplete="email" required maxLength={254} value={draft.email} onChange={event=>update('email',event.target.value)}/></label></div>
    <div className="contact-topic">I’d like to talk about<Dropdown label="I’d like to talk about" name="topic" value={draft.topic} onChange={value=>update('topic',value)} options={['A project','A role','A collaboration','A question'].map(value=>({value,label:value}))}/></div>
    <label>Your message<textarea name="message" required rows={5} maxLength={3000} placeholder="A little context, what you have in mind, and anything useful to know." value={draft.message} onChange={event=>update('message',event.target.value)}/></label>
    <div className="contact-form-bottom"><button type="submit" className="contact-submit">{recipient?'Open email draft':'Copy message draft'}<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m3 11 18-8-8 18-2-8-8-2Zm8 2L21 3"/></svg></button><p>{recipient?'Opens your email app. You review and send.':'Draft only. Contact details are being finalized.'}</p></div>
    <p className="contact-status" role="status" aria-live="polite" aria-atomic="true">{status}</p>
    {manual&&<label>Message draft<textarea ref={output} readOnly rows={7} value={manual}/><button type="button" className="contact-text-button" onClick={()=>{output.current?.focus();output.current?.select();}}>Select draft</button></label>}
    <p className="contact-privacy">No server submission or saved form data. Fields stay in this page until you choose to copy the draft or open your email app.</p>
  </form>;
}
