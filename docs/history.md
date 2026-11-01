# Implementation history

Historical checks below describe their stated versions and environments, not a fresh verification of this branch.

## Verification record and boundaries

On 2026-10-27 the prepared local environment passed ESLint, TypeScript, a production build and 234 Vitest tests across 20 files. Production-server Chromium checks covered all eight customer/legal pages at 375, 768 and 1440 pixels: HTTP 200, no horizontal overflow, no browser exceptions, persistent DE/EN selection, category filtering and Escape-to-close gallery controls. A mobile journey verified service/barber preselection, retained details on back navigation, review before submission, a stored appointment, duplicate-slot HTTP 409 and anonymous owner API HTTP 401. QA fixtures were removed afterward. Local screenshots/scripts are ignored under `.qa/`.

The existing owner dashboard, appointment filters, list/calendar and authorized status changes remain in place; its management content is still English. Public pages and booking UI are bilingual, with German-first static metadata and language-aware browser titles. No verified real shop contact information, photography, before/after pairs, business schema or public canonical domain has been supplied. Staff working hours and blocks are supported by the database; a new staff scheduling editor, configurable cleanup buffer, idempotency keys, public rescheduling and distributed booking spam throttling are not included. The transactional database constraint and frontend submit lock prevent duplicate slot submissions, but are not a substitute for those operational enhancements. Nothing was deployed or pushed.


## AI image integration — 28 October 2026

- Responsive optimized `<picture>` art direction uses `hero-mobile.webp` up to 700px and `hero-desktop.webp` above that width. The heading and CTAs remain HTML.
- Five existing service cards use their matching images and existing service IDs/prices. The sixth shave image is an explicitly unbookable treatment concept with a link to the available beard-care service; no database service was invented.
- Alex, Lukas, Emre and David use the supplied fictional portraits. Alex links to the existing Alex booking option; the additional concept profiles link to the available barber picker. Daniel remains in the backend and booking picker. No staff records or working hours were changed.
- Interior, alternative interior, reception, lounge and gallery scenes appear in About/Experience. Exterior and facade concepts appear with the existing fictional-location disclosure. All 14 gallery images appear on Results with filters, a native dialog, Escape, arrow keys and previous/next controls. Six comparison images appear only as labeled AI concept A/B pairs.
- All 39 assets are installed; 38 are used in the UI, with `studio-lounge-alt.webp` reserved as an alternate. The attached medium-resolution imagery is not represented as original photography.
- Reference-site access remains blocked by the environment HTTP proxy (403). No assets or copy from the reference were used.

Validation for the image integration: ESLint (zero warnings), TypeScript, production build and all 234 existing tests passed. Chromium checked the homepage, services, team and results at 375px, 768px and 1440px. Every visible image decoded, all 39 original image URLs returned HTTP 200, responsive hero selection matched the viewport, and no horizontal overflow or browser exceptions were detected. Service preselection, team booking navigation, gallery arrow keys/Escape, and English AI disclosures passed. Screenshots and the local QA report are in ignored `.qa/images-*` and `.qa/image-results.json`.

## Repair and demo polish

See [the repair report](docs/repair-report.md) for the 28 October 2026 fixes and verification. Public services and bookable barbers now load the existing live catalog APIs, while marketing portraits remain explicitly fictional. `/about` and `/contact` provide dedicated studio pages. Booking retains selections and shows inline customer errors; owner status changes use an accessible confirmation modal. The report distinguishes verified browser behavior from the inaccessible video and documents the remaining idempotency/owner-language limitations.

## Editorial Atelier redesign — 29 October 2026

The MagicPath prototype now supplies the shared visual direction: evergreen charcoal, ivory, copper, self-hosted DM Sans/DM Serif Display, an editorial split hero and asymmetric photography. The public site, real booking flow and authorized owner workspace use the existing Next.js application and PostgreSQL/Better Auth backend. The prototype's simulated booking/owner state and screenshot crops were not imported.

See [implementation and verification notes](docs/editorial-atelier-implementation.md) for source provenance, changed components, route coverage, test results and remaining demo limitations. The original 39-image pack remains unchanged, with fictional-image disclosures. No deployment is included.

## Historical cloud setup

These paths belonged to the earlier prepared environment and are not assumed to exist in a fresh checkout. Use the general local setup in the README.

### Prepared cloud environment

The current cloud workspace has Node.js 22 under `/workspace/.cloud-tools/node_modules/node/bin` and a local PostgreSQL cluster under `/workspace/.cloud-setup/pgdata`. Activate and restart retained tools with:

```bash
export PATH=/workspace/.cloud-tools/node_modules/node/bin:$PATH
export npm_config_cache=/workspace/.npm
bash /workspace/.cloud-setup/start-postgres.sh
```

Cloud PostgreSQL listens only on loopback and uses trust authentication for disposable local data. Do not reuse that configuration for deployment. Processes do not survive environment snapshots and must be restarted. Engine installation requires verified HTTPS access to `binaries.prisma.sh`; do not bypass TLS or checksum verification if that download is blocked.

