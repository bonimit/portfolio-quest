/** Only owner-approved public channels belong here. No inferred/private addresses. */
export const contactDetails: {email:string|null;links:readonly {label:string;href:string}[]} = {
  email: null,
  links: [],
};
export type ContactDraft={name:string;email:string;topic:string;message:string};
export function contactDraftText(draft:ContactDraft):string {
  return [`${draft.topic.trim() || 'Hello'}`, '', draft.message.trim(), '', `From: ${draft.name.trim() || 'Not supplied'}`, `Reply to: ${draft.email.trim()}`].join('\n');
}
export function contactMailto(recipient:string|null,draft:ContactDraft):string|undefined {
  if(!recipient||! /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(recipient))return undefined;
  const subject=`Portfolio Quest · ${draft.topic.replace(/[\r\n]/g,' ').trim() || 'Hello'}`;
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(contactDraftText(draft))}`;
}
