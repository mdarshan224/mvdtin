// @vitest-environment node
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';

const fixture=vi.hoisted(()=>({db:null as any,config:{ADMIN_ALLOWED_PHONES:'6999999999,6888888888',FAST2SMS_API_KEY:'test-provider-key',FAST2SMS_OTP_ID:'test-template'}}));
vi.mock('../server/db',()=>({db:()=>fixture.db,config:()=>fixture.config}));
import {otpAuth,adminSession,normalizeMobile} from '../server/otp-auth';
const origin='https://dtm.example.test',mobile='6999999999',rate=vi.fn(async()=>{});
let sql:DatabaseSync,fetchMock:ReturnType<typeof vi.spyOn>;
const request=(cookie='')=>new Request(origin+'/api/v1/auth/otp/send',{headers:{Origin:origin,Cookie:cookie}});
async function send(){const response=await otpAuth(request(),'send',{mobile},rate);return response.json() as Promise<{challengeId:string}>;}
beforeEach(()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-02T10:00:00Z'));rate.mockClear();
  fixture.config.ADMIN_ALLOWED_PHONES='6999999999,6888888888';
  sql=new DatabaseSync(':memory:');sql.exec(readFileSync('drizzle/0001_clumsy_hemingway.sql','utf8'));sql.exec('CREATE TABLE rate_limits(key TEXT PRIMARY KEY,count INTEGER,expires_at INTEGER)');
  fixture.db={prepare:(text:string)=>({bind:(...args:any[])=>({first:async()=>sql.prepare(text).get(...args)||null,run:async()=>{const out=sql.prepare(text).run(...args);return {meta:{changes:Number(out.changes),last_row_id:Number(out.lastInsertRowid)}};}})})};
  fetchMock=vi.spyOn(globalThis,'fetch').mockImplementation(async()=>Response.json({return:true}));
});
afterEach(()=>{vi.restoreAllMocks();vi.useRealTimers();sql.close();});
it('normalizes Indian prefixes and rejects unrelated phone strings',()=>{
  expect(normalizeMobile('+91 69999 99999')).toBe(mobile);expect(()=>normalizeMobile('abc6999999999')).toThrow();
});
it('denies unauthorized numbers before contacting the SMS provider',async()=>{
  await expect(otpAuth(request(),'send',{mobile:'6777777777'},rate)).rejects.toMatchObject({status:403});expect(fetchMock).not.toHaveBeenCalled();
});
it('sends a six-digit five-minute OTP using server-only authorization',async()=>{
  const data=await send();expect(data.challengeId).toBeTruthy();const [url,options]=fetchMock.mock.calls[0];expect(url).toBe('https://www.fast2sms.com/dev/otp/send');expect((options as RequestInit).headers).toMatchObject({Authorization:'test-provider-key'});
  expect(JSON.parse((options as RequestInit).body as string)).toEqual({mobile,otp_id:'test-template',otp_length:6,otp_expiry:5});expect(JSON.stringify(data)).not.toContain('test-provider-key');expect(JSON.stringify(data)).not.toContain(mobile);
});
it('enforces send and resend cooldowns',async()=>{
  const data=await send();await expect(otpAuth(request(),'send',{mobile},rate)).rejects.toMatchObject({status:429});await expect(otpAuth(request(),'resend',{mobile,...data},rate)).rejects.toMatchObject({status:429});
  vi.advanceTimersByTime(60000);await otpAuth(request(),'resend',{mobile,...data},rate);expect(fetchMock.mock.calls[1][0]).toBe('https://www.fast2sms.com/dev/otp/resend');
});
it('caps a phone at six SMS requests per hour across changing challenges',async()=>{
  for(let i=0;i<6;i++){await send();vi.advanceTimersByTime(61000);}await expect(send()).rejects.toMatchObject({status:429});expect(fetchMock).toHaveBeenCalledTimes(6);
});
it('counts failed verification attempts and never grants a session',async()=>{
  const data=await send();fetchMock.mockImplementation(async()=>Response.json({return:false},{status:400}));
  for(let i=0;i<5;i++)await expect(otpAuth(request(),'verify',{mobile,...data,otp:'111111'},rate)).rejects.toMatchObject({status:400});
  await expect(otpAuth(request(),'verify',{mobile,...data,otp:'111111'},rate)).rejects.toMatchObject({status:429});expect((sql.prepare('SELECT count(*) n FROM admin_sessions').get() as any).n).toBe(0);
});
it('rejects expired challenges without calling verification',async()=>{
  const data=await send();vi.advanceTimersByTime(300001);await expect(otpAuth(request(),'verify',{mobile,...data,otp:'123456'},rate)).rejects.toMatchObject({status:400});expect(fetchMock).toHaveBeenCalledTimes(1);
});
it('does not authenticate from HTTP 200 when the provider reports failure',async()=>{
  const data=await send();fetchMock.mockImplementation(async()=>Response.json({return:false,status:'success'}));await expect(otpAuth(request(),'verify',{mobile,...data,otp:'123456'},rate)).rejects.toMatchObject({status:400});
});
it('creates a secure cookie only after verification and rejects replay',async()=>{
  const data=await send();const response=await otpAuth(request(),'verify',{mobile,...data,otp:'123456'},rate);const cookie=response.headers.get('set-cookie')!;
  expect(cookie).toContain('__Host-dtm_admin_session=');expect(cookie).toContain('HttpOnly');expect(cookie).toContain('SameSite=Strict');expect(cookie).toContain('Secure');expect(cookie).toContain('Max-Age=1800');
  const session=await adminSession(request(cookie.split(';')[0]));expect(session.roles).toEqual(['ADMIN']);expect(session).toMatchObject({displayName:'••••••9999'});
  await expect(otpAuth(request(),'verify',{mobile,...data,otp:'123456'},rate)).rejects.toMatchObject({status:400});expect((await response.json() as {accessToken?:string}).accessToken).toBeUndefined();
});
it('revokes a session on logout and rejects platform-header bypasses',async()=>{
  const data=await send();const signed=await otpAuth(request(),'verify',{mobile,...data,otp:'123456'},rate);const cookie=signed.headers.get('set-cookie')!.split(';')[0];
  expect((await adminSession(request(cookie))).roles).toEqual(['ADMIN']);await otpAuth(request(cookie),'logout',{},rate);expect((await adminSession(request(cookie))).roles).toEqual([]);
  expect((await adminSession(new Request(origin,{headers:{'oai-authenticated-user-id':'old-owner','oai-authenticated-user-email':'owner@example.test'}}))).roles).toEqual([]);
});
it('invalidates sessions when a phone loses access or the session expires',async()=>{
  const data=await send();const signed=await otpAuth(request(),'verify',{mobile,...data,otp:'123456'},rate);const cookie=signed.headers.get('set-cookie')!.split(';')[0];fixture.config.ADMIN_ALLOWED_PHONES='6888888888';expect((await adminSession(request(cookie))).roles).toEqual([]);
  fixture.config.ADMIN_ALLOWED_PHONES=mobile;vi.advanceTimersByTime(1800001);expect((await adminSession(request(cookie))).roles).toEqual([]);
});
it('fails closed on provider authorization errors and malformed responses',async()=>{
  fetchMock.mockImplementation(async()=>Response.json({return:false},{status:401}));await expect(send()).rejects.toMatchObject({status:503});expect((sql.prepare('SELECT consumed FROM otp_challenges').get() as any).consumed).toBe(1);
});
it('grants only one session for concurrent verification of one challenge',async()=>{
  const data=await send();const results=await Promise.allSettled([otpAuth(request(),'verify',{mobile,...data,otp:'123456'},rate),otpAuth(request(),'verify',{mobile,...data,otp:'123456'},rate)]);expect(results.filter(x=>x.status==='fulfilled')).toHaveLength(1);expect((sql.prepare('SELECT count(*) n FROM admin_sessions').get() as any).n).toBe(1);
});
