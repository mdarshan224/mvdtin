import {handle} from '@/server/api';
export const dynamic='force-dynamic';
type Context={params:Promise<{path:string[]}>};
async function route(request:Request,context:Context){const {path}=await context.params;return handle(request,path);}
export const GET=route;export const POST=route;export const PUT=route;export const PATCH=route;export const DELETE=route;
