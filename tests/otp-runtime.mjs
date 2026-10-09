import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';

// Exercise the actual REST handler in workerd, rather than Node's fetch mock.
// Outbound traffic is intercepted: no real credentials or SMS are used.
const require=createRequire(import.meta.url);
const runtimeRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=runtimeRequire('miniflare');
const {build}=runtimeRequire('esbuild');
const origin='https://dtm.example.test';
const mobile='6999999999';
const bundle=await build({
  stdin:{contents:`import {handle} from './server/api'; export default {fetch(request){return handle(request,new URL(request.url).pathname.split('/').slice(3));}};`,resolveDir:process.cwd(),sourcefile:'otp-runtime-entry.ts',loader:'ts'},
  bundle:true,write:false,format:'esm',platform:'browser',target:'es2022',
  external:['cloudflare:workers'],alias:{'@':process.cwd()},
});

test('OTP integration in the hosted Worker runtime',async t=>{
  let providerMode='success';
  const calls=[];
  const mf=new Miniflare({
    modules:true,compatibilityDate:'2026-05-15',script:bundle.outputFiles[0].text,
    bindings:{ADMIN_ALLOWED_PHONES:mobile+',6888888888',FAST2SMS_API_KEY:'runtime-test-key',FAST2SMS_OTP_ID:'runtime-test-template'},
    d1Databases:{DB:'otp-runtime-isolated-test'},
    outboundService:async request=>{
      const url=new URL(request.url);
      calls.push({url:request.url,body:await request.json()});
      assert.equal(url.origin,'https://www.fast2sms.com');
      assert.equal(request.headers.get('authorization'),'runtime-test-key');
      assert.equal(request.headers.get('accept'),'application/json');
      if(providerMode==='redirect')return new Response(null,{status:302,headers:{Location:'https://other.example.test/leak'}});
      if(providerMode==='denied')return Response.json({return:false,message:'runtime-test-key must never be returned'},{status:401});
      if(providerMode==='invalid')return new Response('<html>Unavailable</html>');
      return Response.json({return:true});
    },
  });
  try{
    const db=await mf.getD1Database('DB');
    for(const file of ['drizzle/0000_dark_sage.sql','drizzle/0001_clumsy_hemingway.sql']){
      for(const statement of (await readFile(file,'utf8')).split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))await db.prepare(statement).run();
    }
    const post=(action,body)=>mf.dispatchFetch(origin+'/api/v1/auth/otp/'+action,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
    let challenge;
    await t.test('sends using a Worker-compatible request and persists the challenge',async()=>{
      const response=await post('send',{mobile});assert.equal(response.status,201);challenge=await response.json();assert.ok(challenge.challengeId);assert.equal(calls.length,1);assert.deepEqual(calls[0].body,{mobile,otp_id:'runtime-test-template',otp_expiry:5,otp_length:6});
    });
    await t.test('verifies the provider result before creating a secure admin session',async()=>{
      const response=await post('verify',{mobile,challengeId:challenge.challengeId,otp:'123456'});assert.equal(response.status,200);
      const cookie=response.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);
      const me=await mf.dispatchFetch(origin+'/api/v1/auth/me',{headers:{Cookie:cookie.split(';')[0]}});assert.deepEqual((await me.json()).roles,['ADMIN']);assert.equal(calls.length,2);
    });
    await t.test('denies unauthorized phones before making an outbound request',async()=>{
      const count=calls.length;assert.equal((await post('send',{mobile:'6777777777'})).status,403);assert.equal(calls.length,count);
    });
    await t.test('rejects redirects without forwarding credentials to another host',async()=>{
      providerMode='redirect';const count=calls.length;const response=await post('send',{mobile:'6888888888'});assert.equal(response.status,503);assert.equal(calls.length,count+1);assert.equal((await response.json()).message,'SMS sign-in is temporarily unavailable. Please try again.');
    });
    await t.test('keeps provider authorization errors and response text private',async()=>{
      await db.prepare('DELETE FROM otp_challenges').run();providerMode='denied';const response=await post('send',{mobile});assert.equal(response.status,503);assert.ok(!(await response.text()).includes('runtime-test-key'));
    });
    await t.test('fails closed on a malformed provider response',async()=>{
      await db.prepare('DELETE FROM otp_challenges').run();providerMode='invalid';const response=await post('send',{mobile});assert.equal(response.status,503);assert.equal((await response.json()).message,'The SMS service returned an invalid response.');
    });
  }finally{await mf.dispose();}
});
