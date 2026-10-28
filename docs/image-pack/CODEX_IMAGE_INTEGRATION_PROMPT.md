# Codex Grand Prompt — Integrate Vienna Cuts AI Asset Pack

You are a senior full-stack developer, UI/UX art director, and QA engineer. Continue working **only inside my existing GitHub repository `demo-viennacut`**. I am attaching a ZIP of 39 fictional AI-generated website images named `vienna-cuts-ai-image-pack.zip` (or providing the equivalent extracted files). Your mission is to integrate those exact images throughout the existing Vienna Cuts barbershop website, preserving its functionality, and give the result a refined, luxury, Onyx-Cuts-inspired visual identity **without copying the source website**.

## 1. Autonomous execution and repository safety

1. Inspect the repository first: framework, app routes, current layout and components, booking flow, services, existing assets, localization, authentication, Supabase schema and tests.
2. Work only in `demo-viennacut`. Do not create another repository or recreate the app from scratch.
3. Find the attached ZIP or extracted images in the workspace, uploaded attachments directory, or the file path explicitly provided to you. **Do not assume that a ChatGPT sandbox path exists in your environment.** If the files genuinely are not accessible, clearly report that blocker rather than silently sourcing unrelated images or claiming you used the attachment.
4. If ZIP is present, extract it. Copy `images/vienna-cuts/*.webp` into `public/images/vienna-cuts/` (or the equivalent public asset path for the existing framework). Preserve descriptive filenames.
5. Keep a copy of `image-manifest.json` in an appropriate project location (e.g., `src/data/vienna-cuts-images.json`, with correct paths), and retain the package `README.md` with the provenance note. The contact sheets in `references/` are for inspection only; **do not display those collages on the live page**.
6. Preserve working booking logic, API routes, Supabase migrations, RLS, authentication, dashboard features, tests, secrets and current data. Do not deploy, overwrite production records, or force-push.
7. Make sound technical and aesthetic decisions on my behalf. Do not stop at planning, and do not ask routine questions.

## 2. Mandatory image-to-section mapping

Use these images in the right places, not just in one decorative gallery:

| Location in site | Provided files |
| --- | --- |
| Desktop hero | `hero-desktop.webp` |
| Mobile hero | `hero-mobile.webp` |
| About / introduction | `studio-interior.webp`, `studio-interior-alt.webp` |
| Reception / arrival | `studio-reception.webp` |
| Location / contact demo | `studio-exterior.webp`, `gallery-facade.webp` |
| Experience / waiting area | `studio-lounge.webp`, `studio-lounge-alt.webp`, `studio-gallery.webp` |
| Haircut service | `service-haircut.webp` |
| Beard service | `service-beard.webp` |
| Hair + beard service | `service-hair-beard.webp` |
| Skin fade service | `service-skin-fade.webp` |
| Premium grooming service | `service-grooming.webp` |
| Shave service | `service-shave.webp` |
| Fictional barber Alex | `team-alex.webp` |
| Fictional barber Lukas | `team-lukas.webp` |
| Fictional barber Emre | `team-emre.webp` |
| Fictional barber David | `team-david.webp` |
| Work and details gallery | `gallery-cut-detail.webp`, `gallery-beard-detail.webp`, `gallery-fade-detail.webp`, `gallery-grooming-detail.webp`, `gallery-clipper-work.webp`, `gallery-scissors.webp` |
| Lifestyle / atmosphere gallery | `gallery-products.webp`, `gallery-salon-products.webp`, `gallery-coffee.webp`, `gallery-tools.webp`, `gallery-neon.webp` |
| Vienna visual context (illustrative only) | `gallery-vienna.webp`, `gallery-vienna-architecture.webp` |
| Clearly labeled AI style-concept comparisons | `concept-fade-before.webp`, `concept-fade-after.webp`, `concept-side-before.webp`, `concept-side-after.webp`, `concept-beard-before.webp`, `concept-beard-after.webp` |

These are **39 distinct WebP assets**. Incorporate all of the main hero, service, team and studio images; curate remaining gallery images thoughtfully instead of forcing every asset onto the homepage. No duplicate images in adjacent cards or distorted stretching. You may keep unused alternates available as local assets.

## 3. Premium visual direction

- Brand name: **VIENNA CUTS**. This is a fictional, client-facing demonstration of a Vienna barbershop, inspired by the visual quality of https://onyx-cuts.at/ but not a copy of its copyrighted text, artwork, photography or markup.
- Mood: editorial, cinematic, confident, luxurious. Charcoal/black foundations, warm bronze accents, muted off-white text, intentional whitespace, elegant typography, sharp imagery and restrained transitions.
- The hero must feel immersive, with strong contrast and a readable heading on the dark left side. Use real HTML for the headline, subheading and booking CTA rather than writing text into the image. The supplied desktop hero has been darkened on the left for this purpose.
- Use responsive art direction: desktop hero for larger widths and mobile portrait image for small screens. Mobile typography and CTA placement must not block the face.
- Consider a well-composed magazine-like layout: oversized German headings, split-image intro, premium service grid, alternating studio details, tasteful image gallery, staff cards and booking CTA.
- Keep German as default with English localization if the project already supports it; do not regress translations or break routing.

## 4. Build a reusable image system

1. Centralize image references, localized `alt` text, dimensions and intended placements in typed configuration, using the attached `image-manifest.json`.
2. Prefer Next.js `Image` if this is a Next.js repository, using correct `width`/`height` or `fill`, meaningful `sizes`, hero `priority`, sensible `quality`, and `object-fit: cover` / `object-position` adapted per asset. Use a framework-equivalent solution otherwise.
3. Make image loading performant: prevent layout shifts, lazy-load below-fold imagery, avoid unnecessary large files, and do not hotlink outside images.
4. Create or refine components such as `HeroMedia`, `ServiceImageCard`, `TeamPortrait`, `StudioGallery`, `ImageLightbox`, and `ImageCreditNotice` where it improves maintainability. Avoid gratuitous dependency additions.
5. Provide accessible gallery controls, keyboard navigation, proper semantic structure, image `alt` descriptions, and visible focus states.
6. Some art assets are based on an AI storyboard and have modest effective source resolution; do not pretend they are full professional photoshoot originals. Display with sensible dimensions and avoid overzooming or heavy sharpening. The source contact sheets must never appear on the site.

## 5. Accuracy and fictional-content requirements

This is an AI-generated fictional demo, not documentation of an existing business:

- Do not represent the pictured interiors or storefront as a verified real Vienna Cuts address or store location.
- The portraits are fictional concepts, not employees. If using Alex, Lukas, Emre and David, label them as demo/example team members and avoid false biographical claims.
- Do not make up Google or Treatwell reviews, ratings, verified before/after results, actual customer identities, or public business claims.
- The concept before/after assets are illustrations; if shown side by side, label the module **"KI-generierte Styling-Konzepte – keine echten Kundenresultate"** / **"AI-generated style concepts — not real client results"**. Do not imply verified paired results from a genuine appointment.
- Where relevant, include an unobtrusive but clearly legible site-wide or gallery-level label: **"Konzept-Demo · KI-generierte Bilder · Fiktives Studio"** / **"Concept demo · AI-generated imagery · Fictional studio"**.
- Some pictures contain decorative baked-in brand names or lettering. Do not use embedded generated service prices, testimonials or contact info as authoritative. Source all prices/hours from the existing app configuration/backend.
- Real business contact details and legal identity must remain placeholders unless verified from existing project content.

## 6. Booking and existing features

- Every **Jetzt Termin buchen** / **Book now** CTA should continue to reach the actual booking flow and, when available, preselect the service or barber.
- Preserve server-side slot validation, double-booking prevention, API integration, dashboard access and customer-data privacy.
- Do not create fake success states, fabricated bookings or insecure mock APIs.
- If a page must demonstrate a feature without a working backend, label it as a demo rather than claiming that an appointment was saved.

## 7. QA and final delivery

1. Audit the app and pick the best placement for every main image.
2. Extract and integrate assets; write clean reusable code and typed data mappings.
3. Run lint, typecheck, unit tests and production build using repository-standard commands; repair any failures caused by changes.
4. Use Playwright or the existing visual QA process, where available, to inspect at least 375px mobile, 768px tablet and 1440px desktop widths. Fix crop, overlay, responsive spacing, contrast, layout overflow, broken images, missing alt text and dead CTAs.
5. Verify browser image requests resolve successfully and there are no missing file paths.
6. Maintain or update README with asset directory structure, provenance / demo disclosure and setup instructions.
7. Create clear Git commits on the current working branch without force-pushing or destructive changes. Only push if explicitly authorized by the working environment and user.
8. End with a factual summary listing integrated images, updated routes/components, tests executed, outstanding limitations, and commit hashes.

**Start now:** inspect `demo-viennacut`, locate the attached image pack, integrate the assets into the actual website, polish the experience and run QA. Do not finish by merely explaining how you would do it.
