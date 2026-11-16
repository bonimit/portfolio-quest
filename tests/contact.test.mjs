import test from 'node:test';
import assert from 'node:assert/strict';
import {contactDraftText,contactMailto} from '../lib/contact.ts';
const draft={name:'Alex',email:'alex@example.test',topic:'A project',message:'Hello! A question about design & collaboration.'};
test('contact draft preserves message and reply details without transmitting them',()=>{
 const text=contactDraftText(draft);assert.match(text,/From: Alex/);assert.match(text,/Reply to: alex@example.test/);assert.ok(text.includes(draft.message));
});
test('an absent or invalid public address never produces a mail action',()=>{
 for(const recipient of [null,'','invalid','a@example.test\nBcc: other@example.test'])assert.equal(contactMailto(recipient,draft),undefined);
});
test('email app action encodes user input and keeps destination fixed',()=>{
 const href=contactMailto('owner@example.test',{...draft,topic:'A project\nBcc: bad',message:'Hi & hello? #design\nSecond line ✨'});
 assert.ok(href.startsWith('mailto:owner@example.test?subject='));
 const query=new URLSearchParams(href.split('?')[1]);assert.ok(!query.get('subject').includes('\n'));assert.match(query.get('body'),/Hi & hello\? #design\nSecond line ✨/);assert.equal(query.get('bcc'),null);
});
