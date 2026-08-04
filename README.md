# Career Economics Lab

A clear, transparent career-guidance platform for students — especially those
without access to people who can tell them what a job is really like.

A student joins with a class code, explores careers, and gets a page
explaining, in plain language, what the work involves, how people get in,
what it pays, how competitive it is, the real downsides, and what they could
do now — with the source behind every important claim, plus a simulator for
modelling study cost and break-even. Teachers create the class and (in a
later phase) see progress and reflections.

**Status:** mid-pivot. Phase 1 was a zero-account, zero-JS content
prototype; as of 2026-08-04 the product adopted a classroom/account model
(see [`docs/DECISIONS.md`](docs/DECISIONS.md) ADR-0011) per an external
UI/UX guide. The student-facing flow (join → dashboard → library →
detail/simulator) works end to end against an in-memory, dev-only class
store. Teacher auth, persistent classes, comparison, and reflection are
planned but not built — see ADR-0011 for the exact split. Three career
profiles exist as structural drafts; nothing is published — see [Content
integrity](#content-integrity).

**Language:** the product is in Italian — interface and content both. See
[`docs/DECISIONS.md`](docs/DECISIONS.md) ADR-0005.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

No environment variables are needed for Phase 1. Career content is read from
version-controlled JSON under `content/careers/`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit`, strict |
| `npm test` | Vitest unit + rendering tests |
| `npm run validate:content` | Schema + publication-gate check on all content |
| `npm run verify` | Everything above, in the order CI runs it |

Run `npm run verify` before calling a milestone complete.

---

## Content integrity

This is the part of the codebase worth understanding first, because it is what
the product actually sells.

Career pages are read by fifteen-year-olds making decisions. The failure mode
that matters is not a crash — it is a plausible, unsourced number rendering as
fact. So evidence is modelled in the type system rather than left to review
discipline.

Every fact a student might act on is a **claim** (`lib/content/claim.ts`) in one
of three states:

| State | Means | Renders as |
| --- | --- | --- |
| `verified` | Has a value, ≥1 source, and a check date | The value, with a source link and date |
| `unverified` | Has a value, no source yet | The value, visibly marked "unchecked draft" |
| `not_researched` | No value at all | An explicit statement of the gap |

Because `value` does not exist on the `not_researched` variant, a component
**cannot** read a number that was never researched — it is a compile error, not
a code-review catch.

On top of that sits the **publication gate** (`lib/content/publication.ts`),
which decides whether a career may carry `status: "published"`. It requires
verified pay, timescale, education, regulation and competition claims, at least
two credible sources, an official source specifically for legal claims, and a
human review flag. `npm run validate:content` runs it in CI, so a career cannot
reach production with a hole in it even if a reviewer misses one.

### Why nothing is published yet

The three shipped careers describe the work, the route in and the trade-offs
accurately — that content is editorial judgement, and it is the thing Phase 1
exists to test with students. But **no salary figures, competition rates or
legal requirements have been verified against official sources**, so every such
claim is `unverified` or `not_researched` and all three careers sit at
`status: "draft"`.

That is the correct state, not an unfinished one. The build plan is explicit
that AI-generated facts must never be published as data, and inventing a
plausible RAL range would have been exactly that. The research needed to
promote each career is listed in its `editorial.openQuestions`, and
`npm run validate:content` prints the full outstanding list.

Drafts are visible in **preview mode** (default in development; requires
`NEXT_PUBLIC_CONTENT_PREVIEW=true` in production) behind a non-dismissible
banner, and `robots.txt` disallows everything while it is on.

---

## Architecture

A single Next.js application. No separate backend — see
[`docs/DECISIONS.md`](docs/DECISIONS.md) ADR-0001.

```
app/                    routes (App Router)
  page.tsx              join screen (class code + nickname) — the first screen
  student/              session-gated: layout.tsx guards every route below it
    page.tsx            dashboard
    careers/[slug]/     the career page — §10's template, plus the simulator
    compare/            placeholder — planned, not built (ADR-0011)
    reflection/         placeholder — planned, not built (ADR-0011)
  teacher/               placeholder — planned, not built (ADR-0011)
components/
  career/               claim rendering, quick facts, pathway, sources
  student/               simulator (client component), library card, step nav
  search/               the no-JavaScript search form
  ui/                   shared primitives
content/careers/*.json  career content — the source of truth
lib/
  content/              schema, claims, publication gate, repository
  classes/              ClassRepository — in-memory dev impl (ADR-0011)
  session/              dev-mode student session cookie (ADR-0011)
  simulator/             cost/break-even assumptions + pure calculation
  search/               normalisation and ranking (pure functions)
scripts/                content validation
tests/                  unit + rendering
```

The **repository** (`lib/content/repository.ts`) is the seam. Pages talk to a
`CareerRepository` interface; Phase 1 implements it over JSON files, Phase 2
implements it over Supabase. That migration should touch one file.
`lib/classes/repository.ts` follows the same pattern for classes.

### Notable properties

- **Almost every route still ships no application client JavaScript.** The
  one deliberate exception is `components/student/CareerSimulator.tsx` — see
  ADR-0013 for why that one earns it. Next still ships its React runtime for
  hydration regardless — see the page weight below.
- **Search works with JavaScript disabled.** It is a `GET` form, which also
  gives shareable result URLs and a working back button.
- **Progressive disclosure is native `<details>`.** Keyboard-accessible and
  find-in-page-friendly for free, unlike a JS accordion — and it works with
  scripting off.
- **The ten-minute reading budget is enforced in CI**
  (`lib/content/reading-time.ts`), measured over the core reading path. All
  three careers currently sit within 1–3% of the limit in Italian, so a new
  paragraph needs a matching cut.
- **Search is bilingual.** Content is Italian, but every career carries English
  aliases too, because students type `software engineer` as readily as
  `sviluppatore`. A test enforces both.
- **`/student/*` requires a session.** `app/student/layout.tsx` redirects to
  `/` (the join screen) if there's no session cookie — there's no anonymous
  path to career content anymore, unlike Phase 1.

### Page weight

Measured on `/careers/diplomat` under the old Phase 1 URL structure,
production build, compressed — kept here as the last known baseline; it has
not been re-measured against `/student/careers/[slug]` since the simulator
(a real client bundle) was added:

| | Size |
| --- | --- |
| HTML | 24 KB |
| CSS | 5 KB |
| JS (Next/React runtime) | 177 KB |
| **Total** | **~201 KB** |

Inside §19's 500 KB budget, but the JS is 88% of it and none of it is ours —
it is the App Router's hydration runtime, which ships whether or not a route
has a client component. If that becomes a problem on the low-end devices this
is aimed at, the lever is exporting the content routes as static HTML rather
than trimming application code, because there is no application code to trim.

---

## Adding a career

1. Research it against official sources — see
   [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md).
2. Write `content/careers/<slug>.json`.
3. Add the import to `lib/content/registry.ts` (validation checks parity).
4. `npm run validate:content` and resolve what it reports.
5. Open a pull request. Review is the publication mechanism — there is no CMS.

Write content in Italian, and give every career both Italian and English
aliases.

---

## Documentation

- [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) — research standards, source
  hierarchy, review checklist
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — the schema and the Phase 2
  PostgreSQL mapping
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — architecture decision records
- [`docs/PILOT_GUIDE.md`](docs/PILOT_GUIDE.md) — running a school pilot

---

## Scope

Phase 1 covers **Italy** only. The schema is multi-country from the start, but
one country done properly beats five done badly — entry routes for regulated
professions are not portable.

Accounts and a teacher dashboard are now in scope (ADR-0011) — that changed
2026-08-04 and supersedes the line that used to be here. Still deliberately
excluded: personality tests, job listings, payments, gamification, native
apps, and open-ended AI chat.
