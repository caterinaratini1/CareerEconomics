/**
 * Simulator scenario assumptions.
 *
 * These are NOT per-career claims — they carry no source and must never be
 * rendered as if they were researched facts about a specific career (see
 * `lib/content/claim.ts` and `docs/DECISIONS.md` ADR-0003/ADR-0004 for why
 * that distinction is load-bearing for this product). They are a single,
 * reusable, Italy-wide set of illustrative cost/living figures the student
 * can adjust through the simulator controls, in the same spirit as a
 * mortgage calculator's default interest rate: a starting assumption, not an
 * assertion. The UI must always label simulator output as an estimate.
 *
 * TODO(sourcing): replace with figures backed by MUR/ISTAT publications
 * before this ever ships to real students outside a supervised pilot.
 */

export type StudyLocation = 'local' | 'elsewhere-in-italy' | 'abroad';
export type LivingSituation = 'at-home' | 'renting';

export const TUITION_LOCAL_ANNUAL_EUR = 1600;

export const LOCATION_COST_MULTIPLIER: Record<StudyLocation, number> = {
  local: 1,
  'elsewhere-in-italy': 1.15,
  abroad: 1.6,
};

export const LIVING_COST_ANNUAL_EUR: Record<LivingSituation, number> = {
  'at-home': 1800,
  renting: 8400,
};

export const DEFAULT_SCHOLARSHIP_ANNUAL_EUR = 3000;

export const PART_TIME_ANNUAL_INCOME_EUR = 2400;
