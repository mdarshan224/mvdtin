import Workspace from '@/frontend/src/layouts/workspace';import {snapshot} from '@/server/content';
export const dynamic='force-dynamic';
export default async function Page(){try{return <Workspace initialData={await snapshot()}/>;}catch(error){console.error('Content load failed',error instanceof Error?error.message:'Unknown');return <Workspace initialError="The content service could not be reached. Please try again."/>;}}
