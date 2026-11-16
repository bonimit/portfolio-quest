import type { Metadata } from 'next';
import Link from 'next/link';
import {ContactComposer} from '@/components/contact/contact-composer';
import {contactDetails} from '@/lib/contact';
import './contact.css';

const description='Start a conversation about a project, a role or a collaboration. Prepare a message for Portfolio Quest.';
export const metadata: Metadata={title:'Contact',description,openGraph:{title:'Contact | Portfolio Quest',description}};

export default function ContactPage(){
  return <div className="contact-page">
    <header className="contact-intro"><p className="contact-kicker">Contact · A conversation starts here</p><h1>Let’s talk<span>.</span></h1><p className="contact-lede">Good work starts with<br/>a little curiosity.</p></header>
    <div className="contact-grid"><section className="contact-note" aria-labelledby="contact-note-title"><div className="contact-note-art" aria-hidden="true"><span/><i/><b/></div><h2 id="contact-note-title">Have something<br/>in mind?</h2><p>A project, a role, a collaboration—or a question about the work. Start with a short note.</p>
      <div className="contact-channel">{contactDetails.email?<><span className="contact-kicker">Email directly</span><a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a></>:<><span className="contact-kicker">Contact preview</span><dl className="contact-pending-channels"><div><dt>Email</dt><dd>Public address to be added</dd></div><div><dt>LinkedIn</dt><dd>Profile link to be added</dd></div></dl><p>You can prepare and copy a message here. Email and LinkedIn will connect once the public details are added.</p></>}</div>
      {contactDetails.links.length>0&&<nav className="contact-professional" aria-label="Professional profiles">{contactDetails.links.map(link=><a key={link.href} href={link.href}>{link.label}</a>)}</nav>}
    </section><ContactComposer recipient={contactDetails.email}/></div>
    <nav className="contact-next" aria-label="Keep exploring"><span>While you’re here</span><Link href="/work">Selected Work <span aria-hidden="true">↗</span></Link><Link href="/">Island Home <span aria-hidden="true">↗</span></Link></nav>
  </div>;
}
