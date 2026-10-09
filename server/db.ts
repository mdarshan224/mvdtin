import {env} from 'cloudflare:workers';
export const db=()=>{if(!env.DB)throw new Error('Database unavailable');return env.DB;};
export const bucket=()=>{if(!env.BUCKET)throw new Error('Uploads unavailable');return env.BUCKET;};
export const config=()=>env as typeof env & {BACKEND_URL?:string;FAST2SMS_API_KEY?:string;FAST2SMS_OTP_ID?:string;ADMIN_ALLOWED_PHONES?:string};
