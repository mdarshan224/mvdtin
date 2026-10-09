# DTM Engineering Platform

A multi-module engineering workspace for Darshan Tejomaya M. The supplied portfolio was audited and its content migrated into a database seed. The frontend is React/TypeScript; the deployable backend is Java 17 / Spring Boot 3.5.16 / Spring Security / Hibernate / JPA, with MySQL as the default database.

## Start the Java + MySQL application

Requirements: Docker with Compose, or Java 17+, Maven 3.6.3+, Node 22+ and MySQL.

```bash
cp .env.example .env
# Fill the required variables, then:
docker compose up --build
```

Open `http://localhost:8081`. The frontend is an independent React Router/Vite build served by Nginx. `/api/v1` is proxied to Java; the database is not exposed to the browser. Persistent Docker volumes contain MySQL records and uploaded media.

Set these values in `.env` before starting:

| Variable | Purpose |
| --- | --- |
| `DB_PASSWORD` | MySQL application credential |
| `MYSQL_ROOT_PASSWORD` | Database administration credential |
| `JWT_SECRET` | Base64 of at least 32 random signing-key bytes |
| `FAST2SMS_API_KEY` | Server-only Fast2SMS authorization key |
| `FAST2SMS_OTP_ID` | Smart OTP template identifier |
| `ADMIN_ALLOWED_PHONES` | Authorized Indian mobile numbers, comma separated |
| `APP_ENV` | `development`, `staging` or `production` |
| `CORS_ORIGINS` | Exact allowed browser origins, comma separated |

Generate signing-key bytes locally with `python -c "import secrets,base64; print(base64.b64encode(secrets.token_bytes(48)).decode())"`. Do not commit generated secrets. SMS credentials and the mobile allowlist belong only in the server environment. No actual SMS credential is embedded in the client or source package. The authorization allowlist is read exclusively from the server environment; public contact details from the supplied portfolio are preserved.

Open `/admin` directly; it is hidden from public navigation. Enter an authorized mobile number, request a code, then verify it. Both configured numbers receive ADMIN access. Fast2SMS generates and verifies six-digit codes; challenges expire after five minutes. The application limits verification to five attempts, imposes a 60-second resend cooldown, caps resends at three and deliveries at six per phone per hour. Unknown numbers are denied before contacting the provider.

For production, set `APP_ENV=production` and terminate HTTPS at the reverse proxy. Legacy email/password login and review-owner claiming no longer grant access. Optional bootstrap user records are retained for compatibility, but they cannot sign in through the removed password flow.

## Local development

```bash
# Backend, with DB_PASSWORD and JWT_SECRET set in the environment:
cd backend
mvn spring-boot:run

# Separate terminal, from the repository root:
pnpm install --frozen-lockfile
pnpm exec vite --config frontend/vite.config.ts
```

Vite serves port 5173 and proxies `/api` to `http://localhost:8080`. Set `CORS_ORIGINS=http://localhost:5173` for direct browser API development. Swagger is at `http://localhost:8080/swagger-ui/index.html` in development/staging. It is disabled in the production profile.

## Repository structure

```text
dtm-engineering/
├── frontend/
│   ├── src/
│   │   ├── components/       cards, graphs, palette, terminal
│   │   ├── pages/            workspaces, labs, CMS, resume, journal
│   │   ├── layouts/          application shell
│   │   ├── api/              REST client, in-memory access token
│   │   ├── services/         deterministic algorithm examples
│   │   ├── data/             instructional labs and imported seed
│   │   ├── types/            API models
│   │   └── bridge/           legacy routing compatibility adapters
│   ├── index.html            small React entry, not the application architecture
│   └── vite.config.ts
├── backend/
│   ├── src/main/java/com/dtm/platform/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── mapper/
│   │   ├── security/
│   │   ├── config/
│   │   ├── exception/
│   │   ├── validation/
│   │   └── integration/
│   ├── src/main/resources/   Flyway, profiles, content seed
│   └── src/test/             JUnit, Mockito, MockMvc integration tests
├── database/migrations/     MySQL and PostgreSQL SQL copies
├── python/                  separate Pandas, Matplotlib, regression, Streamlit
├── integrations/odoo/       explicitly labeled learning module
├── docs/                    audit, API, deployment, verification boundaries
├── docker/                  frontend, backend, Python and Nginx
├── app/                     hosted review / Next-compatible routing adapter
├── server/                  separate Worker REST review adapter
├── db/ and drizzle/         review SQL schema and migration history
├── tests/                   API, algorithms, RTL and Playwright
└── compose.yml
```

Root dependencies and `pnpm-lock.yaml` are authoritative for both frontend builds. `frontend/package.json` identifies the frontend package; install dependencies at the repository root. `app/`, `server/`, `db/` and `drizzle/` are the separate hosted review adapter, not the Spring production backend.

## Product surfaces

- Workspace with your portrait, documented project totals and selected systems.
- Project explorer with API search, filters, sorting, pagination, grid/list modes, detail routes and ten inspection tabs.
- Architecture lab with clickable layer responsibilities.
- Code lab with representative snippets, syntax coloring, copy, line numbers and clearly labeled expected output.
- Computer science lab with bubble sort, binary search, FCFS/SJF/round-robin scheduling, BFS/DFS, page mapping, a deadlock model and complexity comparisons.
- Business, education, healthcare, communication, digital infrastructure, SEO, Python and hardware labs. Domain systems are concepts; interactive examples are prototypes.
- Ctrl/Cmd+K palette with keyboard navigation and backend content search; terminal with working navigation commands.
- Stack, experience, education, history, journal, contact CRM submission and resume download/print/share/versions.
- Admin CMS for dashboard, projects, technologies, skills, experience, education, companies, services, articles, resume, contacts, analytics, media, settings and profile.

No client, visitor, revenue, production-traffic or delivery metrics were invented. Original “Stage not listed” records preserve that provenance and display “Needs review”. The seed has no invented articles or screenshots.

## API and data

See [API contract](docs/api/contract.md). Published content is available publicly; draft reads and all management writes are authenticated on the server. `ADMIN` can delete and manage settings/users/contacts/analytics. `EDITOR` can maintain content and upload media, but cannot delete content or access contact/analytics administration.

Content entities have typed common fields and JSON extension fields, with explicit Project–Technology joins, company references, article author/category references and resume media references. SQL indexes support publication, filtering, ordering and analytics predicates. CRUD responses include version numbers; updates require the current version. Migrations, not automatic Hibernate schema generation, own the database.

Contact submissions support an idempotency key and a honeypot. The public receipt does not return personal contact details. Contact status transitions are `NEW`, `CONTACTED`, `IN_PROGRESS`, `CONVERTED`, `CLOSED`.

Analytics records only allowlisted event type, public resource and timestamp after explicit browser opt-in. No visitor identity or fingerprint is recorded, so unique visitors are unavailable. Popular technology counts are derived from viewed project stacks. Purge expired events through the authenticated endpoint; the configured retention is 90 days. Configure a scheduled operational purge in production.

Uploads are limited to 10 MB, use generated keys and check supported PDF/image signatures. Private media can be downloaded only through admin routes; public downloads require a published content reference. Upload signature checking is not malware scanning.

## Authentication and security

Java issues short-lived HS256 JWTs only after Fast2SMS verification. JWTs require issuer/expiry validation, an OTP authentication claim and a subject matching the server phone allowlist. CMS method-level role checks remain in place. BCrypt remains available for legacy user records; password login is disabled. Access tokens remain in browser memory, so reloading the standalone app requires signing in again. There is no refresh-token or immediate JWT-revocation feature; sign-out clears the browser token, and issued tokens expire after 30 minutes.

The Java API does not use auth cookies. It disables CSRF under that stateless bearer model and restricts CORS to configured origins. The hosted review uses a random opaque session cookie after OTP verification, with HttpOnly, Secure on HTTPS, SameSite=Strict, a 30-minute expiry and hashed database session keys. Logout deletes its session. It requires a matching Origin on every write; platform identity headers alone cannot authorize the CMS. React escapes stored text; arbitrary visitor code and raw stored HTML are never executed. CSP/security headers, input validation, prepared queries, bounded uploads and per-instance rate limiting are implemented. Review rate limits use short-lived hashed request buckets distinct from analytics; Java rate buckets remain in memory.

For multiple Java replicas, use shared edge/WAF limits and a shared media adapter. Neither an external WAF, antivirus, AWS monitoring account nor secret-management deployment is configured in this source. These are operational setup tasks, not claimed controls.

## Hosted review boundary

The hosted review uses React with a Worker REST adapter, persistent SQL and object storage. CMS access is through mobile OTP at `/admin`, with the allowlist checked by the server. The Site audience follows its configured sharing policy; the SMS allowlist controls CMS authorization and does not change that audience. Old owner records and forwarded ChatGPT identity headers no longer grant CMS access.

The review does **not** run Spring Boot or MySQL. It has the same content API shape and keeps its own data. The Java/MySQL deployment is the Docker application above. Review edits do not automatically sync into a separate Java database. Export and review content before migrating.

When a public HTTPS Spring API exists, the hosted adapter can proxy `/api/v1` with a server-side `BACKEND_URL`. Its initial public content loading can also use that backend. The standalone Docker frontend does not require this adapter or Cloudflare bindings.

The Cloudflare/Vinext build reads its binding configuration from the repository-root `hosting.json`. Configure the Cloudflare Worker with a D1 binding named `DB` and an R2 bucket binding named `BUCKET` to match. Keeping the source config at the repository root also ensures Git-based Cloudflare builds include it; the build copies it into `dist/.openai/hosting.json` for the generated hosting output.

## Python and Odoo

```bash
docker compose --profile analytics up --build
# or
cd python
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
streamlit run streamlit/app.py
```

Streamlit is an independent application; its default Docker port is loopback-only. Uploaded CSVs must contain only `date`, `event_type`, `count`; negative/fractional counts, unknown events and personal fields are rejected. Regression uses explicitly labeled example data.

The Odoo module demonstrates ORM, XML and QWeb. It is unverified against a specific installed Odoo version and is not a deployed ERP. MongoDB is an optional document-adapter boundary, not a JPA-compatible SQL engine. See [database notes](docs/deployment/databases.md).

## Tests and verification

```bash
pnpm exec tsc --noEmit
pnpm exec vitest run
node --test tests/otp-runtime.mjs
node --experimental-strip-types --test tests/algorithms.test.ts
python -m unittest discover -s python -v
cd backend && mvn verify
# With the Docker application running:
pnpm exec playwright install chromium
pnpm exec playwright test
```

The review API harness (`node tests/api-review.mjs`) launches a built Worker and exercises local persistence and authorization. It is for the SQL review, not proof of MySQL/JPA behavior. The build environment had cached Spring libraries and could compile Java and run security smoke checks, but Maven could not download missing test/JDBC/build dependencies. Full JUnit/MySQL/PostgreSQL integration verification remains required. See [verification report](docs/verification.md) for exact executed checks and limitations.

GitHub Actions prepares Java, frontend, Python and Docker/Playwright jobs. The workflow is supplied, not claimed as having run on GitHub. Docker cannot be executed in this authoring environment. AWS deployment, DNS switching and verified Core Web Vitals remain pending; see [rollout runbook](docs/deployment/aws-cloudflare.md).

## Navigation and OTP update verification

The hosted and standalone builds share React Router navigation, including links, palette/terminal commands, direct routes and browser history. The dashboard no longer links to `/admin`. The update passed 24 Vitest checks and 22 local review API checks. Provider HTTP calls were mocked in the OTP security suite; live SMS delivery and receipt were not asserted. Browser E2E execution remains unverified. New Java OTP code has not been compiled in this turn because the previous dependency cache is unavailable and Maven Central connections timed out; run `mvn verify` with dependency access before the independent Java rollout.

The hosted OTP request uses `redirect: 'manual'` and explicitly rejects provider redirects. Its deployed workerd runtime rejects `redirect: 'error'` before sending the request, which previously caused the misleading SMS connection message. Six workerd integration scenarios now cover real Worker request construction, D1 challenges, verification/session creation and provider failure handling with intercepted outbound requests. These checks are also included in CI; no live SMS receipt is claimed.
