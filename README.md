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

GitHub Pages serves the `main` branch. Preserve CNAME, verification files and `.nojekyll`. No hosting migration. All 22 indexable pages have self-canonical URLs, reciprocal RU/EN links, metadata and JSON-LD. Existing project routes remain available. Sitemap and RSS feeds are regenerated. The 404 and private-profile redirect are noindex. Publishing does not confirm search-engine indexing.


## Search and AI discovery (November 19, 2026)

- `content/discovery.json`: reviewed case context, stage and metric definitions.
- `scripts/discovery.py`: RU/EN project index, capabilities, research and speaking pages, plus equivalent Markdown exports.
- Homepages use ProfilePage with Person mainEntity; cases use WebPage/CreativeWork and breadcrumbs. No invented ratings, clients or FAQ rich-result promises.
- The sitemap contains all 22 canonical pages, language alternatives and homepage portrait references. All meaningful content is readable without JavaScript.
- `robots.txt` allows search crawlers. This preserves the existing general policy rather than changing training permissions. `llms.txt` and `llms-full.txt` are optional discovery aids, not an established ranking requirement.
- IndexNow submits changed canonical HTML pages after a successful Pages deployment. `content/indexnow.json` and the root verification file identify this public site; no account credentials are stored. `python3 scripts/submit_indexnow.py --dry-run` previews the URLs; without `--dry-run` it verifies the published key and notifies participating engines. Acceptance is not indexing. Google requires its own Search Console/sitemap workflow.
- Add actual publication/report URLs when available. Current media links lead to the owner's Telegram posts; do not represent these as independent verification of the results.

Owner actions: verify ownership in Google Search Console, Yandex Webmaster and Bing Webmaster Tools; submit https://mserdyuk.ru/sitemap.xml; obtain legitimate profile links from the university, conference and publication pages; publish original case studies with methods and source evidence. Review indexing, non-brand queries, contact conversions and available AI citation reports monthly. Do not buy link packages or mass-produce duplicate keyword pages.

Reference documentation: [Google AI search](https://developers.google.com/search/docs/appearance/ai-features), [Google profile pages](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [IndexNow](https://www.indexnow.org/documentation), [Yandex Alice](https://yandex.ru/support/webmaster/ru/alice), [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers).
