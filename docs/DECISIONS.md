# Architecture decision records

Short records of decisions that would otherwise be re-litigated. Each states
the decision, why, and what would make us revisit it.

---

## ADR-0001 — One Next.js application, no separate backend

**Status:** accepted

A single Next.js app rather than a Next frontend plus a Python service: one
repository, one deployment, one auth story, one set of environment variables,
and no cross-service networking. At MVP scale a separate service buys nothing
and costs a category of bugs.

**Revisit when** we need scheduled content pipelines, heavy retrieval, or
recurring data processing that does not fit a request lifecycle. That is a
Phase 5+ concern at the earliest, and it can be added alongside rather than by
rewriting.

---

## ADR-0002 — Content lives in version-controlled JSON, not a CMS

**Status:** accepted

Career content is `content/careers/*.json`, validated by Zod, reviewed in pull
requests. No CMS subscription, no admin UI to build.

This gives version history, review comments, rollback, and diffs on factual
claims — the things a content operation that publishes facts about people's
futures actually needs — for free. A CMS gives convenience for non-technical
editors, which is not currently a constraint (the founder is the editor).

The files are also the natural seed format for Supabase in Phase 2, so this is
not throwaway work.

**Revisit when** non-technical contributors become a bottleneck, or content
volume makes hand-editing JSON error-prone. A thin admin UI writing to the same
schema is the answer then — not a hosted CMS that owns the data.

---

## ADR-0003 — Facts are modelled as three-state claims

**Status:** accepted

Rather than storing `salary_entry_min: number` alongside a loosely-related
source table, every fact a student might act on is wrapped in a discriminated
union: `verified` | `unverified` | `not_researched`
(`lib/content/claim.ts`).

The product's whole proposition is that its claims are checkable. The realistic
failure is not malice but drift: someone drafts a plausible figure, it reads
fine in review, and it ships unsourced. Flat columns cannot prevent that
because the number and its evidence are separate fields that nothing forces to
travel together.

With the union, `value` does not exist on `not_researched`, so a component
physically cannot render a number that was never researched. The editorial rule
becomes a compile error. The `unverified` state exists so drafts can be tested
with students before every source is collected, and the publication gate
(ADR-0004) rejects it.

**Cost:** content JSON is more verbose, and every claim read needs a state
check. Worth it.

---

## ADR-0004 — The publication gate is code, not a checklist

**Status:** accepted

`lib/content/publication.ts` decides whether a career may be `published`, and
`npm run validate:content` fails CI if a published career does not pass. It
requires verified pay/timescale/education/regulation/competition, ≥2 sources, an
official source specifically for legal claims, a human review flag, and no
outstanding open questions.

The build plan's §14.3 review checklist is good but is a human process, and
human processes degrade under deadline. The machine-checkable half of it should
be machine-checked. The half that genuinely needs a person — is this
understandable to a fifteen-year-old? is it free of motivational filler? — stays
in `docs/CONTENT_GUIDE.md`, and `reviewStatus` records that someone did it.

---

## ADR-0005 — Content is authored in English for now (open question)

**Status:** accepted with reservations — **needs a decision before the pilot**

The build plan lists Italian/English language support under "optional, only
after the core is stable", and writes all its own content examples in English.
This implementation follows that: prose is English, with Italian aliases so
search works for terms students actually type (`funzionario diplomatico`,
`sviluppatore`, `medico chirurgo`).

**The reservation is real.** The pilot is with Italian schools and 14–19 year
olds, and the §4 success criteria are about comprehension. English prose
confounds that measurement: a student who does not understand a page may be
failing at the language rather than at the explanation, and we would not be able
to tell which.

**Recommendation:** author the pilot content in Italian, and treat English as
the later addition. The schema is already language-neutral per record, and the
`aliases` array carries a `language` field, so nothing structural blocks it —
this is an editorial cost, not an engineering one.

**Revisit:** before Milestone 3 (content-complete MVP), and certainly before any
classroom session.

---

## ADR-0006 — Search is a GET form with no client JavaScript

**Status:** accepted

Search is a plain `<form method="get" action="/careers">`. No typeahead, no
client bundle.

The obvious design is a live dropdown. It is worse here on every axis that
matters for this audience: it breaks with scripting disabled or blocked by a
school network, needs custom ARIA to be operable by keyboard and screen reader,
loses the back button, and produces no shareable URL. The GET form gets all of
those right by default, and it gives a teacher a link they can put on the board.

Ranking lives in `lib/search/rank.ts` as pure functions specifically so Phase 4
can port it to PostgreSQL `similarity()` and prove the port against the same
tests.

**Revisit when** the career count makes browsing impractical (roughly 100+). A
progressive-enhancement layer may then be added *on top* — the form must keep
working without it.

---

## ADR-0007 — Edit distance counts transpositions as one edit

**Status:** accepted

Fuzzy matching uses optimal string alignment (restricted Damerau-Levenshtein)
rather than plain Levenshtein.

Found while testing: `medcio` → `medico` is a transposition of two adjacent
letters, which plain Levenshtein charges 2 edits — the same as two unrelated
wrong letters. A six-letter word gets a one-edit budget, so the single most
common typing error was the one case fuzzy search failed on. Counting
transpositions as one edit fixes it without widening the budget and letting
genuinely different words match.

Note for Phase 4: PostgreSQL's `levenshtein()` does **not** do this.
`pg_trgm`'s `similarity()` handles transpositions acceptably; a port that
switches to `levenshtein()` will reintroduce this bug.

---

## ADR-0008 — The ten-minute budget is measured over a core reading path

**Status:** accepted

§4 requires that a career page take under ten minutes to read. Measured end to
end, the first drafts came in at 15–16 minutes.

Deleting content until the number dropped would have removed material students
need. Instead the page is explicitly two-tier: a core path (what is this, how do
you get in, what does it cost you, what can I do now) that must fit the budget,
and secondary sections behind native `<details>` that a student opens only if
still interested. Advantages and disadvantages are split mid-field — every
headline is visible, the supporting detail expands — because burying the
downsides behind a click would be the wrong product.

`lib/content/reading-time.ts` owns the partition and CI enforces the budget on
the core path. **The partition must be kept in step with the page's disclosure
structure**, or the number stops describing the page.

---

## ADR-0009 — Content is loaded via a static registry, not a directory scan

**Status:** accepted

`lib/content/registry.ts` imports each career JSON explicitly rather than
scanning `content/careers/` with `node:fs`.

The scan is more convenient and worse everywhere else: it defeats bundling,
needs file-tracing configuration to survive serverless deployment, and turns a
missing file into a runtime 404 rather than a build failure. The cost is one
line per career, and `validate:content` checks the registry against the
directory so a file cannot be silently orphaned.

---

## ADR-0010 — Draft content is visible only behind an explicit preview flag

**Status:** accepted

Phase 1's deliverable is testing draft pages with real teachers and students, so
drafts must be viewable. But a reader mistaking a working draft for a checked
fact is the worst failure this product has.

So: preview is on by default in development, and in production requires an
explicit `NEXT_PUBLIC_CONTENT_PREVIEW=true`. When it is on, a non-dismissible
banner sits above every page, per-page metadata is `noindex`, `robots.txt`
disallows everything, and drafts are excluded from the sitemap. Four independent
mechanisms, because any one of them can be misconfigured.
