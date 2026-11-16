import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {decodeReviewPng,MAX_REVIEW_DATA_LENGTH} from '../lib/quest-preview/review-png.ts';
test('review PNG decoder preserves genuine image bytes and dimensions',async()=>{
 const png=await sharp({create:{width:64,height:48,channels:3,background:'#cbd4c3'}}).png().toBuffer();
 const decoded=decodeReviewPng('data:image/png;base64,'+png.toString('base64'));
 assert.equal(decoded.width,64);assert.equal(decoded.height,48);assert.deepEqual(decoded.bytes,png);
});
test('large image data is validated without regexp-stack failures',()=>{
 assert.equal(decodeReviewPng('data:image/png;base64,'+'A'.repeat(5_000_000)),null);
 assert.equal(decodeReviewPng('data:image/png;base64,'+'A'.repeat(MAX_REVIEW_DATA_LENGTH)),null);
});
test('invalid, truncated and incorrectly padded captures fail cleanly',()=>{
 for(const data of [null,{},'data:image/jpeg;base64,AAAA','data:image/png;base64,','data:image/png;base64,A===','data:image/png;base64,AAAA!AAA','data:image/png;base64,iVBORw0KGgo='])assert.equal(decodeReviewPng(data),null);
});
