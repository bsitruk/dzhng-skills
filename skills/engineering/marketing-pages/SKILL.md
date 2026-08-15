---
name: marketing-pages
description: Build, update, or audit a marketing site's pages by page class — campaign landers, product pages, programmatic SEO trees, editorial. Use when adding or changing a landing/marketing page, wiring a campaign lander to an attribution identifier, changing site-wide nav/footer links, touching sitemap/robots/agent-readable surfaces, or auditing a public site's indexing and reachability.
---

# Marketing Pages

Every public page belongs to exactly one **page class**, and the class decides
everything else — indexing, linking, chrome, and wiring. Classify first; the
rest of this skill is what each class demands.

## Page classes

| Class | Indexing | Reachability | Chrome |
|---|---|---|---|
| **Campaign lander** | `noindex, follow`; never in a sitemap | never linked from nav/footer | minimal: logo + ONE CTA, legal-only footer, no site nav |
| **Product page** | indexed | nav Product section and/or footer | full chrome |
| **SEO tree page** (programmatic: per-persona, per-industry, per-competitor) | indexed | footer link grid + hub pages | full chrome |
| **Editorial** (blog/guides) | indexed | header + footer | full chrome |
| Legal/utility | indexed | footer | full chrome |

A page that is noindexed AND unlinked is a **zombie** — either promote it to a
linked, indexed class or make it a campaign lander. Never leave the halfway
state. Keep campaign landers in a dedicated URL prefix (e.g. `/l/<slug>`): one
`startsWith` then covers blanket noindex, "never nav-linked" lint, and slug
collisions with real pages become impossible.

## Building a campaign lander

Campaign landers are alternate main landers — one audience, one promise, paid
traffic. They trade SEO for message-match freedom, which is why they must stay
out of the index: indexed near-duplicates split authority and freeze copy you
want to A/B daily.

1. **Message match end-to-end**: ad copy → H1 → post-signup first screen, one
   unbroken promise. If the product supports it, carry the campaign
   identifier through signup into onboarding and analytics so the first-run
   experience continues the promise and conversions are attributable per
   lander.
2. One CTA, repeated; social proof beside it; friction-reducing microcopy
   ("no credit card"); capture only what qualifies later (usually email).
3. Static text/image hero — no full-viewport video or heavy JS above the
   fold; LCP is a conversion input on paid traffic.
4. Before the first ad spends, know where conversion-per-lander will be read.
   A lander you cannot measure cannot be iterated.

## Building or updating an indexed page

Walk the wiring contract — each item has one owner in the codebase; find the
current owner rather than trusting remembered paths:

1. The route, plus whatever closed-world route registry the site's gates
   check against.
2. A sitemap entry (indexed pages only — a noindexed URL in the sitemap is a
   contradictory signal, and vice versa). Honest `lastmod`, not build time.
3. Agent-readable surfaces if the site ships them (llms.txt, markdown
   twins): render them from the same copy source the page renders from —
   never from built HTML, never hand-drifted duplicates.
4. Robots: allow reviewed indexed trees for AI crawlers; disallow only
   campaign landers and internal surfaces.
5. A footer (or header) link — the footer link grid is the crawl rail; pages
   discoverable only via the sitemap sit in "Discovered — not indexed" for
   weeks and receive no internal authority.
6. Product facts (pricing, limits, tier names) derive from the single source
   the product code owns — restated numbers drift silently and nothing turns
   red.
7. Internal links name paths, never origins, so a closed-world check can
   verify every authored target actually resolves.

## Visual coverage

- Reusable sections and components get an isolated, deterministic **fixture**
  (a playground/storybook entry) that owns their visual coverage; the fixture
  menu doubles as the component catalog new pages are composed from.
- Representative full-page screenshots stay at ONE key route per template.
  Routes churn; fixtures are the stable oracle. New template → one new
  representative route; new section → a fixture, not more route shots.
- Accept visual baselines only after an unprimed second opinion — eyes primed
  by the change pass defects fresh eyes catch.

## SEO rules that pay rent

- Contextual in-body links from editorial to money pages move more authority
  than footer anchors — add them where content genuinely relates.
- Comparison/competitor pages carry an honest visible updated-date and get
  refreshed on a real cadence — a stale dated page is worse than an undated
  one.
- Programmatic tree pages must stay substantive (concrete jobs, specific
  copy) — thin templated pages are doorway-page bait.
- Deleting a page means deleting every reference in the same pass: route
  registry, sitemap, agent-readable twin, links from kept pages, visual
  baselines, and e2e/journey anchors (grep the test suites — a rename that
  keeps local gates green can break a live journey hours later). No
  redirects for killed campaign pages: deleted routes 404, and the 404s in
  Search Console are the intended signal, not a defect.

## Audit

Run these sweeps; each must come back empty or explained:

1. Indexed page unreachable from header/footer (zombie check).
2. Sitemap URL that is noindexed, or indexed page missing from the sitemap.
3. robots/meta/sitemap disagreement on any URL.
4. Campaign lander linked from any indexed page.
5. Component with no owner in the visual coverage system.
6. Marketing copy restating a product fact that has a canonical owner.

## Gates

Close out with the site's content/route verification suite, a production
build plus its build-output checks, and the visual regression gate for
anything visual.
