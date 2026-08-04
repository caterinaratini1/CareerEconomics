import { searchCareers, type SearchHit } from '@/lib/search/rank';
import { hasValue } from './claim';
import { CAREER_RECORDS } from './registry';
import {
  careerProfileSchema,
  type CareerProfile,
  type CareerSummary,
  type CountryProfile,
} from './schema';

/**
 * The content repository.
 *
 * Everything above this line (pages, components) talks to `CareerRepository`.
 * Everything below it is swappable. Phase 1 reads version-controlled JSON;
 * Phase 2 introduces Supabase. That migration should touch this file and
 * nothing else — which is the whole reason the interface exists before there
 * is a second implementation to justify it.
 *
 * The methods are async even though the file-backed implementation is
 * synchronous. Retrofitting `await` across a component tree later is exactly
 * the kind of avoidable churn a Phase-2 migration does not need.
 */

export const DEFAULT_COUNTRY = 'IT';

export interface ListOptions {
  /** ISO 3166-1 alpha-2. Careers without a profile for it are excluded. */
  countryCode?: string;
  category?: string;
}

export interface CareerRepository {
  listSummaries(options?: ListOptions): Promise<CareerSummary[]>;
  listSlugs(): Promise<string[]>;
  getBySlug(slug: string): Promise<CareerProfile | null>;
  search(query: string, limit?: number): Promise<SearchHit<CareerSummary>[]>;
}

// ---------------------------------------------------------------------------
// Visibility
// ---------------------------------------------------------------------------

/**
 * Which content states the site will render.
 *
 * `published` is the only state a public visitor may ever see (§9.2). But
 * Phase 1's entire deliverable is testing draft pages with real teachers and
 * students, so there has to be a way to see drafts — and it has to be one
 * nobody can enable by accident.
 *
 * Hence: preview is on by default in development, and in production requires
 * an explicit `NEXT_PUBLIC_CONTENT_PREVIEW=true`. Pages rendered in preview
 * mode carry a non-dismissible banner (see components/career/EvidenceBanner).
 */
export function isPreviewMode(): boolean {
  const flag = process.env['NEXT_PUBLIC_CONTENT_PREVIEW'];
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return process.env.NODE_ENV === 'development';
}

function isVisible(career: CareerProfile): boolean {
  if (career.status === 'published') return true;
  if (career.status === 'archived') return false;
  return isPreviewMode();
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Content is validated once, at module load, and the result is cached.
 *
 * Parsing on every request would be wasted work on statically generated pages,
 * but the more important property is *when* a bad record surfaces: a schema
 * violation throws while the module graph is being built, so `next build`
 * fails loudly instead of shipping a career page with a missing salary.
 */
let cache: CareerProfile[] | null = null;

export class ContentValidationError extends Error {
  constructor(
    readonly slug: string,
    readonly issues: string[],
  ) {
    super(
      `Invalid career content in "${slug}":\n` +
        issues.map((i) => `  - ${i}`).join('\n'),
    );
    this.name = 'ContentValidationError';
  }
}

export function loadAllCareers(): CareerProfile[] {
  if (cache) return cache;

  const parsed = CAREER_RECORDS.map((record) => {
    const result = careerProfileSchema.safeParse(record);
    if (!result.success) {
      const slug =
        typeof (record as { slug?: unknown }).slug === 'string'
          ? (record as { slug: string }).slug
          : '<unknown slug>';
      throw new ContentValidationError(
        slug,
        result.error.issues.map(
          (issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`,
        ),
      );
    }
    return result.data;
  });

  const slugs = new Set<string>();
  for (const career of parsed) {
    if (slugs.has(career.slug)) {
      throw new ContentValidationError(career.slug, [
        'Duplicate slug: two files declare the same career',
      ]);
    }
    slugs.add(career.slug);
  }

  cache = parsed;
  return cache;
}

/** Test seam — content is cached for the process lifetime otherwise. */
export function resetContentCache(): void {
  cache = null;
}

// ---------------------------------------------------------------------------
// Projections
// ---------------------------------------------------------------------------

export function profileForCountry(
  career: CareerProfile,
  countryCode: string = DEFAULT_COUNTRY,
): CountryProfile | null {
  return (
    career.countryProfiles.find((p) => p.countryCode === countryCode) ?? null
  );
}

function timeToEnterLabel(profile: CountryProfile | null): string | null {
  if (!profile || !hasValue(profile.timeToEnter)) return null;
  const { minYears, maxYears } = profile.timeToEnter.value;
  const format = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1));
  return minYears === maxYears
    ? `${format(minYears)} years`
    : `${format(minYears)}–${format(maxYears)} years`;
}

function educationLabel(profile: CountryProfile | null): string | null {
  if (!profile) return null;
  const required = profile.educationRoutes.find(
    (route) => route.requirement === 'legally-required',
  );
  return (required ?? profile.educationRoutes[0])?.name ?? null;
}

export function toSummary(
  career: CareerProfile,
  countryCode: string = DEFAULT_COUNTRY,
): CareerSummary {
  const profile = profileForCountry(career, countryCode);
  return {
    slug: career.slug,
    canonicalName: career.canonicalName,
    category: career.category,
    oneSentence: career.oneSentence,
    status: career.status,
    timeToEnterLabel: timeToEnterLabel(profile),
    educationLabel: educationLabel(profile),
  };
}

// ---------------------------------------------------------------------------
// File-backed implementation (Phase 1)
// ---------------------------------------------------------------------------

class FileCareerRepository implements CareerRepository {
  private visible(options?: ListOptions): CareerProfile[] {
    const country = options?.countryCode ?? DEFAULT_COUNTRY;
    return loadAllCareers()
      .filter(isVisible)
      .filter((career) => profileForCountry(career, country) !== null)
      .filter(
        (career) => !options?.category || career.category === options.category,
      );
  }

  async listSummaries(options?: ListOptions): Promise<CareerSummary[]> {
    const country = options?.countryCode ?? DEFAULT_COUNTRY;
    return this.visible(options)
      .map((career) => toSummary(career, country))
      .sort((a, b) => a.canonicalName.localeCompare(b.canonicalName, 'it'));
  }

  async listSlugs(): Promise<string[]> {
    return this.visible().map((career) => career.slug);
  }

  async getBySlug(slug: string): Promise<CareerProfile | null> {
    const career = loadAllCareers().find((c) => c.slug === slug);
    if (!career || !isVisible(career)) return null;
    return career;
  }

  async search(query: string, limit = 20): Promise<SearchHit<CareerSummary>[]> {
    // Aliases are the search index but are not part of the result payload, so
    // they are attached here and dropped by the `CareerSummary` return type.
    const searchable = this.visible().map((career) => ({
      ...toSummary(career),
      aliases: career.aliases,
    }));
    return searchCareers(searchable, query, limit);
  }
}

export const careerRepository: CareerRepository = new FileCareerRepository();
