# Audit of uploaded mvdt(1).html

The source is 7,655 lines: embedded fonts, styles, portfolio content, imperative render functions and browser interactions in one document.

## Keep and migrate
- DTM dark identity, orange/teal accents, Inter typography, project explorer, history, terminal, palette, theme preference and semantic metadata.
- 10 project records, 83 original technology entries, four experience records, two education records and company links.
- Separate page components, reusable project/technology cards, architecture graph, timeline, forms and API client.

## Replace or clarify
- `CONFIG.api.enabled` is false; `api.request` returns JavaScript objects. Replace with versioned HTTP APIs and durable SQL.
- Analytics and contact integrations are disabled. Implement stored contacts and aggregate events with explicit consent.
- Progress value 82 is simulated. Remove the progress metric.
- Several projects have “Stage not listed”. Preserve that provenance as “Needs review”; use conservative Concept status until reviewed.
- Fleet, audio detection and fixed non-JavaScript output are simulations. Labs explicitly identify illustrative examples.
- GitHub username is null; do not fabricate GitHub links or live activity.
- No verified screenshots or articles were supplied. Start their CMS collections empty.
- Extract the supplied embedded PDF into a separate asset and add interactive resume/print workflows and version uploads.

## Architecture
React/TypeScript client → versioned REST → Spring MVC controller → service → JPA repository → MySQL. PostgreSQL uses the same schema-compatible migrations. MongoDB is an optional external adapter, not a replacement for relational JPA.

The private hosted review runs a separate Worker/SQL adapter with the same API contract. It uses dispatch-owned sign-in and explicitly identifies its runtime. It does not claim to run Java or MySQL. Java production runs with Docker Compose or the supplied AWS deployment steps.

Content originated from the supplied portfolio, not independently verified professional claims. No clients, outcomes, visitor counts or production deployments have been invented.
