# Implementation boundaries

| Area | Implementation | Remaining verification or setup |
| --- | --- | --- |
| React UI | Routed workspaces, API content, responsive navigation, palette and terminal | Shared React Router navigation verified by DOM/SSR tests; browser E2E execution pending |
| Java API | Spring MVC/services/repos/entities/DTOs/mappers/errors/validation | Maven integration execution and actual SQL engines |
| Authentication | Fast2SMS OTP, phone allowlist, review session cookies, Java JWT claim checks, ADMIN/EDITOR method checks | Live SMS delivery and Java execution; Java refresh/revocation features not included |
| CMS | Content CRUD, publication, featured flags, filters, sort, pagination, versions | Real project release stages must be reviewed |
| Relationships | Project technology, company, article category/author, resume media mappings | Company/category/author relationships are optional; API extension fields carry content |
| Contact CRM | Stored briefs, statuses, access limits, idempotency | Email/SMS/WhatsApp provider notifications are not integrated |
| Analytics | Consented events, aggregate trends/popularity, purge endpoint | Unique visitors not measured; configure operational purge schedule |
| Resume/media | Original PDF, interactive view, print/share, upload/version attachment | Deployment media backup; shared S3 adapter for multiple replicas |
| Journal | Empty admin-managed article collection and detail routes | Administrator supplies and publishes articles |
| CS labs | Sorting, searching, CPU scheduling, BFS/DFS, memory/deadlock, complexity | Educational examples, not an OS emulator |
| Domain labs | Business, education, healthcare, communication, digital, SEO and hardware scopes | Concept architectures, not delivered operational ERPs or healthcare software |
| Python | Pandas validation/aggregation, Matplotlib, regression, Streamlit source | Streamlit UI runtime and deployment |
| PostgreSQL | Dedicated migrations/profile using relational schema | Actual PostgreSQL migration verification |
| MongoDB | Optional document-store port contract | Provider adapter not implemented; not a JPA drop-in database |
| Odoo | Explicitly labeled ORM/XML/QWeb example | Verify against installed Odoo version; no deployed ERP claim |
| DevOps | Dockerfiles/Compose, GitHub Actions, environment templates/runbook | Docker/CI execution, AWS resources, DNS/Cloudflare cutover |
| SEO | Dynamic review metadata/sitemap, client record metadata and Java sitemap for Docker | Domain origin/crawl checks and Core Web Vitals |
| Existing portfolio | Uploaded content audited and extracted; current domain untouched | Staging review and deliberate cutover |
