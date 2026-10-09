// @vitest-environment node
import {it,expect} from 'vitest';
import {renderToString} from 'react-dom/server';
import {PlatformRouter,Link,usePathname} from '../components/navigation';
function Route(){return <><output>{usePathname()}</output><Link href="/projects">Projects</Link></>;}
it('server rendering starts the shared router at a direct nested URL',()=>{
  const html=renderToString(<PlatformRouter initialPath="/projects/junk-it-out"><Route/></PlatformRouter>);expect(html).toContain('<output>/projects/junk-it-out</output>');expect(html).toContain('href="/projects"');
});
it('server rendering supports direct /admin without a browser global',()=>{
  const html=renderToString(<PlatformRouter initialPath="/admin"><Route/></PlatformRouter>);expect(html).toContain('<output>/admin</output>');
});
