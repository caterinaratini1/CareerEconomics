# Content guide

How to research, write and publish a career profile.

The rule underneath everything here: **a student should be able to check us.**
If a claim cannot be traced to a source, it does not get published — we say we
do not know instead.

---

## 1. Source hierarchy

Use sources in this order. Going further down the list requires a reason.

1. **Government ministries and official portals** — competition notices,
   legislation, ministry guidance
2. **National statistical agencies**
3. **Professional regulators and professional bodies** — registers, ordini
4. **Official university and examination authorities**
5. **Public-sector career portals**
6. **Reputable labour-market research**
7. **Large salary datasets** — last resort, and their limitations must be
   recorded on the source record and shown to the reader

**Never** use blogs, content marketing, social media, or news summaries for a
core fact. For a career whose entry rules are set by law, cite the law or the
official notice — not somebody's article about it.

**Regulated pathways require an official source.** The publication gate enforces
this: a `regulation` claim citing only a statistics office is rejected.

---

## 2. Writing standards

### Plain language

Written for a fifteen-year-old with no insider knowledge. If a term is
unavoidable, define it in the sentence that introduces it. If a sentence needs
re-reading, rewrite it.

### Evidence, not encouragement

No motivational filler. No "the sky is the limit". No implication that wanting
something enough is a route. A student can tell when they are being sold to, and
it costs you everything else on the page.

### Transparent uncertainty

When something varies, say so and say why:

> Salaries vary significantly by employer, seniority, and whether the diplomat
> is posted abroad.

When we have not researched something, the page says so. It does not quietly
omit the section — an absent salary section reads as "this question does not
apply", which is worse than an honest gap.

### Pay

- Always a range, never a single average
- Always state gross or net, and the period. In Italy this is the difference
  between a meaningful figure and a misleading one
- Separate genuinely different populations. "Doctor" pay during specialist
  training, in the health service, and in private practice are three numbers,
  not one range
- Give the year of the source

### Competition

No invented percentages. Where an official body publishes places and applicants,
use those numbers. Where it does not, explain what the competition is like in
practice and say the figures are unavailable.

### Requirements

The distinction students most often get wrong is mandatory versus optional. Use
the four levels honestly:

| Level | Means |
| --- | --- |
| `legally-required` | You cannot do this job without it |
| `usually-expected` | Not a legal rule, but almost everyone has it |
| `useful-but-optional` | Helps; nobody is turned away for lacking it |
| `alternative-route` | A different way in that also works |

Never present an optional extracurricular activity as a requirement. A student
without access to it should not read the page and conclude the career is closed.

### Balance

Advantages and disadvantages should be comparable in number and in seriousness.
Validation warns at a ratio worse than 2:1. A page listing five upsides and two
soft downsides is advertising.

### Misconceptions

The highest-value section in user testing. Look for beliefs that would change a
student's decision if corrected, not trivia.

---

## 3. What AI may and may not do

**May:** rephrase already-verified content for clarity; suggest what questions a
section leaves unanswered; check reading level.

**May not:** be the source of any fact. No salary, requirement, timescale,
probability or legal rule may originate from a language model. If a claim's only
provenance is "a model said so", it is `unverified` at best and must not be
published.

---

## 4. The workflow

1. **Research.** Collect sources first, write second. Record every source with
   publisher, URL, authority level, and the date you opened it.
2. **Draft** `content/careers/<slug>.json`. Set every claim honestly:
   `not_researched` if you have not looked, `unverified` if you have written
   something you cannot yet source.
3. **Register** the file in `lib/content/registry.ts`.
4. **Validate:** `npm run validate:content`. It prints exactly what stands
   between the draft and publication.
5. **Review** against the checklist below, then set `reviewStatus: "reviewed"`.
6. **Resolve** every entry in `editorial.openQuestions` — they block publication.
7. **Publish** by setting `status: "published"`. CI re-runs the gate.

---

## 5. Review checklist

The publication gate checks the mechanical half automatically. This is the half
that needs a person.

- [ ] Would a fifteen-year-old with no background understand this?
- [ ] Are mandatory and optional requirements clearly separated?
- [ ] Are salaries ranges, with gross/net and period stated?
- [ ] Are genuinely different pay populations shown separately?
- [ ] Are country-specific facts inside the country profile, not the shared part?
- [ ] Is every major claim sourced to something in the hierarchy above?
- [ ] Are advantages and disadvantages comparable in weight?
- [ ] Is anything unclear either removed or explicitly qualified?
- [ ] Is the page free of motivational filler?
- [ ] Is the page free of guarantees about admission, jobs or pay?
- [ ] Does "what you can do now" avoid implying that optional things are required?
- [ ] Are the misconceptions ones that would actually change a decision?
- [ ] Has someone who knows the field read it?

That last one matters more than the rest. For a regulated career, a page that
passes every automated check can still be wrong in a way only a practitioner
will notice.

---

## 6. Keeping content current

Every profile carries `lastReviewedAt`, and every source carries `accessedAt`.
Validation warns once either passes a year. Career rules change — degree class
lists, examination formats, age limits — and a stale page stated confidently is
worse than no page.

Re-check at least annually, and immediately when a reform is announced in a
field we cover.
