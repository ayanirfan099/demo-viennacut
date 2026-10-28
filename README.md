# Vienna Cuts

A fictional Vienna barbershop demo built in the existing `demo-viennacut` application. German is the primary customer language; the language switcher supports English. Sample identities, illustrations, testimonials and business information are demonstration content, not verified claims about a real shop.

## Architecture

- Next.js 16 App Router, React 19, TypeScript and Tailwind CSS 4.
- PostgreSQL through Prisma 7 and `@prisma/adapter-pg`. There is no Supabase integration or second booking database.
- Public service, barber, availability and booking endpoints under `src/app/api`.
- Better Auth with Prisma-backed owner sessions and server-side owner authorization. Existing appointment list, calendar, dashboard and management routes are retained.
- Booking availability uses `Europe/Vienna`, staff working hours and blocked periods. PostgreSQL exclusion constraints prevent overlapping active appointments atomically. Booking prices and durations are snapshotted from database service records.
- `prisma7.config.ts` is the Prisma configuration; use the package scripts below rather than bare Prisma commands.

## Local setup

Use Node.js 22, npm and PostgreSQL 16 with the `btree_gist` extension available. Use the existing checkout; no additional repository or worktree is necessary.

```bash
npm ci
cp .env.example .env
```

Edit `.env` locally. Never commit it or paste its values into logs or chat.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection to the development database `vienna_cuts` |
| `BETTER_AUTH_URL` | Exact application origin; local HTTP is supported, non-local origins require HTTPS |
| `BETTER_AUTH_SECRET` | Cryptographically random secret of at least 32 characters |

Create databases `vienna_cuts` and `vienna_cuts_test` with an appropriately scoped local database role, then run:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Create an ignored `.env.test` containing only the local test connection:

```dotenv
DATABASE_URL="postgresql://YOUR_LOCAL_USER:YOUR_LOCAL_PASSWORD@localhost:5432/vienna_cuts_test?schema=public"
```

Prepare the separate test database using its connection in the current shell:

```bash
DATABASE_URL='postgresql://YOUR_LOCAL_USER:YOUR_LOCAL_PASSWORD@localhost:5432/vienna_cuts_test?schema=public' npm run prisma:migrate
DATABASE_URL='postgresql://YOUR_LOCAL_USER:YOUR_LOCAL_PASSWORD@localhost:5432/vienna_cuts_test?schema=public' npm run prisma:seed
```

Tests refuse non-local targets and database names other than `vienna_cuts_test`. Tests create and remove fixtures: never point them at production or valuable development data. The seed contains fictional services, barbers and working hours. Seeding does not create a publicly shared owner password.

### Prepared cloud environment

The current cloud workspace has Node.js 22 under `/workspace/.cloud-tools/node_modules/node/bin` and a local PostgreSQL cluster under `/workspace/.cloud-setup/pgdata`. Activate and restart retained tools with:

```bash
export PATH=/workspace/.cloud-tools/node_modules/node/bin:$PATH
export npm_config_cache=/workspace/.npm
bash /workspace/.cloud-setup/start-postgres.sh
```

Cloud PostgreSQL listens only on loopback and uses trust authentication for disposable local data. Do not reuse that configuration for deployment. Processes do not survive environment snapshots and must be restarted. Engine installation requires verified HTTPS access to `binaries.prisma.sh`; do not bypass TLS or checksum verification if that download is blocked.

## Owner access

Provision a local owner interactively:

```bash
npm run owner:provision -- --database vienna_cuts
```

The script checks the local database name, requests confirmation, then asks for an email, name and hidden password. It preserves existing credentials and refuses to silently promote an unrelated account. There are no default credentials. Open `/owner/login` to sign in. Owner APIs enforce authentication and role checks independently of the UI; production provisioning must use a separately reviewed operational procedure because the helper intentionally accepts only local databases.

## Development and verification

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm test
npm run build
npm start
```

The Vitest suites include availability, overlapping intervals, concurrent booking constraints, invalid inputs, working hours and time zones, owner access and appointment management. The full database suites require generated Prisma client, applied migrations and seeded test data. A passing booking unit suite alone does not verify database persistence or authorization.

For a functional smoke test, start the app and request `/api/services`, `/api/barbers` and `/api/availability?serviceId=classic-haircut&barberId=barber-alex&date=2026-11-16`. Use a future scheduled date when this example becomes stale. Verify a real booking only against disposable local data. Failed or unavailable backend responses must never be presented as successful appointments.

Browser QA should cover 375px mobile, tablet and 1440px desktop; keyboard navigation; language persistence; service/barber preselection; gallery controls; form validation; actual booking submission; duplicate slot rejection; and unauthenticated owner access. Screenshots and checks are evidence only for the exact version and runtime tested.

## Content, images and legal review

Customer presentation lives in reusable site components. `src/lib/business.ts` centralizes fictional business settings, opening hours and slot increments used by the seed and availability engine. `src/lib/catalog.ts` supplies the shared fictional service and barber catalogue used by public pages and the seed. The seed includes five treatments: haircut, beard, haircut and beard, skin fade and premium grooming. Database records remain authoritative for live availability, prices and booking durations; seed the local database after catalogue changes and keep advertised data aligned with deployed records.

The visual site uses the supplied 39-image Vienna Cuts AI pack in `public/images/vienna-cuts/`. All WebP files are preserved byte-for-byte. `src/data/vienna-cuts-images.json` retains the supplied dimensions, alt text and placements; `src/lib/images.ts` provides typed references. Original package provenance and integration notes are in `docs/image-pack/`. Contact-sheet collages are not served. All pictured people, interiors and styling comparisons are fictional AI concepts. Site-wide disclosure and concept A/B labels prevent them being presented as real staff, a real address or verified client results. Some assets have modest source resolution; use higher-resolution licensed or commissioned originals before commercial launch.

Reference inspection of `https://onyx-cuts.at/` was attempted during development, but the environment proxy returned HTTP CONNECT 403. No reference source code, photography, logos or written copy was acquired. The visual direction therefore follows the provided brief rather than a verified live-site comparison.

`/impressum`, `/datenschutz` and `/cookies` contain explicitly marked owner-review drafts. Before public operation, supply the legal entity, verified address/contact, required registration information, privacy controller, processors, legal bases and concrete retention policy. Automatic customer-data deletion is not implemented. Do not collect real customer data until these operational responsibilities are resolved. No marketing analytics or embedded maps are added by default. Owner authentication uses necessary cookies; language preference uses browser storage.

The fictional demo is excluded from indexing by `robots.ts`; `sitemap.ts` deliberately returns no fictitious canonical URLs. Replace these only when a verified production domain and legal identity exist. Do not publish fabricated LocalBusiness addresses or ratings.

## Deployment

1. Use a production PostgreSQL database and a least-privilege application role; allow migrations to create the required extension using a reviewed migration role if needed.
2. Configure HTTPS, the exact `BETTER_AUTH_URL`, a unique `BETTER_AUTH_SECRET`, and `DATABASE_URL` through secure deployment settings.
3. Run `npm ci`, `npm run prisma:generate`, `npm run prisma:migrate`, and `npm run build`; serve with `npm start`. Seed only an explicitly designated demo database.
4. Confirm owner-only access, secure cookies, origin enforcement, booking conflicts and failure handling on the deployed origin.
5. Set documented backup, deletion, restore and monitoring procedures. Review distributed request throttling/bot protection before opening booking to public traffic; do not treat a frontend submit lock as abuse protection.
6. Replace demo claims, asset placeholders and legal drafts, then configure canonical SEO and indexing intentionally.

No production deployment, live database change or credential publication is part of this repository update.

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
