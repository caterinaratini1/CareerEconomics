import type { Claim } from './claim';
import {
  OFFICIAL_AUTHORITY_LEVELS,
  type CareerProfile,
  type CountryProfile,
} from './schema';

/**
 * The publication gate.
 *
 * The Zod schema answers "is this well-formed?". This module answers the
 * harder question: "is this good enough to put in front of a fifteen-year-old
 * as fact?". Keeping the two separate matters, because a draft must be allowed
 * to be incomplete — Phase 1 tests the page structure with students long
 * before every source is collected — while `published` must not be.
 *
 * These rules are the machine-checkable half of the §14.3 review checklist.
 * The half that needs a human (is it understandable? is it free of
 * motivational filler?) stays in docs/CONTENT_GUIDE.md.
 */

export interface PublicationIssue {
  severity: 'blocker' | 'warning';
  path: string;
  message: string;
}

/** Claims that must be verified before a country profile can be published. */
const REQUIRED_CLAIMS = [
  'salary',
  'timeToEnter',
  'educationSummary',
  'regulation',
  'competition',
] as const satisfies readonly (keyof CountryProfile)[];

/** §5 success criteria: content older than this is stale enough to flag. */
export const REVIEW_STALE_AFTER_DAYS = 365;

function daysSince(isoDate: string, now: Date): number {
  const then = Date.parse(`${isoDate}T00:00:00Z`);
  return Math.floor((now.getTime() - then) / 86_400_000);
}

function isClaim(value: unknown): value is Claim<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'state' in value &&
    typeof (value as { state: unknown }).state === 'string'
  );
}

/**
 * Returns every reason this career could not be published. An empty blocker
 * list means the automated half of the checklist passes.
 *
 * `now` is injected so the staleness rule is testable and so a build is
 * reproducible for a given date.
 */
export function checkPublishable(
  career: CareerProfile,
  now: Date = new Date(),
): PublicationIssue[] {
  const issues: PublicationIssue[] = [];
  const blocker = (path: string, message: string) =>
    issues.push({ severity: 'blocker', path, message });
  const warn = (path: string, message: string) =>
    issues.push({ severity: 'warning', path, message });

  // §5 acceptance: "every career has at least two credible sources".
  if (career.sources.length < 2) {
    blocker(
      'sources',
      `Needs at least 2 credible sources, found ${career.sources.length}`,
    );
  }

  const sourcesById = new Map(career.sources.map((s) => [s.id, s]));

  career.countryProfiles.forEach((profile, index) => {
    const at = (field: string) =>
      `countryProfiles[${index}:${profile.countryCode}].${field}`;

    for (const field of REQUIRED_CLAIMS) {
      const value = profile[field];
      if (!isClaim(value)) continue;

      if (value.state === 'not_researched') {
        blocker(at(field), `Not researched. Outstanding: ${value.note}`);
        continue;
      }
      if (value.state === 'unverified') {
        blocker(
          at(field),
          `Drafted but unsourced — a student would read this as fact. ${value.note}`,
        );
        continue;
      }

      // Verified: check the evidence is actually usable.
      for (const id of value.sourceIds) {
        const source = sourcesById.get(id);
        if (!source) continue; // schema already reports unknown ids
        const age = daysSince(source.accessedAt, now);
        if (age > REVIEW_STALE_AFTER_DAYS) {
          warn(
            at(field),
            `Source "${id}" was last checked ${age} days ago. Re-open the URL and confirm it still supports this claim.`,
          );
        }
      }
    }

    // §14.1: regulated pathways must rest on official sources, not aggregators.
    const regulation = profile.regulation;
    if (regulation.state === 'verified') {
      const hasOfficial = regulation.sourceIds.some((id) => {
        const level = sourcesById.get(id)?.authorityLevel;
        return (
          level !== undefined &&
          (OFFICIAL_AUTHORITY_LEVELS as readonly string[]).includes(level)
        );
      });
      if (!hasOfficial) {
        blocker(
          at('regulation'),
          'Legal and licensing requirements need at least one official source ' +
            '(government, professional body, or examination authority).',
        );
      }
    }

    // A published pathway that lists no legally-required step is usually an
    // authoring slip rather than a genuinely unregulated career.
    const hasRequiredStep = profile.pathway.some(
      (step) =>
        step.requirement === 'legally-required' ||
        step.requirement === 'usually-expected',
    );
    if (!hasRequiredStep) {
      warn(
        at('pathway'),
        'No step is marked legally-required or usually-expected. Confirm this ' +
          'career genuinely has no gatekeeping step.',
      );
    }

    // §10.6: students most often misread "useful" as "mandatory". A profile
    // that only lists mandatory routes hides the alternatives.
    const hasAlternative = profile.educationRoutes.some(
      (route) =>
        route.requirement === 'alternative-route' ||
        route.requirement === 'useful-but-optional',
    );
    if (!hasAlternative) {
      warn(
        at('educationRoutes'),
        'No alternative or optional route listed. §10.6 asks that alternatives ' +
          'be shown where they exist.',
      );
    }

    if (profile.reviewStatus !== 'reviewed') {
      blocker(
        at('reviewStatus'),
        `A human must review this profile before publication (currently "${profile.reviewStatus}")`,
      );
    }

    const age = daysSince(profile.lastReviewedAt, now);
    if (age > REVIEW_STALE_AFTER_DAYS) {
      warn(
        at('lastReviewedAt'),
        `Last reviewed ${age} days ago — past the ${REVIEW_STALE_AFTER_DAYS}-day refresh window.`,
      );
    }
  });

  // §10.9/§10.10: a page that lists five upsides and three downsides is not
  // balanced, whatever the author intended.
  const ratio = career.advantages.length / career.disadvantages.length;
  if (ratio > 2 || ratio < 0.5) {
    warn(
      'advantages/disadvantages',
      `Unbalanced: ${career.advantages.length} advantages vs ` +
        `${career.disadvantages.length} disadvantages. §6.2 favours evidence over encouragement.`,
    );
  }

  if (career.editorial.openQuestions.length > 0) {
    blocker(
      'editorial.openQuestions',
      `${career.editorial.openQuestions.length} open question(s) must be resolved or removed before publication`,
    );
  }

  return issues;
}

export function isPublishable(
  career: CareerProfile,
  now: Date = new Date(),
): boolean {
  return checkPublishable(career, now).every((i) => i.severity !== 'blocker');
}

/**
 * The strongest evidence state present across a career's country profiles.
 * Drives the honesty banner on the page: a student should be able to tell at a
 * glance whether they are reading verified content or a working draft.
 */
export function evidenceLevel(
  profile: CountryProfile,
): 'verified' | 'partial' | 'unresearched' {
  const claims = REQUIRED_CLAIMS.map((f) => profile[f]).filter(isClaim);
  const verified = claims.filter((c) => c.state === 'verified').length;
  if (verified === claims.length) return 'verified';
  // Not `claims.some(hasValue)`: the claims here hold different value types, so
  // passing a generic type guard as a callback cannot unify across the union.
  if (claims.some((c) => c.state !== 'not_researched')) return 'partial';
  return 'unresearched';
}
