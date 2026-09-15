# LME Visual Parity Audit

Reference image: `C:\Users\viole\AppData\Local\Temp\codex-clipboard-abdce475-0a18-48e3-a63a-b736aa7b61df.png`  
Screenshot folder: `C:\Users\viole\OneDrive\Dokumente\LME\docs\screenshots\lme-review`

## Evidence Screenshots

- Homepage desktop: `docs/screenshots/lme-review/public-home-desktop-corrected.png`
- Homepage tablet: `docs/screenshots/lme-review/public-home-tablet-corrected.png`
- Homepage mobile: `docs/screenshots/lme-review/public-home-mobile-corrected.png`
- Service page: `docs/screenshots/lme-review/public-service-page.png`
- Location page: `docs/screenshots/lme-review/public-location-page.png`
- Quote page: `docs/screenshots/lme-review/public-quote-page.png`
- Contact page: `docs/screenshots/lme-review/public-contact-page.png`

## Homepage Section Scores

| Reference section | Current implementation | Match score | Exact differences | Files involved | Required changes | Screenshot path after correction |
|---|---|---:|---|---|---|---|
| Header | Dark sticky header, larger LME lockup, nav dropdowns, phone block, quote CTA. | 8.5/10 | Logo is still a text placeholder, not the supplied mark; phone label says `Rapid callout` rather than exact `24/7 call out`; dropdown behaviour is native `details`. | `src/components/site-header.tsx`, `src/components/logo.tsx` | Replace placeholder logo with real asset, add exact 24/7 label if verified, build fully styled accessible dropdown menus. | `docs/screenshots/lme-review/public-home-desktop-corrected.png` |
| Hero | Dark navy hero with large white heading, green North West emphasis, trust indicators, CTA row and quote card. | 8.0/10 | Reference has photographic technician/van/city composition; current uses CSS/asset texture and does not use the reference image as background per instruction. Quote form has more fields than compact reference due functional requirements. | `src/app/page.tsx`, `src/components/quote-form.tsx` | Add real generated/owned hero photography, tune quote form variant to match homepage compact layout while preserving full quote fields elsewhere. | `docs/screenshots/lme-review/public-home-desktop-corrected.png` |
| Pests We Treat | Eight-card centered section with icons, uppercase headings and view-all CTA. | 8.5/10 | Icons are Lucide-style line icons rather than detailed pest silhouettes; descriptions are CMS/static snippets. | `src/app/page.tsx` | Add pest silhouette assets or custom icons; pull content from CMS once database is available. | `docs/screenshots/lme-review/public-home-desktop-corrected.png` |
| Why Choose LME | Left visual block, central copy/checklist, right four-card feature grid. | 8.0/10 | Reference uses real technician photo; current uses branded dark visual placeholder to avoid unlicensed/fake imagery. | `src/app/page.tsx` | Add owned/generated technician image; replace placeholder visual block. | `docs/screenshots/lme-review/public-home-desktop-corrected.png` |
| Statistics bar | Dark navy five-column bar with lime icons. | 8.0/10 | Numeric claims are intentionally hidden/not claimed because they are unverified; visual hierarchy is similar but not identical. | `src/app/page.tsx` | Connect to verified settings/live DB metrics and display only approved numbers. | `docs/screenshots/lme-review/public-home-desktop-corrected.png` |
| Lower content row | Three balanced panels: How It Works, reviews, areas. | 8.0/10 | Reviews panel is intentionally hidden/no fake review count; areas panel has no map illustration. | `src/app/page.tsx` | Add map graphic and verified review carousel. | `docs/screenshots/lme-review/public-home-desktop-corrected.png` |
| Emergency banner | Dark treatment with emergency icon, copy, call CTA and trust bullets. | 8.5/10 | Reference has pest image on right; current uses no fabricated pest photo. | `src/app/page.tsx` | Add owned/generated pest image asset. | `docs/screenshots/lme-review/public-home-desktop-corrected.png` |
| Footer | Dark multi-column footer with services, areas, links, contact and accreditation placeholder. | 8.0/10 | Real logo, social accounts, email, opening hours and accreditation badges are hidden/configurable rather than invented. | `src/components/site-footer.tsx` | Add verified business email/opening hours/socials/accreditations in settings and render them conditionally. | `docs/screenshots/lme-review/public-home-desktop-corrected.png` |

## Visual Correction Summary

Corrected sections below the prior target by replacing the homepage layout with a closer reference structure:

- Header now uses tighter dark premium nav, larger LME mark, phone block and quote CTA.
- Hero now matches the reference hierarchy: dark image-like composition, green emphasis, trust row, CTA row and right quote card.
- Pests section now uses 8 compact cards and a `View All Services` CTA.
- Why Choose LME now uses left visual, copy/checklist and four-card feature layout.
- Stats bar, lower row, emergency banner and footer now follow the reference structure.

Still below 9.5/10 because the exact visual relies on assets and facts not currently available: real logo, owned hero/technician/pest/map imagery, verified ratings/statistics/accreditations, email and opening hours.
