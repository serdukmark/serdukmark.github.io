# Portfolio redesign · November 2026

## Direction

A personal product portfolio with an explorable experience orbit. Dark graphite, acid green, generous typography and an original portrait. A contrasting lavender research chapter changes the visual pace. The visitor can scan outcomes immediately, explore companies by scrolling, click a company, or rotate the globe with a mouse. Native document scrolling is preserved.

## References studied

- https://lusion.co/ — dimensional storytelling and a large, legible typographic opening. Visually inspected live; the portfolio uses its own Canvas scene, not copied assets.
- https://www.igloo.inc/ — a coherent spatial metaphor and scroll-led discovery. Visually inspected live; translated into the experience orbit rather than a heavyweight fullscreen WebGL world.
- https://bruno-simon.com/ — self-directed exploration, clear controls and a playful ending. Studied public page and controls; retained the existing PM Runner instead of introducing another game.
- https://landonorris.com/ — a personal site with distinct career and media chapters. Inspected live navigation/content; uses original owner photos for the forum and Forbes sections.
- https://linear.app/ — product explanation with specific, readable outcomes. Studied page content and structure; company outcomes stay as real HTML outside the animation.
- https://stripe.com/ — structured product narrative and global visual language. Studied content; the globe is a metaphor for career experience, not invented geographic project locations.
- https://activetheory.net/ and https://www.resn.co.nz/ — creative interactive agency references. Their fetched documents are JavaScript-only; no claim of full interaction review.
- https://poki.com/ — clear invitation to play. Used as a secondary reference for a visible, explicit game launcher.
- https://www.raycast.com/, https://www.craft.do/, https://www.apple.com/airpods-pro/ — additional product presentation references, checked via public pages.

## Content source and boundaries

Source: owner-supplied Резюме_ноябрь_2026.pdf, plus explicitly supplied speaker / Forbes links.

- Magnit: 1,200+ weekly users, 100M RUB/year stated economic impact, 150+ trained PMs/team leads.
- Yandex: assembled team and prepared the scenario for development. No shipped-product, production or launch claim. The resume introduction contradicts its detailed Yandex entry; the corrected detailed entry and owner's explicit correction take precedence.
- T-Bank: 131 interviews, five regions. X5: nine regions, 50+ proposals. Government: group of eight, input from 100+ experts.
- Research: contributed to reports with Yakov and Partners and the Ministry of Finance; presented at BRICS seminar (Brazil, 2025) and NDB meeting (2026). No unsupported personal speaking claim for these events.
- Teaching: 100+ cases; audiences up to 170. DEADLINE mentorship 2025–2026.
- Nine scholarships retained as stated in the current resume; no old Harbour Space or startup content added.
- Forbes and forum cards link to the owner's supplied Telegram posts, not an invented Forbes article URL.
- The PDF is copied unchanged. Its introductory Yandex wording is therefore not silently edited.

## UX and implementation

- Sticky desktop globe, scroll-synchronised company activation, clickable company markers and tabs, mouse drag selection.
- Small screens use a non-sticky globe and linear case studies, avoiding a canvas that occupies the whole screen while scrolling.
- No scroll interception, wheel capture, intro loader, forced audio, external framework, CDN scripts or hidden content required for navigation.
- Text, company links, contact links and detail routes work without JavaScript.
- Reduced motion, pause control, keyboard focus, dark/light persistence, skip link and semantic structure.
- Animation redraws only when necessary and stops off-screen / in background tabs.
- Globe land points derived from Natural Earth 1:110m land geometry (public domain): https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson
- Existing game code and Firebase leaderboard preserved byte-for-byte; no live test scores posted.
- Existing custom domain, verification files, Metrica ID and project URLs preserved. Six bilingual case pages, reciprocal alternate links and sitemap generated.
