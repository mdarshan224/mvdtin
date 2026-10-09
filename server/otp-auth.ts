import {db,config} from './db';
import {ApiError} from './content';

const lifetime=300,sessionLifetime=1800,cooldown=60;
export function normalizeMobile(input:unknown){
  if(typeof input!=='string'||input.length>24)throw new ApiError(400,'Enter a valid Indian mobile number.');
  const match=input.replace(/[\s()-]/g,'').match(/^(?:\+?91)?([6-9][0-9]{9})$/);
  if(!match)throw new ApiError(400,'Enter a valid Indian mobile number.');
  return match[1];
}
const mask=(phone:string)=>'••••••'+phone.slice(-4);
export async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
function allowed(){return (config().ADMIN_ALLOWED_PHONES||'').split(',').map(x=>x.trim()).filter(Boolean).map(normalizeMobile);}
function authorizedPhone(input:unknown){const phone=normalizeMobile(input);if(!allowed().includes(phone))throw new ApiError(403,'Access is restricted to authorized administrators.');return phone;}
function cookieName(request:Request){return new URL(request.url).protocol==='https:'?'__Host-dtm_admin_session':'dtm_admin_session';}
function token(request:Request){return request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName(request)+'='))?.split('=')[1]||'';}
function cookie(request:Request,value:string,maxAge:number){return `${cookieName(request)}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
function response(data:unknown,status=200,setCookie?:string){const headers:Record<string,string>={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};if(setCookie)headers['Set-Cookie']=setCookie;return data===null?new Response(null,{status,headers}):Response.json(data,{status,headers});}
export async function adminSession(request:Request){
  const empty={email:'',roles:[] as string[],mode:'review-sql',authMethod:'otp'};
  const value=token(request);if(!/^[a-f0-9]{64}$/.test(value))return empty;
  const row=await db().prepare('SELECT phone_hash,display_name FROM admin_sessions WHERE token_hash=? AND expires_at>?').bind(await digest(value),Date.now()).first<{phone_hash:string;display_name:string}>();
  if(!row)return empty;
  const hashes=await Promise.all(allowed().map(digest));if(!hashes.includes(row.phone_hash))return empty;
  return {...empty,displayName:row.display_name,roles:['ADMIN']};
}
async function provider(action:'send'|'verify'|'resend',payload:Record<string,unknown>){
  const c=config();if(!c.FAST2SMS_API_KEY||!c.FAST2SMS_OTP_ID)throw new ApiError(503,'SMS sign-in is temporarily unavailable.');
  let result:Response;
  // Workers rejects redirect:'error' before any network request. Manual mode
  // also prevents forwarding the authorization key to a redirect destination.
  try{result=await fetch(`https://www.fast2sms.com/dev/otp/${action}`,{method:'POST',headers:{Authorization:c.FAST2SMS_API_KEY,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000),redirect:'manual'});}catch(error){console.error('SMS provider transport failed',{action,kind:error instanceof DOMException&&error.name==='TimeoutError'?'timeout':'request-failed'});throw new ApiError(503,'The SMS service could not be reached. Please try again.');}
  if(result.status>=300&&result.status<400){console.error('SMS provider redirect rejected',{action,status:result.status});throw new ApiError(503,'SMS sign-in is temporarily unavailable. Please try again.');}
  let data:Record<string,unknown>;try{data=await result.json();}catch{throw new ApiError(503,'The SMS service returned an invalid response.');}
  const succeeded=typeof data.return==='boolean'?data.return:typeof data.success==='boolean'?data.success:data.status==='success';
  if(result.ok&&succeeded)return;
  if(action==='verify'&&[400,404].includes(result.status))throw new ApiError(400,'The code is incorrect, expired or already used.');
  if(action==='verify'&&result.ok)throw new ApiError(400,'The code is incorrect, expired or already used.');
  if(action==='resend'&&[400,404].includes(result.status))throw new ApiError(400,'This code cannot be resent. Request a new code.');
  // Never forward provider responses, credentials, mobile numbers or OTPs.
  throw new ApiError(503,'SMS sign-in is temporarily unavailable. Please try again.');
}
type Rate=(request:Request,path:string,limit:number)=>Promise<void>;
async function deliveryLimit(phoneHash:string,now:number){
  const key='otp-delivery:'+phoneHash+':'+Math.floor(now/3600000);
  const result=await db().prepare('INSERT INTO rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,Math.floor(now/60000)+61).first<{count:number}>();
  if((result?.count||0)>6)throw new ApiError(429,'Too many code requests. Please try again later.');
}
export async function otpAuth(request:Request,action:string,input:Record<string,unknown>,rate:Rate){
  if(action==='logout'){
    const value=token(request);if(value)await db().prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await digest(value)).run();
    return response(null,204,cookie(request,'',0));
  }
  if(!['send','verify','resend'].includes(action))throw new ApiError(404,'Endpoint not found.');
  await rate(request,'auth-'+action,action==='verify'?12:5);
  const phone=authorizedPhone(input.mobile),phoneHash=await digest(phone),now=Date.now();
  const conn=db();
  if(action==='send'){
    if(!config().FAST2SMS_API_KEY||!config().FAST2SMS_OTP_ID)throw new ApiError(503,'SMS sign-in is temporarily unavailable.');
    const challengeId=crypto.randomUUID();
    const reserved=await conn.prepare('INSERT INTO otp_challenges(phone_hash,challenge_id,created_at,expires_at,last_sent_at,attempts,resends,consumed) VALUES(?,?,?,?,?,0,0,0) ON CONFLICT(phone_hash) DO UPDATE SET challenge_id=excluded.challenge_id,created_at=excluded.created_at,expires_at=excluded.expires_at,last_sent_at=excluded.last_sent_at,attempts=0,resends=0,consumed=0 WHERE otp_challenges.last_sent_at<=? RETURNING challenge_id').bind(phoneHash,challengeId,now,now+lifetime*1000,now,now-cooldown*1000).first();
    if(!reserved)throw new ApiError(429,'Wait 60 seconds before requesting another code.');
    // Per-phone buckets prevent bypassing SMS limits by changing IP addresses.
    await deliveryLimit(phoneHash,now);
    try{await provider('send',{mobile:phone,otp_id:config().FAST2SMS_OTP_ID,otp_expiry:5,otp_length:6});}
    catch(e){await conn.prepare('UPDATE otp_challenges SET consumed=1 WHERE challenge_id=?').bind(challengeId).run();throw e;}
    await conn.prepare('DELETE FROM admin_sessions WHERE expires_at<?').bind(now).run();
    return response({challengeId,maskedMobile:mask(phone),expiresIn:lifetime,resendAfter:cooldown},201);
  }
  if(typeof input.challengeId!=='string'||!/^[a-f0-9-]{36}$/.test(input.challengeId))throw new ApiError(400,'Request a new sign-in code.');
  const challenge=await conn.prepare('SELECT * FROM otp_challenges WHERE phone_hash=? AND challenge_id=? AND expires_at>? AND consumed=0').bind(phoneHash,input.challengeId,now).first<{attempts:number;resends:number;expires_at:number;last_sent_at:number}>();
  if(!challenge)throw new ApiError(400,'This code has expired or was used. Request a new code.');
  if(action==='resend'){
    if(challenge.attempts>=5)throw new ApiError(429,'Too many attempts. Request a new code after expiry.');
    const reserved=await conn.prepare('UPDATE otp_challenges SET last_sent_at=?,resends=resends+1 WHERE phone_hash=? AND challenge_id=? AND last_sent_at<=? AND resends<3 AND consumed=0 AND expires_at>? RETURNING challenge_id').bind(now,phoneHash,input.challengeId,now-cooldown*1000,now).first();
    if(!reserved)throw new ApiError(429,'Wait 60 seconds before resending, or request a new code after expiry.');
    await deliveryLimit(phoneHash,now);
    await provider('resend',{mobile:phone});
    return response({challengeId:input.challengeId,maskedMobile:mask(phone),expiresIn:Math.max(0,Math.floor((challenge.expires_at-now)/1000)),resendAfter:cooldown});
  }
  if(typeof input.otp!=='string'||!/^\d{6}$/.test(input.otp))throw new ApiError(400,'Enter the six-digit code.');
  const attempt=await conn.prepare('UPDATE otp_challenges SET attempts=attempts+1 WHERE phone_hash=? AND challenge_id=? AND attempts<5 AND consumed=0 AND expires_at>? RETURNING attempts').bind(phoneHash,input.challengeId,now).first();
  if(!attempt)throw new ApiError(429,'Too many attempts. Request a new code after expiry.');
  await provider('verify',{mobile:phone,otp:input.otp});
  const claimed=await conn.prepare('UPDATE otp_challenges SET consumed=1 WHERE phone_hash=? AND challenge_id=? AND consumed=0 AND expires_at>? RETURNING challenge_id').bind(phoneHash,input.challengeId,Date.now()).first();
  if(!claimed)throw new ApiError(400,'This code has already been used.');
  const bytes=crypto.getRandomValues(new Uint8Array(32)),value=Array.from(bytes).map(x=>x.toString(16).padStart(2,'0')).join('');
  const previous=token(request);if(previous)await conn.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await digest(previous)).run();
  await conn.prepare('INSERT INTO admin_sessions(token_hash,phone_hash,display_name,created_at,expires_at) VALUES(?,?,?,?,?)').bind(await digest(value),phoneHash,mask(phone),now,now+sessionLifetime*1000).run();
  return response({user:{email:'',displayName:mask(phone),roles:['ADMIN']},mode:'review-sql',expiresIn:sessionLifetime},200,cookie(request,value,sessionLifetime));
}
