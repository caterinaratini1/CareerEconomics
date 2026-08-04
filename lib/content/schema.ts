import { z } from 'zod';
import { claim, isoDateSchema, sourceIdSchema } from './claim';

/**
 * The career content schema.
 *
 * This is the contract between content research and the website. It is the
 * single source of truth for both: `content/careers/*.json` is validated
 * against it in CI, and every React component reads the inferred types.
 *
 * Two rules shape the design:
 *   1. Anything a student might act on is a Claim (see ./claim.ts).
 *   2. Anything country-specific lives under `countryProfiles`, never at the
 *      top level — "how do you become one" is not portable across borders.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'Slugs must be lowercase kebab-case, e.g. "software-engineer"',
  )
  .min(2)
  .max(64);

export const countryCodeSchema = z
  .string()
  .regex(/^[A-Z]{2}$/, 'Use an ISO 3166-1 alpha-2 code, e.g. "IT"');

export const languageCodeSchema = z
  .string()
  .regex(/^[a-z]{2}$/, 'Use an ISO 639-1 code, e.g. "it"');

/**
 * Plain-language prose aimed at a 15-year-old. The upper bound is deliberate:
 * §10 asks for a page readable in under ten minutes, and unbounded fields are
 * how that budget quietly gets spent. `validate-content` also checks the whole
 * page's reading time.
 */
const prose = (min: number, max: number) => z.string().trim().min(min).max(max);

export const CATEGORIES = [
  'public-service',
  'healthcare',
  'law-and-business',
  'technology-and-design',
  'science-and-engineering',
  'education-and-communication',
] as const;

export const categorySchema = z.enum(CATEGORIES);

/** §9.2 content status workflow. Only `published` is publicly visible. */
export const CONTENT_STATUSES = [
  'draft',
  'researching',
  'review_required',
  'approved',
  'published',
  'archived',
] as const;

export const contentStatusSchema = z.enum(CONTENT_STATUSES);

export const LEVELS = ['low', 'moderate', 'high', 'very-high'] as const;
export const levelSchema = z.enum(LEVELS);

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

/** §14.1 source priority, encoded so validation can enforce it. */
export const AUTHORITY_LEVELS = [
  'official-government', // ministries, official portals, legislation
  'national-statistics', // national statistical agencies
  'professional-body', // regulators, ordini professionali
  'academic-institution', // universities, examination authorities
  'public-career-portal',
  'labour-market-research',
  'salary-dataset', // large datasets; limitations must be disclosed
] as const;

export const authorityLevelSchema = z.enum(AUTHORITY_LEVELS);

/**
 * Authority levels acceptable as the sole evidence for a regulated pathway
 * claim (§14.1: "regulated pathways use official sources").
 */
export const OFFICIAL_AUTHORITY_LEVELS = [
  'official-government',
  'professional-body',
  'academic-institution',
] as const satisfies readonly (typeof AUTHORITY_LEVELS)[number][];

export const sourceSchema = z.object({
  id: sourceIdSchema,
  title: z.string().min(3).max(200),
  publisher: z.string().min(2).max(120),
  url: z.url({ protocol: /^https$/ }),
  authorityLevel: authorityLevelSchema,
  /** When the source itself was published or last updated, if stated. */
  publicationDate: isoDateSchema.optional(),
  /** When a human last opened this URL and confirmed it says what we claim. */
  accessedAt: isoDateSchema,
  countryCode: countryCodeSchema.optional(),
  /** Disclosed limitations — required for salary datasets (§14.1 item 7). */
  limitations: z.string().min(1).optional(),
});

export type Source = z.infer<typeof sourceSchema>;

// ---------------------------------------------------------------------------
// Salary
// ---------------------------------------------------------------------------

/**
 * Italian salary reporting is ambiguous unless gross/net and the reference
 * period are explicit: a student comparing a "€30.000" RAL against a
 * "€1.500" monthly net figure is comparing nothing at all. The doc's flat
 * min/max columns cannot express that, so this model requires it.
 */
export const salaryBasisSchema = z.enum([
  'gross-annual', // Italy: RAL (retribuzione annua lorda)
  'net-annual',
  'gross-monthly',
  'net-monthly',
]);

const salaryBandSchema = z
  .object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
  })
  .refine((b) => b.max >= b.min, {
    message: 'Salary band max must be >= min',
    path: ['max'],
  });

export const salarySchema = z.object({
  currency: z.string().regex(/^[A-Z]{3}$/, 'ISO 4217 code, e.g. "EUR"'),
  basis: salaryBasisSchema,
  entry: salaryBandSchema,
  experienced: salaryBandSchema.optional(),
  senior: salaryBandSchema.optional(),
  /** §10.7: the factors that actually move pay, in plain language. */
  factorsAffectingPay: z.array(prose(10, 300)).min(1).max(8),
});

export type Salary = z.infer<typeof salarySchema>;

// ---------------------------------------------------------------------------
// Pathway and education routes
// ---------------------------------------------------------------------------

/** §10.6: the distinction students most often get wrong. */
export const ROUTE_REQUIREMENT = [
  'legally-required',
  'usually-expected',
  'useful-but-optional',
  'alternative-route',
] as const;

export const routeRequirementSchema = z.enum(ROUTE_REQUIREMENT);

export const pathwayStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  /** e.g. "Upper secondary school", "University", "Selection" */
  stage: prose(3, 60),
  /** e.g. "Ages 14–19" — a stage label a student can locate themselves in. */
  stageLabel: prose(3, 60).optional(),
  title: prose(5, 120),
  description: prose(20, 700),
  requirement: routeRequirementSchema,
  /** e.g. "5 years", "6–18 months" */
  estimatedDuration: prose(2, 40).optional(),
});

export const educationRouteSchema = z.object({
  name: prose(3, 120),
  requirement: routeRequirementSchema,
  description: prose(20, 700),
  notes: prose(5, 400).optional(),
});

// ---------------------------------------------------------------------------
// Country profile
// ---------------------------------------------------------------------------

export const REVIEW_STATUSES = [
  'not-started',
  'in-progress',
  'needs-review',
  'reviewed',
] as const;

export const reviewStatusSchema = z.enum(REVIEW_STATUSES);

export const countryProfileSchema = z.object({
  countryCode: countryCodeSchema,

  /** §10.5 — the numbered route. Ordering is validated, not assumed. */
  pathway: z.array(pathwayStepSchema).min(3).max(12),

  /** §10.6 — routes in, separated by how mandatory they really are. */
  educationRoutes: z.array(educationRouteSchema).min(1).max(8),

  /** §10.7 — never a single misleading average. */
  salary: claim(salarySchema),

  timeToEnter: claim(
    z
      .object({
        minYears: z.number().nonnegative().max(30),
        maxYears: z.number().nonnegative().max(30),
        notes: prose(10, 400),
      })
      .refine((t) => t.maxYears >= t.minYears, {
        message: 'maxYears must be >= minYears',
        path: ['maxYears'],
      }),
  ),

  /** The qualification a student is realistically expected to hold. */
  educationSummary: claim(prose(20, 500)),

  /** Licences, registers, state exams, legal restrictions on the title. */
  regulation: claim(prose(20, 800)),

  /** §10.8 — what competition means in practice, not an invented percentage. */
  competition: claim(
    z.object({
      level: levelSchema,
      whatThisMeans: prose(30, 700),
    }),
  ),

  outlook: claim(prose(20, 600)).optional(),

  /** §10.2 quick facts: where the work physically happens. */
  workEnvironment: z.array(prose(3, 80)).min(1).max(6),

  /** §10.12 — concrete, never framed as mandatory. */
  whatYouCanDoNow: z
    .array(
      z.object({
        action: prose(10, 200),
        why: prose(15, 400),
        /** e.g. "From age 14", "Final two years of school" */
        whenApplicable: prose(3, 60).optional(),
      }),
    )
    .min(3)
    .max(8),

  lastReviewedAt: isoDateSchema,
  reviewStatus: reviewStatusSchema,
});

export type CountryProfile = z.infer<typeof countryProfileSchema>;

// ---------------------------------------------------------------------------
// Career profile
// ---------------------------------------------------------------------------

export const careerProfileSchema = z
  .object({
    slug: slugSchema,
    canonicalName: prose(2, 80),
    category: categorySchema,
    status: contentStatusSchema,

    /** §12.1 — search must work when the student does not know the title. */
    aliases: z
      .array(
        z.object({
          text: z.string().trim().min(2).max(80),
          language: languageCodeSchema,
        }),
      )
      .min(1)
      .max(30),

    /** One sentence, shown in search results and the page header. */
    oneSentence: prose(20, 200),

    /** §10.3 — the "what is this, actually" paragraph. */
    plainLanguageSummary: prose(80, 900),

    whatTheyDo: z.object({
      overview: prose(80, 1200),
      /** Concrete examples beat abstractions for a 15-year-old. */
      concreteExamples: z.array(prose(15, 300)).min(2).max(8),
    }),

    /** §10.4 — explicitly acknowledges variation rather than inventing a norm. */
    typicalDay: z.object({
      overview: prose(60, 900),
      commonTasks: z.array(prose(10, 250)).min(3).max(10),
      howMuchItVaries: prose(30, 600),
    }),

    suitability: z.object({
      suitsYouIf: z.array(prose(10, 250)).min(2).max(8),
      mayNotSuitYouIf: z.array(prose(10, 250)).min(2).max(8),
    }),

    /** §10.9 / §10.10 — balance is checked by validate-content. */
    advantages: z
      .array(z.object({ title: prose(4, 90), detail: prose(20, 500) }))
      .min(3)
      .max(8),
    disadvantages: z
      .array(z.object({ title: prose(4, 90), detail: prose(20, 500) }))
      .min(3)
      .max(8),

    /** §10.11 — belief/reality pairs, the highest-value section in testing. */
    misconceptions: z
      .array(z.object({ belief: prose(10, 300), reality: prose(30, 700) }))
      .min(2)
      .max(6),

    skills: z
      .array(
        z.object({
          name: prose(2, 60),
          importance: levelSchema,
          why: prose(15, 300),
        }),
      )
      .min(3)
      .max(12),

    /** §10.13 — related paths, with the difference spelled out. */
    relatedCareers: z
      .array(
        z.object({
          name: prose(2, 80),
          /** Set once the related career exists in our content set. */
          slug: slugSchema.optional(),
          howItDiffers: prose(20, 400),
        }),
      )
      .min(2)
      .max(8),

    countryProfiles: z.array(countryProfileSchema).min(1),

    sources: z.array(sourceSchema),

    /** Editorial metadata — who last looked at this and what is outstanding. */
    editorial: z.object({
      lastReviewedAt: isoDateSchema,
      /** Free-form; a name, a role, or "unreviewed". */
      reviewedBy: z.string().min(2).max(120),
      openQuestions: z.array(prose(10, 400)).default([]),
    }),
  })
  // -- Cross-field integrity ------------------------------------------------
  .superRefine((career, ctx) => {
    const sourceIds = new Set(career.sources.map((s) => s.id));

    // Duplicate source ids would make `sourceIds` references ambiguous.
    if (sourceIds.size !== career.sources.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['sources'],
        message: 'Source ids must be unique within a career',
      });
    }

    // Every claim must reference sources that actually exist.
    career.countryProfiles.forEach((profile, i) => {
      for (const [field, value] of Object.entries(profile)) {
        if (
          !value ||
          typeof value !== 'object' ||
          !('state' in value) ||
          value.state !== 'verified'
        ) {
          continue;
        }
        const refs = (value as { sourceIds: string[] }).sourceIds;
        for (const ref of refs) {
          if (!sourceIds.has(ref)) {
            ctx.addIssue({
              code: 'custom',
              path: ['countryProfiles', i, field, 'sourceIds'],
              message: `Unknown source id "${ref}". Add it to this career's sources array.`,
            });
          }
        }
      }

      // Pathway steps must be numbered 1..n with no gaps or repeats: the page
      // renders them as an ordered list and a student follows them in order.
      const expected = profile.pathway.map((_, idx) => idx + 1);
      const actual = profile.pathway.map((s) => s.stepNumber);
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        ctx.addIssue({
          code: 'custom',
          path: ['countryProfiles', i, 'pathway'],
          message: `Pathway steps must be numbered consecutively from 1. Got: ${actual.join(', ')}`,
        });
      }
    });

    // Duplicate country profiles would silently shadow each other.
    const countries = career.countryProfiles.map((p) => p.countryCode);
    if (new Set(countries).size !== countries.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['countryProfiles'],
        message: 'Each country may appear at most once per career',
      });
    }

    // Aliases are the search index. Case-insensitive duplicates are dead weight
    // and make "why did this rank here" impossible to reason about.
    const aliasKeys = career.aliases.map(
      (a) => `${a.language}:${a.text.toLowerCase()}`,
    );
    if (new Set(aliasKeys).size !== aliasKeys.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['aliases'],
        message: 'Aliases must be unique per language (case-insensitive)',
      });
    }

    // Salary datasets must disclose their limitations (§14.1 item 7).
    career.sources.forEach((source, i) => {
      if (source.authorityLevel === 'salary-dataset' && !source.limitations) {
        ctx.addIssue({
          code: 'custom',
          path: ['sources', i, 'limitations'],
          message:
            'Salary datasets must disclose limitations before they can be cited',
        });
      }
    });
  });

export type CareerProfile = z.infer<typeof careerProfileSchema>;

/** Shape used by listings and search results — cheap to build, cheap to send. */
export interface CareerSummary {
  slug: string;
  canonicalName: string;
  category: (typeof CATEGORIES)[number];
  oneSentence: string;
  status: (typeof CONTENT_STATUSES)[number];
  timeToEnterLabel: string | null;
  educationLabel: string | null;
  /** null when the salary claim has no value yet (not_researched). */
  salaryEntry: {
    min: number;
    max: number;
    currency: string;
    basis: (typeof salaryBasisSchema)['options'][number];
  } | null;
  /** null when the competition claim has no value yet (not_researched). */
  competitionLevel: (typeof LEVELS)[number] | null;
}
