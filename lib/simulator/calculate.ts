import {
  DEFAULT_SCHOLARSHIP_ANNUAL_EUR,
  LIVING_COST_ANNUAL_EUR,
  LOCATION_COST_MULTIPLIER,
  PART_TIME_ANNUAL_INCOME_EUR,
  TUITION_LOCAL_ANNUAL_EUR,
  type LivingSituation,
  type StudyLocation,
} from './assumptions';

/**
 * Pure simulation math — no I/O, no framework imports, so it can be unit
 * tested directly (mirrors the convention in `lib/search/rank.ts`) and
 * called from the client-side simulator component without pulling in server
 * code.
 */

export interface SimulationInput {
  /** From the career's `timeToEnter` claim. */
  yearsToQualify: number;
  /** From the career's `salary` claim, entry band. Whatever basis it was
   *  recorded in — this does not attempt gross/net conversion, which would
   *  introduce exactly the kind of false precision this product avoids. */
  entrySalaryMin: number;
  entrySalaryMax: number;

  location: StudyLocation;
  living: LivingSituation;
  hasScholarship: boolean;
  /** Overrides `DEFAULT_SCHOLARSHIP_ANNUAL_EUR` when the student knows a
   *  specific figure (e.g. their region's actual grant amount). */
  scholarshipAmountEUR?: number | undefined;
  hasPartTimeWork: boolean;
}

export interface SimulationResult {
  totalCostEUR: number;
  netCostEUR: number;
  entrySalaryMid: number;
  breakEvenYears: number | null;
}

function round(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

export function simulateCareerEconomics(
  input: SimulationInput,
): SimulationResult {
  const annualTuition =
    TUITION_LOCAL_ANNUAL_EUR * LOCATION_COST_MULTIPLIER[input.location];
  const annualLiving = LIVING_COST_ANNUAL_EUR[input.living];
  const totalCostEUR = round(
    (annualTuition + annualLiving) * Math.max(input.yearsToQualify, 0),
    100,
  );

  const scholarship = input.hasScholarship
    ? (input.scholarshipAmountEUR ?? DEFAULT_SCHOLARSHIP_ANNUAL_EUR) *
      input.yearsToQualify
    : 0;
  const partTimeIncome = input.hasPartTimeWork
    ? PART_TIME_ANNUAL_INCOME_EUR * input.yearsToQualify
    : 0;

  const netCostEUR = Math.max(
    round(totalCostEUR - scholarship - partTimeIncome, 100),
    0,
  );

  const entrySalaryMid = round(
    (input.entrySalaryMin + input.entrySalaryMax) / 2,
    100,
  );

  const breakEvenYears =
    entrySalaryMid > 0
      ? Math.round((netCostEUR / entrySalaryMid) * 10) / 10
      : null;

  return { totalCostEUR, netCostEUR, entrySalaryMid, breakEvenYears };
}
