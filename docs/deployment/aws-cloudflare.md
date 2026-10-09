# AWS / Cloudflare rollout

No AWS account, DNS zone or production database credentials were provided. The supplied containers and this runbook prepare deployment; no AWS resources have been provisioned.

1. Create a staging environment on an AWS VM or container platform. For managed production data, use RDS MySQL 8.4 or a compatible supported engine in private subnets.
2. Configure secrets through AWS Secrets Manager or the deployment platform. Generate at least 32 random JWT bytes, base64 encoded. Keep SQL credentials and Fast2SMS credentials out of the frontend and repository.
3. Build and run the frontend and Java API, with persistent uploaded-media storage. The bundled file adapter uses a durable volume; use an S3 adapter if multiple API replicas need shared storage.
4. Terminate HTTPS at an ALB/reverse proxy. Configure exact CORS origins. Keep the API and database unavailable from public administrative ports.
5. Add a shared edge/WAF rate limit when scaling; the Java limiter is per instance. Enable aggregate retention cleanup and restrict operational logs.
6. Run the supplied JUnit/Mockito/MockMvc and Playwright checks, verify backups and restore, then perform load and Core Web Vitals checks. LCP <2.5s, CLS <0.1 and INP <200ms are targets, not measured outcomes.
7. Verify the existing domain origin, robots/sitemap, canonicals and published project labels. Keep the current mvdt website available until staging is reviewed.
8. Point Cloudflare DNS to the new origin with strict TLS. Record the previous DNS/origin settings for rollback. Switch only after the new deployment passes staging checks.

Health: `/actuator/health` on the internal Java service. OpenAPI is enabled in development and staging and disabled by default in production. Configure log shipping/alerts on the deployment platform; no external monitoring account is integrated here.

The hosted review has its own SQL and file storage. Configure Fast2SMS credentials and the mobile allowlist as server secrets. CMS management requires an OTP session; forwarded platform identity alone cannot authorize it. Preserve private audience or explicitly configure membership before sharing administrative access.
