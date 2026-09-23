# Mark Serdyuk · personal portfolio

A dependency-free, bilingual static website for GitHub Pages at **mserdyuk.ru**.
Dark on first visit; the visitor's theme choice persists. Russian and English have separate URLs, metadata and feeds. No client-side framework or production build service is required.

## Edit and preview

- Page content and bilingual copy: `scripts/build.py`.
- Milestones shown under Now: `content/updates.json` (Russian first, English second).
- Design: `assets/styles.css`.
- Site interactions and analytics: `assets/app.js`.
- On-demand game: `assets/game.js`.
- Generated HTML is committed so GitHub Pages can serve it directly.

```sh
python3 scripts/build.py
python3 scripts/check.py
python3 -m http.server 8765
```

Visit `http://localhost:8765`. The checks validate routes, assets, anchor targets, language metadata and XML feeds. GitHub Actions also checks that generated pages match the source.

When adding milestones, use a unique stable `id`, a truthful period and both translations. Update the feed's `updated` timestamps in the generator when publishing new entries. Do not invent event dates from the date of publication.

## Analytics

Set `metricaId` in `assets/config.js` to the numeric ID of the owner's Yandex Metrica counter. `0` disables the provider entirely. Local previews never load Metrica. The supplied counter is 112974030. Session replay is enabled, matching the code supplied by the owner.

The following eight JavaScript-event goals were created in counter 112974030 on 2026-09-23:

| Identifier | What it records |
| --- | --- |
| `telegram_click` | Telegram contact link |
| `email_click` | Email contact link |
| `phone_click` | Phone contact link |
| `cv_download` | CV download link |
| `case_open` | A project card click |
| `case_view` | A project page visit |
| `calculator_use` | First calculator interaction per page view |
| `game_open` | Opening the game |

Only language and the selected public project slug are attached to custom events. The calculator's values and players' nicknames are not sent as analytics parameters.

## PM Runner

The original Firebase leaderboard endpoint is retained. Nothing is written until a visitor explicitly posts a nickname and score. Success appears only after an HTTP success response. The game pauses when hidden, scrolled away or collapsed; it does not animate while idle and does not poll the leaderboard in the background. Simulation runs at a fixed 60 steps per second across display refresh rates.

The server's Firebase rules are outside this repository and have not been audited or changed. A public client cannot enforce trustworthy scores; server-side validation, moderation, quotas and an indexed top-score query require separate Firebase access. Rendering nicknames uses `textContent`.

## Portrait and content

The new portrait is AI-generated from the owner's existing photo and labelled on the page. Optimised WebP variants are self-hosted. The original photo, PDF CV, verification file and custom-domain CNAME remain available.

Project details use the original portfolio and owner-provided context. Diagrams illustrate the approach and are not screenshots or depictions of internal systems. Startup work remains a short supporting note. The 100M RUB/year figure is retained from the original portfolio; no unprovided calculation methodology or new business metrics were invented.

## Release

Review both languages, light/dark themes, mobile layouts and project pages before merging the redesign branch to `main`. Merging to the branch configured for GitHub Pages publishes the site. No hosting migration is required.

## Search and AI discovery

Each indexable page has a unique title and description, a self-canonical URL, reciprocal RU/EN/x-default links and server-rendered text. The homepage connects ProfilePage, Person and WebSite entities. Project pages connect WebPage, CreativeWork, author and visible BreadcrumbList. Stable entity IDs are shared across translations. The schema describes this personal portfolio, not a local business.

The FAQ is visible HTML with links to projects, the CV and RSS. It does not promise FAQ rich results. No special AI-only files, keyword lists or invented endorsements are necessary. Keep factual claims consistent between visible content and JSON-LD.

`robots.txt` permits crawling and points to the sitemap. GitHub Pages redirects HTTP and the github.io hostname to the HTTPS custom domain. Missing routes return HTTP 404; the custom error page has noindex and no canonical/profile markup. The sitemap includes only the eight indexable pages. Search verification files are retained.

After publishing, submit `https://mserdyuk.ru/sitemap.xml` in Google Search Console and Yandex Webmaster under a verified property. Inspect the homepage and project URLs, then request indexing/re-crawl. Repository access alone cannot confirm property ownership, index coverage or search impressions. A public `site:` query is not a reliable coverage report.

Monitor organic landing pages and the existing contact/CV goals in Metrica. Compare search impressions, clicks and indexed URLs in the webmaster tools before drawing conclusions. Public mentions and referral links from relevant professional profiles can support discovery; do not create a local business listing for a personal portfolio without an eligible business.
