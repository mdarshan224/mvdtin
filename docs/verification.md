# Verification record

Executed in this authoring environment:

- React/TypeScript type checking.
- Hosted Worker build and standalone React Router/Vite production build.
- Initial version: Java 17 compilation against the available Spring Boot 3.5.16/Security/JPA libraries.
- Initial version: seven Java security smoke checks: BCrypt verification/rejection, JWT signature/role verification, forged JWT rejection, unsafe URL rejection and public secret-field rejection.
- Six deterministic algorithm checks: sorting, search, FCFS, SJF, round robin and regression.
- Twenty-four Vitest checks, including contact workflow, all public sidebar routes, project links/history, direct hidden admin, routing hydration/SSR, OTP login/resend UI, allowlist denial, cooldowns, expiry, attempt caps, strict provider success, single-use challenges, session cookies and logout.
- Six workerd integration scenarios exercise the actual review REST handler and D1: OTP send, verify/session creation, unknown-phone denial, redirect rejection without credential forwarding, private provider errors and invalid provider JSON. All outbound requests are intercepted; this is runtime compatibility verification, not proof of live SMS receipt.
- Five Python validation/regression tests.
- Twenty-two review API checks passed: pagination, anonymous denial, cross-origin denial, validation, OTP session authorization, platform-header bypass denial, unknown-phone denial and legacy claim removal, draft/public visibility, version conflicts, secret-field validation, idempotent contact, CRM update, consented analytics, deletion, resume upload/publication, media rename/reference guards and successful SSR responses for every primary route.

See the final local API result JSON for the last run. Its records and test identity stay in ignored local storage; they are not seeded or uploaded into the hosted application.

Prepared but not represented as passed:

- Full Maven/JUnit/Mockito/MockMvc integration suite. Maven Central could not be resolved for missing Surefire/JDBC/test artifacts. Compilation and library smoke tests do not establish database runtime correctness.
- MySQL and PostgreSQL migration/runtime verification in their actual database engines. An H2 test profile is supplied, but its missing binary prevented running that suite here.
- Docker Compose execution, AWS deployment, TLS/DNS cutover and restore/load tests; Docker and account access are not available here.
- Playwright E2E suite for desktop/mobile. Browser binary downloads returned unusable archives. The twelve desktop/mobile test cases were discovered successfully but could not execute; do not infer a passed browser check merely from a supplied spec.
- Streamlit interactive runtime and Odoo integration: packages/module examples are supplied; only Python processing/model tests ran here.
- LCP, CLS and INP measurements: targets only. Route-based code loading, local fonts, a 56 KB WebP portrait and pagination reduce unnecessary work.
- Browser WebMCP validation: the optional registration is feature-detected, but no supported permitted browser context was available for its validation.

This is a working application source and verified SQL review, not a claim of audited production readiness. Perform the remaining deployment checks before replacing the existing website.

Current update limits: SMS provider calls were mocked; actual SMS delivery/receipt still requires an authorized login attempt. New Spring OTP code remains uncompiled in this turn because no Spring dependency cache is present and Maven Central connections time out. The prior Java compilation record applies to the initial version only. The 22 API checks use an isolated expiring local fixture session, never a production sign-in bypass.

## SMS connection correction — 2026-10-03

The hosted `/api/v1/auth/otp/send` request returned 503 after about 1.5 seconds. The exact request options reproduced a workerd `TypeError`: the deployed runtime accepts only `follow` or `manual` redirect modes and rejects `redirect: 'error'` before making a provider request. Node's mocked fetch did not reveal this mismatch. The adapter now uses `manual` and explicitly rejects 3xx responses, preserving the protection against forwarding the authorization key to another host. Safe transport diagnostics include only the action and error category. The new runtime suite covers this failure and is included in CI. An unauthenticated request to the official provider endpoint returned HTTP 401, establishing endpoint reachability from the authoring environment only; live OTP delivery and receipt remain unverified.
