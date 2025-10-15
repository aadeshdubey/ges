# Gayatri Electrical Services — Website

Static website for Gayatri Electrical Services. The site is built with plain HTML/CSS/JS and a small set of client-side libraries, optimized for clarity, performance, and SEO.

## Project Structure
- index.html — Main site (contains HTML, inline CSS, and inline JS)
- assets/
  - favicon.svg — Site icon
  - logo.svg — Brand logo
  - torrent-electricals-logo.png, torrent-power-logo.png — Partner logos
- images/ — Site imagery (PNG/SVG/GIF)
  - carousel-*.png/svg/gif — Hero/carousel backgrounds
  - service-*.png/svg — Service icons/illustrations
  - parallax-background.png/svg — Parallax section background
  - about-us-team.* — About section image
- robots.txt — Crawler rules
- sitemap.xml — Sitemap for search engines
- CNAME — Custom domain configuration (for GitHub Pages)

## Typography (current usage)
- Headings: Inter (Google Fonts), weights 700 and 800
- Body: Poppins (Google Fonts), weights 400 and 600
- Fallbacks: generic sans-serif

Font loading (index.html head):
- Preconnect: fonts.googleapis.com and fonts.gstatic.com
- Combined stylesheet: Inter + Poppins via Google Fonts

Recommended sizing (guidance):
- Web: H1 3.5–4rem (bold), H2 ~2.5rem (semibold), H3 ~1.5rem (semibold), body 1rem–1.125rem
- Print (A4 guidance): H1 ~28pt, H2 ~18pt, H3 ~14pt, body 11–12pt

## Color Palette (from :root CSS variables)
- --primary-orange: #FFA726
- --primary-orange-dark: #FB8C00
- --light-bg: #F8F9FA
- --white-bg: #FFFFFF
- --text-dark: #212529
- --text-muted: #6c757d
- --footer-bg: #1a1a1a
- --success-green: #28a745
- --error-red: #dc3545

Usage notes:
- Use primary-orange for accents, CTAs, hover states.
- Use primary-orange-dark for stronger emphasis and gradients.
- Ensure text-dark on light-bg meets WCAG contrast; prefer white-bg for high contrast sections.

## Libraries & Integrations
- Google Tag Manager (GTM)
  - Head: standard GTM loader
  - After <body>: noscript iframe (ensures basic tracking when JS disabled)
  - Current container ID: GTM-K2CN9DK5
- Schema.org JSON-LD
  - Type definitions include Electrician / Electrical Contractor and related entities
  - Business details: name, logo, image, URL, contact, address, geo, opening hours, area served, sameAs, and knowsAbout
- AOS (Animate On Scroll) — v2.3.1 via unpkg
  - CSS: https://unpkg.com/aos@2.3.1/dist/aos.css
  - JS: https://unpkg.com/aos@2.3.1/dist/aos.js
  - Usage: data-aos attributes in HTML; initialized in inline JS
- intl-tel-input — v17.0.8 via cdnjs
  - JS: https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js
  - utilsScript: https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js (loaded via the initializer)
  - Notes: Duplicate utils.js script tag was removed to prevent double-loading; functionality is preserved via `utilsScript` in the initializer.

## SEO & Meta
- meta charset, viewport
- title and meta description tailored for services
- meta keywords and author present
- favicon.svg linked
- Note: Canonical and Open Graph/Twitter Card tags are not currently present in the head (can be added if desired).

## Accessibility & UX
- Semantic sections; focus management for modals
- Smooth scrolling; header state toggles on scroll
- Alt text on images throughout navigation and services
- Hero overlay (rgba(0,0,0,0.5)) improves text contrast on photographic backgrounds

## Performance Notes
- Scripts are placed just before the closing body tag (better for initial paint)
- Avoid duplicate script includes (already fixed for intl-tel-input utils)
- Consider deferring non-critical work and externalizing/minifying CSS/JS in future (assets/main.css and assets/main.js)
- Prefer SVG for icons/logos; consider WebP for large photographic images

## Development & Preview
Local preview:
- Python: `python -m http.server 5500`
- Open: http://localhost:5500/

Deployment:
- Static hosting (GitHub Pages, Netlify, Vercel)
- CNAME indicates custom domain if using GitHub Pages

## Customization
- Update :root variables in index.html for color changes
- Adjust font weights/sizes in CSS for different tone
- Replace or optimize imagery in images/
- Add canonical and social meta tags in head for richer link previews
- Configure GTM to include/disable analytics tags based on your privacy policy

## Maintenance
- Keep third-party versions current (AOS and intl-tel-input)
- Verify GTM container ID and triggers
- Periodically audit SEO/meta and accessibility (contrast, keyboard, labels)
