# Data model

The schema in `lib/content/schema.ts` is the single source of truth. This
document explains the shape, the reasoning behind the parts that differ from the
original build plan, and how it maps onto PostgreSQL in Phase 2.

---

## Shape

```
CareerProfile
├─ slug, canonicalName, category, status
├─ aliases[]                    { text, language }      ← the search index
├─ oneSentence                                          ← listings + header
├─ plainLanguageSummary
├─ whatTheyDo                   { overview, concreteExamples[] }
├─ typicalDay                   { overview, commonTasks[], howMuchItVaries }
├─ suitability                  { suitsYouIf[], mayNotSuitYouIf[] }
├─ advantages[] / disadvantages[]  { title, detail }
├─ misconceptions[]             { belief, reality }
├─ skills[]                     { name, importance, why }
├─ relatedCareers[]             { name, slug?, howItDiffers }
├─ countryProfiles[]            ← everything country-specific
│   ├─ countryCode
│   ├─ pathway[]                { stepNumber, stage, title, description, requirement }
│   ├─ educationRoutes[]        { name, requirement, description }
│   ├─ salary            Claim<Salary>
│   ├─ timeToEnter       Claim<{ minYears, maxYears, notes }>
│   ├─ educationSummary  Claim<string>
│   ├─ regulation        Claim<string>
│   ├─ competition       Claim<{ level, whatThisMeans }>
│   ├─ outlook           Claim<string>?
│   ├─ workEnvironment[]
│   ├─ whatYouCanDoNow[]        { action, why, whenApplicable? }
│   └─ lastReviewedAt, reviewStatus
├─ sources[]                    { id, title, publisher, url, authorityLevel, accessedAt, … }
└─ editorial                    { lastReviewedAt, reviewedBy, openQuestions[] }
```

**The split that matters:** anything answering "how do you become one" is
country-specific and lives under `countryProfiles`. Anything answering "what is
this job" is shared. Getting this boundary wrong is what makes a career site
unusable outside the country it was written for, and it is very hard to
retrofit.

---

## Differences from the build plan's §9, and why

### Claims replace flat columns plus a link table

The plan has `salary_entry_min`, `salary_entry_max`, … on
`career_country_profiles`, with evidence in a separate `career_source_links`
table joined by `claim_category`.

That design cannot express "we have not researched this" distinctly from "this
is zero", and nothing structurally binds a number to its evidence. Here, each
fact is a `Claim<T>` carrying its own state, value, sources and check date. See
ADR-0003.

### Salary carries a basis

`gross-annual` | `net-annual` | `gross-monthly` | `net-monthly`, plus currency.

Italian salary reporting mixes RAL (gross annual) and monthly net freely. A
student comparing "€30.000" against "€1.500" without knowing which is which is
comparing nothing. The plan's bare min/max columns cannot carry this, so it is
required here.

### Sources carry an authority level and optional limitations

`authorityLevel` encodes §14.1's source hierarchy as data, which lets the
publication gate enforce "regulated pathways use official sources"
mechanically. `limitations` is required for `salary-dataset` sources and is
rendered to the reader.

### Requirement levels are on both pathway steps and education routes

The plan has `required: boolean`. A boolean cannot distinguish "legally
required" from "everyone has one" from "helps but optional" — which is the
distinction §10.6 is specifically about, and the one students most often get
wrong.

### `editorial.openQuestions` blocks publication

Not in the plan. It makes outstanding research a first-class, machine-checkable
part of the record rather than a note somewhere else.

---

## Cross-field rules (enforced by `superRefine`)

- Source ids are unique within a career
- Every `sourceIds` reference resolves to a real source
- Pathway steps are numbered 1..n, consecutive, no gaps
- A country appears at most once per career
- Aliases are unique per language, case-insensitively
- `salary-dataset` sources must disclose limitations

---

## Phase 2: mapping to PostgreSQL

The JSON files remain the authoring format and the seed source. Supabase becomes
the read path.

| Schema element | Table |
| --- | --- |
| `CareerProfile` (shared fields) | `careers` |
| `aliases[]` | `career_aliases` |
| `countryProfiles[]` | `career_country_profiles` |
| `pathway[]` | `pathway_steps` |
| `educationRoutes[]` | `education_routes` |
| `skills[]` | `career_skills` + `skills` |
| `sources[]` | `sources` + `career_source_links` |

### Claims in SQL

Three columns per claim rather than a JSON blob, so they are queryable and
constrainable:

```sql
salary_state        claim_state not null,   -- enum: verified|unverified|not_researched
salary_value        jsonb,
salary_source_ids   text[],
salary_verified_at  date,
salary_note         text,

constraint salary_claim_consistent check (
  (salary_state = 'not_researched'
     and salary_value is null and salary_note is not null)
  or (salary_state = 'unverified'
     and salary_value is not null and salary_note is not null)
  or (salary_state = 'verified'
     and salary_value is not null
     and array_length(salary_source_ids, 1) >= 1
     and salary_verified_at is not null)
)
```

The check constraint is the database-level equivalent of the discriminated
union. Do not drop it — without it the invariant survives only as long as every
writer remembers it.

### Row-level security

- Anonymous read is restricted to `careers.status = 'published'` and its
  children. Drafts must not be reachable with the anon key.
- Public roles have no write grant on any content table.
- `feedback` and `missing_career_requests` (Phase 6) are insert-only for
  anonymous users and not readable by them.

### Search indexes

`lib/search/normalize.ts` defines the normalisation rules. The PostgreSQL index
must mirror them exactly or search behaviour will differ between the two
implementations:

```sql
create extension if not exists pg_trgm;
create extension if not exists unaccent;

create index career_aliases_trgm
  on career_aliases
  using gin (lower(unaccent(alias)) gin_trgm_ops);

create index careers_name_trgm
  on careers
  using gin (lower(unaccent(canonical_name)) gin_trgm_ops);

create index careers_slug on careers (slug);
```

**Use `similarity()` from `pg_trgm`, not `levenshtein()`.** See ADR-0007:
`levenshtein()` charges an adjacent transposition two edits, which reintroduces
the `medcio` → `medico` failure the current implementation fixes.

`tests/unit/search.test.ts` is the specification the port must satisfy. Run the
same cases against SQL before switching over.
