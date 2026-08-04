import type { CareerProfile, CountryProfile } from './schema';

/**
 * Reading-time estimation.
 *
 * §10 sets a hard product constraint — a student should understand a career in
 * under ten minutes — and §4 makes "the page takes under ten minutes to read"
 * an acceptance criterion. A constraint nobody measures is a constraint that
 * erodes: each addition is individually reasonable and the page ends up at
 * twenty minutes.
 *
 * The first draft of all three careers measured 15–16 minutes end to end. The
 * wrong fix is to delete content until the number goes down; the material is
 * there because students need it. The right fix is that a career page is not
 * one linear document. It has a **core path** — what is this, how do you get
 * in, what does it cost you, what do I do now — which must fit inside ten
 * minutes, and a set of **secondary sections** which a student opens only if
 * they are still interested.
 *
 * So this module measures both, and the validation gate enforces the budget on
 * the core path only. The page's disclosure structure (native `<details>` for
 * secondary sections — see components/career/) has to stay in step with the
 * partition below, or the number stops describing the page.
 *
 * 180 words per minute is deliberately below adult silent-reading averages.
 * The audience is 14–19, the material is unfamiliar, and several sections are
 * dense with conditions and caveats that people re-read.
 */
export const WORDS_PER_MINUTE = 180;
export const MAX_READING_MINUTES = 10;

/**
 * Career-level fields a student reads before deciding whether to continue.
 * Kept as an explicit list so that adding a field to the schema forces a
 * decision about where it belongs rather than defaulting into the budget.
 */
const CORE_CAREER_FIELDS = [
  'canonicalName',
  'oneSentence',
  'plainLanguageSummary',
  'whatTheyDo',
  'typicalDay',
  'misconceptions',
] as const satisfies readonly (keyof CareerProfile)[];

/** Rendered inside `<details>`: read on demand, not on the critical path. */
const SECONDARY_CAREER_FIELDS = [
  'suitability',
  'skills',
  'relatedCareers',
] as const satisfies readonly (keyof CareerProfile)[];

/**
 * Advantages and disadvantages are split mid-field rather than assigned whole.
 *
 * Both belong on the core path — §6.2 puts honest trade-offs ahead of
 * encouragement, and burying the downsides behind a click would be exactly the
 * wrong product. But the *titles* alone already carry the trade-off, and they
 * scan in seconds; the supporting detail is what a student reads only for the
 * two or three that land. So the page shows every headline and expands the
 * detail, and the budget counts it the same way.
 */
function splitProsAndCons(career: CareerProfile): {
  core: number;
  secondary: number;
} {
  const entries = [...career.advantages, ...career.disadvantages];
  return {
    core: entries.reduce((sum, e) => sum + countWords(e.title), 0),
    secondary: entries.reduce((sum, e) => sum + countWords(e.detail), 0),
  };
}

const CORE_PROFILE_FIELDS = [
  'pathway',
  'salary',
  'timeToEnter',
  'educationSummary',
  'regulation',
  'competition',
  'workEnvironment',
  'whatYouCanDoNow',
] as const satisfies readonly (keyof CountryProfile)[];

const SECONDARY_PROFILE_FIELDS = [
  'educationRoutes',
  'outlook',
] as const satisfies readonly (keyof CountryProfile)[];

/**
 * Keys holding researcher-facing apparatus rather than prose a student reads.
 * `note` in particular carries the "what still needs sourcing" text, which
 * would otherwise make a well-documented draft look like an overlong page.
 */
const APPARATUS_KEYS = new Set([
  'note',
  'sourceIds',
  'verifiedAt',
  'state',
  'requirement',
  'importance',
  'slug',
  'countryCode',
  'lastReviewedAt',
  'reviewStatus',
  'stepNumber',
]);

function countWords(value: unknown, seen = new WeakSet<object>()): number {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  }
  if (typeof value !== 'object' || value === null) return 0;

  // Content is a tree, not a graph, but guarding costs nothing and a cycle
  // here would hang the build rather than fail it.
  if (seen.has(value)) return 0;
  seen.add(value);

  if (Array.isArray(value)) {
    return value.reduce<number>((sum, item) => sum + countWords(item, seen), 0);
  }

  return Object.entries(value).reduce<number>(
    (sum, [key, item]) =>
      APPARATUS_KEYS.has(key) ? sum : sum + countWords(item, seen),
    0,
  );
}

function pick<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): number {
  return keys.reduce((sum, key) => sum + countWords(source[key]), 0);
}

export interface ReadingEstimate {
  /** Minutes to read the core path — the figure the §4 criterion applies to. */
  coreMinutes: number;
  /** Minutes to read everything, including sections behind disclosure. */
  fullMinutes: number;
  coreWords: number;
  fullWords: number;
}

export function estimateReading(
  career: CareerProfile,
  countryCode = 'IT',
): ReadingEstimate {
  const profile = career.countryProfiles.find(
    (p) => p.countryCode === countryCode,
  );

  const prosAndCons = splitProsAndCons(career);

  const coreWords =
    pick(career, CORE_CAREER_FIELDS) +
    prosAndCons.core +
    (profile ? pick(profile, CORE_PROFILE_FIELDS) : 0);

  const secondaryWords =
    pick(career, SECONDARY_CAREER_FIELDS) +
    prosAndCons.secondary +
    (profile ? pick(profile, SECONDARY_PROFILE_FIELDS) : 0);

  const fullWords = coreWords + secondaryWords;

  return {
    coreMinutes: Math.ceil(coreWords / WORDS_PER_MINUTE),
    fullMinutes: Math.ceil(fullWords / WORDS_PER_MINUTE),
    coreWords,
    fullWords,
  };
}

/** Convenience for the page header, which shows the core-path figure. */
export function estimateReadingMinutes(
  career: CareerProfile,
  countryCode = 'IT',
): number {
  return estimateReading(career, countryCode).coreMinutes;
}
