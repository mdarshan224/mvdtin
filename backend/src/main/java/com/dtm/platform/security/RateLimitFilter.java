package com.dtm.platform.security;import org.springframework.stereotype.Component;import org.springframework.web.filter.OncePerRequestFilter;import jakarta.servlet.*;import jakarta.servlet.http.*;import java.io.IOException;import java.util.concurrent.ConcurrentHashMap;
@Component public class RateLimitFilter extends OncePerRequestFilter {
 private record Window(long minute,int count){}
 private final ConcurrentHashMap<String,Window> windows=new ConcurrentHashMap<>();
 protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{
  if(request.getContentType()!=null&&request.getContentType().startsWith("application/json")&&request.getContentLengthLong()>262144){response.setStatus(413);response.setContentType("application/json");response.getWriter().write("{\"message\":\"JSON request is too large.\"}");return;}String path=request.getRequestURI();int limit=path.startsWith("/api/v1/auth/otp/")?(path.endsWith("/verify")?12:5):path.equals("/api/v1/auth/login")?10:path.equals("/api/v1/contact")?5:path.equals("/api/v1/analytics/events")?120:0;
  if(limit==0||!request.getMethod().equals("POST")){chain.doFilter(request,response);return;}
  long minute=System.currentTimeMillis()/60000;String key=path+":"+request.getRemoteAddr();
  if(windows.size()>10000)windows.entrySet().removeIf(x->x.getValue().minute<minute);
  if(windows.size()>10000&&!windows.containsKey(key)){response.setStatus(429);return;}
  Window w=windows.compute(key,(k,old)->old==null||old.minute!=minute?new Window(minute,1):new Window(minute,old.count+1));
  if(w.count>limit){response.setStatus(429);response.setContentType("application/json");response.setHeader("Retry-After","60");response.getWriter().write("{\"message\":\"Please wait a minute before trying again.\"}");return;}chain.doFilter(request,response);
 }
}
