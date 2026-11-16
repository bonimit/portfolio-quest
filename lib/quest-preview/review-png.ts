export const MAX_REVIEW_DATA_LENGTH=14_000_000;
/** Scan bounded chunks so large captures never exhaust the regexp interpreter stack. */
export function decodeReviewPng(data:unknown){
 const prefix='data:image/png;base64,';
 if(typeof data!=='string'||!data.startsWith(prefix)||data.length>MAX_REVIEW_DATA_LENGTH)return null;
 const encoded=data.slice(prefix.length);if(!encoded.length||encoded.length%4)return null;
 for(let offset=0;offset<encoded.length;offset+=8192)if(/[^A-Za-z0-9+/=]/.test(encoded.slice(offset,offset+8192)))return null;
 const padding=encoded.indexOf('=');if(padding>=0&&(padding<encoded.length-2||/[^=]/.test(encoded.slice(padding))))return null;
 const bytes=Buffer.from(encoded,'base64');
 if(bytes.length<24||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||bytes.subarray(12,16).toString()!=='IHDR')return null;
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);if(!width||!height||width>7680||height>7680)return null;
 return {bytes,width,height};
}
