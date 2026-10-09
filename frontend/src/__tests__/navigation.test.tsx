import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {act} from 'react';
import {renderToString} from 'react-dom/server';
import {hydrateRoot} from 'react-dom/client';
import {MemoryRouter,useLocation} from 'react-router-dom';
import Workspace from '../layouts/workspace';
import {Link,useRouter,PlatformRouter} from '../components/navigation';
import seed from '../data/seed.json';
import {api} from '../api/client';
const snapshot=Object.groupBy(seed,row=>row.resource) as any;
vi.mock('../api/client',()=>({track:vi.fn(),loadSnapshot:vi.fn(),api:{list:vi.fn(),detail:vi.fn(),search:vi.fn(),session:vi.fn()},request:vi.fn(async()=>({mode:'review-sql'})),setAccessToken:vi.fn(),getAccessToken:vi.fn(()=>''),allContent:vi.fn()}));
beforeEach(()=>{
  window.history.replaceState(null,'','/');localStorage.clear();window.scrollTo=vi.fn();
  window.matchMedia=vi.fn().mockImplementation(()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  vi.mocked(api.list).mockImplementation(async(resource:any)=>({items:snapshot[resource.replace('admin/','')]||[],total:10,page:0,size:100,totalPages:1}));
  vi.mocked(api.session).mockResolvedValue({email:'',roles:[],mode:'review-sql'});
  vi.mocked(api.detail).mockImplementation(async(resource:any,slug:any)=>snapshot[resource].find((x:any)=>x.slug===slug));
  vi.mocked(api.search).mockResolvedValue([]);
});
afterEach(()=>{cleanup();vi.clearAllMocks();});
it('renders each workspace when its sidebar link is clicked',async()=>{
  render(<Workspace initialData={snapshot}/>);
  const routes=[['Project explorer','/projects','The work, in context.'],['Architecture','/architecture','Follow the request.'],['Code lab','/code','Read the implementation.'],['Systems & experiments','/labs','A place to work things out.'],['Stack & skills','/stack','Tools with a purpose.'],['Experience','/experience','A timeline of the work.'],['Engineering journal','/articles','Notes from the build.'],['Resume','/resume','Experience, at a glance.'],['Contact','/contact','Let’s build a useful system.'],['Developer documentation','/docs','Inspect the platform.'],['Overview','/','Engineering.Connected.']];
  for(const [name,path,title] of routes){fireEvent.click(screen.getAllByRole('link',{name:new RegExp(name,'i')})[0]);await waitFor(()=>expect(window.location.pathname).toBe(path));await waitFor(()=>expect(document.querySelector('#main-content h1')?.textContent).toBe(title));expect(screen.queryByText('Page not found')).toBeNull();}
});
it('keeps admin hidden from public navigation and supports direct /admin',async()=>{
  const view=render(<Workspace initialData={snapshot}/>);expect(document.querySelector('a[href^="/admin"]')).toBeNull();view.unmount();window.history.replaceState(null,'','/admin');render(<Workspace route="/admin" initialData={snapshot}/>);
  await screen.findByRole('heading',{name:'Administrator sign-in'});expect(screen.getByLabelText('Mobile number')).toBeTruthy();expect(screen.queryByLabelText('Password')).toBeNull();
});
it('supports project detail links, back links and browser history',async()=>{
  render(<Workspace initialData={snapshot}/>);fireEvent.click(screen.getAllByRole('link',{name:/Project explorer/i})[0]);
  const project=snapshot.projects[0];const projectLink=document.querySelector<HTMLAnchorElement>(`a[href="/projects/${project.slug}"]`)!;fireEvent.click(projectLink);
  await waitFor(()=>expect(document.querySelector('#main-content h1')?.textContent).toBe(project.name));fireEvent.click(screen.getAllByRole('link',{name:/Project explorer/i}).find(x=>x.classList.contains('back-link'))!);await waitFor(()=>expect(window.location.pathname).toBe('/projects'));
  await act(async()=>{window.history.replaceState(null,'','/contact');window.dispatchEvent(new PopStateEvent('popstate'));});await waitFor(()=>expect(screen.getByRole('heading',{name:/Let’s build a useful system/i})).toBeTruthy());
});
function NavigationProbe(){const router=useRouter(),location=useLocation();return <><Link href="/contact">Contact route</Link><button onClick={()=>router.push('/stack')}>Open stack</button><output>{location.pathname}</output></>;}
it('hydrates its routing shell and keeps links and programmatic navigation working',async()=>{
  const tree=<MemoryRouter initialEntries={['/']}><NavigationProbe/></MemoryRouter>;
  const container=document.createElement('div');document.body.appendChild(container);container.innerHTML=renderToString(tree);
  let root:ReturnType<typeof hydrateRoot>;await act(async()=>{root=hydrateRoot(container,tree);});fireEvent.click(screen.getByRole('link',{name:'Contact route'}));expect(screen.getByRole('status').textContent).toBe('/contact');fireEvent.click(screen.getByRole('button',{name:'Open stack'}));expect(screen.getByRole('status').textContent).toBe('/stack');await act(async()=>root!.unmount());container.remove();
});
