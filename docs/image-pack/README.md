# Vienna Cuts — AI image asset pack

This package contains **39 fictional, AI-generated website assets** and a structured manifest for the existing `demo-viennacut` GitHub repository.

## Install
Copy the entire `images/vienna-cuts/` directory into the repository's `public/images/vienna-cuts/` directory. Copy `image-manifest.json` to `public/images/vienna-cuts/manifest.json` (or adapt paths in the app).

Use image URLs such as `/images/vienna-cuts/hero-desktop.webp` and Next.js `Image` where practical.

## Important disclosure
These images are fictional AI compositions, not photos of a real Vienna Cuts location, genuine customers, proven before/after outcomes or actual staff. Do **not** imply that the pictured team or shop currently exists. If published as a public-facing demo, identify it clearly as a conceptual showcase, e.g. `KI-generierte Demo-Bilder · Fiktives Studio` or `Concept demo — AI-generated imagery`.

## Content notes
- The hero's embedded draft text has been visually suppressed so the app can render accessible HTML text and CTA buttons.
- Other images may contain illustrated brand text or incidental generated lettering. Avoid presenting any baked-in price tags as authoritative. All service prices must come from app configuration/backend.
- `concept-*-before.webp` / `concept-*-after.webp` are illustrative visual concepts. Do not call them real transformations or results, and do not assert they depict verified before and after photographs of the same client.
- Some extracted images are deliberately low-to-medium resolution because the source was an AI-generated storyboard. Use with responsive cropping and prefer higher resolution original assets before commercial production.

## Suggested usage
| Page / section | Image files |
| --- | --- |
| Hero | `hero-desktop.webp`, `hero-mobile.webp` |
| About / studio | `studio-interior.webp`, `studio-interior-alt.webp`, `studio-reception.webp`, `studio-lounge.webp`, `studio-exterior.webp` |
| Services | `service-haircut.webp`, `service-beard.webp`, `service-hair-beard.webp`, `service-skin-fade.webp`, `service-grooming.webp`, `service-shave.webp` |
| Team (fictional) | `team-alex.webp`, `team-lukas.webp`, `team-emre.webp`, `team-david.webp` |
| Gallery | all `gallery-*.webp` |
| Visual comparison concept | matching `concept-*-before.webp` and `concept-*-after.webp` |

The source AI contact sheets are included under `references/` for visual review, but should **not** be loaded as website sections.
