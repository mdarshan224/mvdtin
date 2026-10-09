import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/api/v1/admin','/signin-with-chatgpt']},sitemap:'https://mvdt.in/sitemap.xml'};}
