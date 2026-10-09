'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {ShieldCheck} from 'lucide-react';
import {api,request,setAccessToken} from '../api/client';
import type {Session} from '../types';

type Challenge={challengeId:string;maskedMobile:string;expiresIn:number;resendAfter:number};
export default function OtpLogin({onLogin}:{onLogin:(session:Session)=>void}){
  const [mobile,setMobile]=useState(''),[otp,setOtp]=useState(''),[challenge,setChallenge]=useState<Challenge|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const [resendAt,setResendAt]=useState(0),[expiresAt,setExpiresAt]=useState(0),[now,setNow]=useState(Date.now());
  useEffect(()=>{if(!challenge)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[challenge]);
  const wait=Math.max(0,Math.ceil((resendAt-now)/1000)),remaining=Math.max(0,Math.ceil((expiresAt-now)/1000));
  const send=async()=>{
    setBusy(true);setError('');setNotice('');
    try{const next=await request<Challenge>('/auth/otp/send',{method:'POST',body:JSON.stringify({mobile})});const time=Date.now();setChallenge(next);setNow(time);setResendAt(time+next.resendAfter*1000);setExpiresAt(time+next.expiresIn*1000);setOtp('');setNotice('A sign-in code was sent to '+next.maskedMobile+'.');}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  };
  const verify=async(e:FormEvent)=>{
    e.preventDefault();if(!challenge){await send();return;}if(!remaining){setError('The code has expired. Request a new code.');return;}
    setBusy(true);setError('');
    try{const result=await request<{accessToken?:string}>('/auth/otp/verify',{method:'POST',body:JSON.stringify({mobile,otp,challengeId:challenge.challengeId})});if(result.accessToken)setAccessToken(result.accessToken);const session=await api.session();if(!session.roles.includes('ADMIN'))throw new Error('Administrator access could not be established.');onLogin(session);}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  };
  const resend=async()=>{
    if(!challenge)return;setBusy(true);setError('');setNotice('');
    try{const next=await request<Challenge>('/auth/otp/resend',{method:'POST',body:JSON.stringify({mobile,challengeId:challenge.challengeId})});const time=Date.now();setNow(time);setResendAt(time+next.resendAfter*1000);setExpiresAt(time+next.expiresIn*1000);setNotice('The sign-in code was resent.');}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  };
  return <section className="admin-signin panel pad"><ShieldCheck size={32}/><h2>Administrator sign-in</h2><p>Use an authorized mobile number to receive a sign-in code.</p><form onSubmit={verify}>
    {!challenge?<label>Mobile number<input name="mobile" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="10-digit mobile number" required maxLength={24} value={mobile} onChange={e=>setMobile(e.target.value)} disabled={busy}/></label>:<>
      <p className="small muted">Code sent to {challenge.maskedMobile}</p><label>Six-digit code<input name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} disabled={busy||!remaining}/></label>
      <p className="small muted" aria-live="off">{remaining?`Expires in ${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`:'Code expired'}</p>
    </>}
    <button className="btn primary" disabled={busy||!!challenge&&!remaining}>{busy?'Please wait…':challenge?'Verify and sign in':'Send sign-in code'}</button>
    {challenge&&<div className="row wrap"><button type="button" className="btn small-btn" onClick={remaining?resend:send} disabled={busy||wait>0}>{remaining?(wait?`Resend in ${wait}s`:'Resend code'):'Request a new code'}</button><button type="button" className="text-link" disabled={busy} onClick={()=>{setChallenge(null);setOtp('');setError('');setNotice('');}}>Change mobile number</button></div>}
  </form>{notice&&<p role="status" className="small">{notice}</p>}{error&&<p role="alert" className="error-text">{error}</p>}</section>;
}
