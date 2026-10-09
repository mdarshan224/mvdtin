'use client';
import {forwardRef,useMemo,useEffect,type ComponentPropsWithRef,type ReactNode} from 'react';
import {BrowserRouter,MemoryRouter,Link as RouterLink,useNavigate,useLocation,useInRouterContext} from 'react-router-dom';

// Both deployments share one client router. SSR starts at the requested URL;
// the browser handles links, programmatic navigation and history thereafter.
export function PlatformRouter({initialPath,children}:{initialPath:string;children:ReactNode}){
  const nested=useInRouterContext();
  if(nested)return <>{children}</>;
  return typeof window==='undefined'
    ? <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
    : <BrowserRouter>{children}</BrowserRouter>;
}
export const Link=forwardRef<HTMLAnchorElement,ComponentPropsWithRef<'a'>&{href:string}>(function Link({href,...props},ref){
  if(!href.startsWith('/')||href.startsWith('//')||props.download)return <a href={href} {...props} ref={ref}/>;
  return <RouterLink to={href} {...props} ref={ref}/>;
});
export function usePathname(){return useLocation().pathname;}
export function useRouter(){const navigate=useNavigate();return useMemo(()=>({push:(path:string)=>navigate(path),replace:(path:string)=>navigate(path,{replace:true})}),[navigate]);}
export function RouteScroll(){const {pathname}=useLocation();useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});},[pathname]);return null;}
