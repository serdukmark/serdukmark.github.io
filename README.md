# Mark Serdyuk · interactive portfolio

Bilingual static site for GitHub Pages at https://mserdyuk.ru. November 2026 redesign based on the owner's current PDF resume.

## Edit and preview

- `content/experience.json`: reviewed bilingual company experience.
- `scripts/build.py`: homepage copy, research, education, media, metadata, feeds, case routes.
- `assets/styles.css`: responsive dark/light design.
- `assets/orbit.js`: local Canvas globe, scroll selection and mouse drag.
- `assets/app.js`: navigation, theme, contact copy, analytics, on-demand game loader.
- `assets/game.js`: preserved PM Runner gameplay and leaderboard.
- `content/game/*.snippet`: original bilingual game markup.
- `serdyuk-mark-cv.pdf`: current owner-provided PDF, unchanged.

```sh
python3 scripts/build.py
python3 scripts/check.py
node --check assets/app.js
node --check assets/orbit.js
node tests/game.test.cjs
python3 -m http.server 8765 --bind 127.0.0.1
```

No npm install or external build service is required. Generated HTML is committed. CI rebuilds and checks consistency, routes, metadata and game behaviour. Build outputs are deterministic.

## Interaction and accessibility

Default is dark on a first visit; theme choice persists. Main content is server-rendered HTML. Desktop experience has a sticky globe that rotates with page scrolling and clickable company markers. Mouse users can drag the globe to pick a company. Mobile uses a linear layout. Motion respects reduced-motion preferences and has a pause control. There is no scroll hijacking or autoplay sound. Canvas stops redrawing when settled, off-screen or in a hidden tab.

## Content and assets

See `docs/design-notes.md` for references, content provenance and decisions. The hero uses the owner's original photo with CSS colour treatment. Forum and Forbes photos were supplied earlier by the owner. The globe's simplified land data is derived from public-domain Natural Earth geometry. Company badges are typographic marks with accessible full names.

Yandex is described as preparation for development, not launch. Old startup / 700-user / September content was removed from generated pages and feeds. Downloaded PDF remains the exact supplied document, including its inconsistent introductory Yandex sentence.

## Analytics and game

Yandex Metrica 112974030 is enabled only on production hostnames, never localhost. Existing events for contact, CV, project and game clicks remain; media clicks use `forbes_click` and `forum_click`. No additional dashboard goals were created.

PM Runner, scoring/difficulty, Firebase endpoint and restart auto-save behaviour are unchanged. The game loads after opening it. Tests use fake transport and do not write public scores. Server-side Firebase rules remain outside this repository.

## Deployment and discovery

GitHub Pages serves the `main` branch. Preserve CNAME, verification files and `.nojekyll`. No hosting migration. All 14 indexable pages have self-canonical URLs, reciprocal RU/EN links, metadata and JSON-LD. Existing project routes remain available. Sitemap and RSS feeds are regenerated. The 404 and private-profile redirect are noindex. Publishing does not confirm search-engine indexing.
