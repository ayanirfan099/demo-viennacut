# Editorial Atelier implementation — 29 October 2026

## Repository and reference

- Repository: `https://github.com/ayanirfan099/demo-viennacut.git` (verified origin).
- Starting branch/commit: upstream `main`, `508b2b70d7a43836b287a79262bc9226e85efef0` (merged PR #3).
- Implementation branch: `feature/magicpath-editorial-redesign`.
- Primary reference: the supplied `Vienna_Cuts_Interactive_Prototype (1).zip`, its generated React component, CSS, README and design decisions; the supplied final implementation brief defines the integration scope.
- The prototype was run separately for visual inspection. Its Vite application, sample appointments, local booking state, owner preview and 18 screenshot-derived image crops were not imported.
- Figma and Accio were not accessed or used as competing visual references.
- Existing uncommitted edits in `src/components/layout/Footer.tsx`, `src/components/sections/About.tsx` and `src/components/sections/Hero.tsx` were preserved and excluded from these commits.

## Design and routes

The public site, booking and owner workspace share one consolidated stylesheet with evergreen charcoal `#17201d`, warm ivory `#f3f0e9`, paper `#eae7de`, sage `#bfc4b7` and copper `#bf9166`. A darker copper is used for small text on light backgrounds. This replaces the previous stack of overriding palettes and responsive repairs.

DM Sans and DM Serif Display are self-hosted with `next/font/local`; their SIL Open Font Licenses are included beside the font files. No browser requests to Google Fonts are necessary.

| Area | Implementation |
| --- | --- |
| `/` | Split editorial hero, oversized typography and italic serif accent, original art-directed photography, detail inset, asymmetric studio/gallery compositions, live service cards, studio statement in place of the invented testimonial. The existing `#reviews` anchor remains compatible. |
| `/services` | Editorial introduction, category controls, six photo cards; five live services plus the clearly labeled, non-bookable shave concept. |
| `/results` | Gallery filters, responsive image rhythm, existing native lightbox with arrow navigation, AI concept A/B comparisons. |
| `/team` | Live bookable barber records remain separate from four fictional portrait concepts; new portrait/card rhythm. |
| `/about`, `/contact` | Reused `StudioPages` and `StudioExperience`, updated typography, photography layout and opening-hours presentation. No invented address or contact channel. |
| Legal pages | Retained bilingual draft content, adjusted spacing for the sticky header. |
| `/book` | Four-step progress, service thumbnails, barber initials, styled live availability and customer forms, desktop sticky summary, compact mobile service cards. Existing details/review/success logic remains authoritative. |
| Owner login | Split private-workspace introduction and real login form; no unsecured preview link. |
| Owner dashboard | Four database-derived KPI cards and editorial navigation panels. |
| Owner appointments/calendar | Shared table, filter, calendar, status-action and dialog styling; existing data queries, actions and date navigation retained. English management regions explicitly declare their language. |

The shared mobile navigation is a native modal drawer, with focus containment, Escape, focus return, scroll locking and close-on-navigation. Public DE/EN selection, Next.js links/history, visible focus, and reduced-motion behavior remain supported.

Main changed source files: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/fonts/*`, `src/components/site/{Studio,SiteHeader,AssetMedia,AssetSections,ContentPage}.tsx`, `src/components/booking/BookingFlow.tsx`, booking/legal/owner pages, and `src/components/owner/{OwnerGuard,OwnerNav,OwnerDashboardSummary}.tsx`. Existing `StudioPages`, `SiteFooter`, `DateTimeSelection`, `CustomerDetails`, `AppointmentActionDialog` and catalog hooks are reused.

## Assets and truthful content

All 39 original WebP assets and the typed image manifest are retained unchanged. The interface continues to use 38 originals, with `studio-lounge-alt.webp` reserved. No stock photos or prototype screenshot crops were added. Desktop/mobile hero art direction uses the original hero files, with the mobile source through 820px; viewport-specific cropping removes the mobile edge border and avoids the desktop image's embedded lettering at the inspected sizes. Image sizes follow the split layout and are served through Next.js image optimization.

The photo cards, gallery, comparison labels, fictional profiles and site-wide AI disclosure are retained. The old fictional customer quote is replaced with a clearly identified studio idea. Demo appointments are described as saved requests; no notification, payment, customer-result or verified real-business claims are introduced.

## Working behavior retained

No changes to API contracts, dependencies, Prisma schema/migrations, Better Auth, server authorization, booking validation or database configuration. No second booking store. Prices, durations, staff and available slots still come from existing APIs. The transactional PostgreSQL overlap constraint, working hours/blocks, Europe/Vienna time handling, conflict responses and submission locks remain in place. Owner actions still require authorization, obey status restrictions, and persist through the existing endpoints.

## Verification

| Check | Result |
| --- | --- |
| `npm run lint` | Passed, no warnings |
| `npm run typecheck` | Passed |
| `npm run test:unit` | 67 passed in 4 files |
| `npm run test:integration` | 103 passed in 9 files |
| `npm test` | 237 passed in 21 files; includes the unit/integration tests above |
| `npm run build` | Passed, Next.js production build |
| Public/entry/legal browser matrix | 77 passed: 11 routes at 360, 390, 430, 768, 1024, 1440 and 1920px; no horizontal overflow or client exceptions |
| English browser matrix | 33 route/viewport checks at 390, 768 and 1440px; no overflow or client exceptions |
| Booking visual journey | Service, barber, time, customer details and review at 390/768/1440; any-barber live availability, preselection, history and selection restoration |
| Persisted booking | Mobile request returned 201 and its row was verified in PostgreSQL; duplicate request returned 409; fixture removed |
| Owner browser journey | Real synthetic owner login, dashboard, confirm/cancel persistence, terminal action restrictions, safe dialog focus/Escape, calendar details/previous/next/today, mobile layout, logout and subsequent 401 |
| Keyboard | Drawer focus containment and return, Escape, gallery arrows/Escape; existing owner modal return behavior |
| Image loading | All 39 original URLs returned 200; visible images decoded across the browser matrix |
| Accessibility automation | 16 public/entry scans, 3 booking-review scans and 9 authenticated owner scans: no detected violations for selected WCAG A/AA tags after contrast correction |

All automated suites and browser write fixtures used the isolated local `vienna_cuts_test` database. Synthetic customer/owner/appointment fixtures were removed after verification. No production data was accessed or modified. Axe results are automated evidence, not full WCAG certification. Chromium was used; Safari and Firefox were not tested.

Local QA scripts, logs and screenshots are ignored under `.qa/atelier-*`. Selected screenshots: [desktop homepage](design/atelier-home-desktop.png), [mobile homepage](design/atelier-home-mobile.png), and [desktop booking](design/atelier-booking-desktop.png). The separate preview server is solely a development tool; nothing was deployed.

## Remaining decisions and limitations

- Existing source imagery is medium-resolution AI concept work. Some originals contain lettering; commercial launch needs clean licensed/commissioned photography and verified business information.
- Owner management remains English; customer pages and booking remain German-first with English support.
- Legal entity, real location, contact details, production hosting and operational policies remain unverified. This is a fictional demo.
- Existing limits remain: no customer email/SMS, public rescheduling, payments or durable idempotency-key replay. A duplicate reserved slot returns 409 instead of replaying a prior success.
- No automatic merge or deployment. GitHub publication/PR status is reported separately after the local commits are created.
