# Vienna Cuts repair report — 28 October 2026

## Evidence and limits
The supplied repair prompt was read in full. `demo_bugs.mp4` could not be transferred: its size exceeds the executor's 32 MiB attachment limit. No frames were inspected, and none of the findings below are claimed as direct video observations. The prompt describes hero clipping/space, small services, stacked gallery/team imagery, native owner confirmation, and small text. These were investigated in code and a locally running application. The supplied image pack remains installed; no original or customer imagery was invented.

## Implemented repairs
- Public typography and controls enlarged; service cards group image, description, exact EUR price and duration. Fixed low-contrast benefits/CTA text.
- Services now fetch the same API data as booking, keeping active services, durations and prices aligned. Local catalog supplies translations and image/category metadata only. Loading, retry and errors replace fallback prices when the API is unavailable.
- Bookable team section reads active database barbers and uses valid IDs in links. Four AI portrait concepts remain clearly separate from calendar availability. No records were renamed or added.
- Hero height and mobile fade refined; gallery uses one column on narrow mobile, consistent aspect ratios and larger captions. Gallery accessible names now include the visible caption.
- Added /about and /contact with fictional studio context and verified demo schedule; no fabricated contact channels or map. Header links point to these routes; active links and mobile Escape focus return were added. HTML declares smooth scrolling for Next.js.
- Booking gets a desktop summary, retained date/time selection even when backing out before Continue, a booking-window limit, field-specific customer errors and focus transfer between stages. Three validation tests were added.
- Owner status actions now use an accessible native dialog element with explicit appointment/action detail, initial safe-button focus, Escape/dismissal, busy state, inline error and success announcements, and synchronous mutation lock. Status badges, accessible table scrolling and dashboard/calendar refresh behavior were improved.

## Verification
- ESLint: passed, zero warnings.
- TypeScript: passed.
- Production build: passed.
- Vitest: 237 tests passed across 21 files, including existing booking concurrency, overlap, timezone and owner authorization suites.
- Browser matrix: 56 route/viewport checks across /, /services, /results, /team, /about, /contact, /book and /owner/login at 360,390,430,768,1024,1440,1920. No horizontal overflow or client exceptions; image decode and all 39 original asset URLs passed. Seven navigation/menu/filter/gallery/language journeys passed.
- Mobile booking: real saved record verified using PostgreSQL; duplicate request returns 409, anonymous owner API returns 401; selected details survive back navigation. Synthetic fixture cleaned.
- Authorized owner UI: synthetic owner login, dashboard, appointment confirm then cancel persisted, Escape/focus behavior, terminal status actions absent, calendar previous/today/next/details, mobile table and logout/401 passed. Synthetic owner/customer/appointment fixtures removed.
- Axe: initial contrast and label-content-name issues repaired. Final 16 page/viewport scans report zero detected violations for selected WCAG A/AA tags. Incomplete/manual checks remain; this is not a full WCAG compliance certification.
- Screenshot evidence and browser scripts remain local and ignored under .qa. Only synthetic customer data was used.

## Remaining boundaries
- Recording-specific timing, transitions and exact visual comparison remain unverified because the video was inaccessible.
- No durable idempotency-key replay is implemented. Submit locks and database exclusion constraints prevent duplicate overlapping records, but a retry receives 409 rather than replaying a prior response. This is not equivalent to complete HTTP idempotency.
- Owner management remains English; public content and booking remain DE/EN. No production deployment or public traffic/security claim is made.
- Supabase is not present: the existing system is Prisma/PostgreSQL with Better Auth. No API/schema migrations or production configuration changes were necessary for these repairs.
- Lighthouse was unavailable; no performance score is claimed. Supplied imagery has modest effective resolution and embedded source lettering.

## Launch
Use Node 22, PostgreSQL and the existing DATABASE_URL, BETTER_AUTH_URL and BETTER_AUTH_SECRET bindings. Follow README for Prisma generation/migration/seed. Run npm run dev for development or npm run build followed by npm start. Tests use only the isolated local vienna_cuts_test database.
