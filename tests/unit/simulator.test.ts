import { describe, expect, it } from 'vitest';
import {
  simulateCareerEconomics,
  type SimulationInput,
} from '@/lib/simulator/calculate';

const BASE: SimulationInput = {
  yearsToQualify: 4,
  entrySalaryMin: 20000,
  entrySalaryMax: 24000,
  location: 'local',
  living: 'at-home',
  hasScholarship: false,
  hasPartTimeWork: false,
};

describe('simulateCareerEconomics', () => {
  it('scales total cost with years to qualify', () => {
    const twoYears = simulateCareerEconomics({ ...BASE, yearsToQualify: 2 });
    const fourYears = simulateCareerEconomics({ ...BASE, yearsToQualify: 4 });
    expect(fourYears.totalCostEUR).toBeGreaterThan(twoYears.totalCostEUR);
  });

  it('renting costs more than staying at home', () => {
    const atHome = simulateCareerEconomics(BASE);
    const renting = simulateCareerEconomics({ ...BASE, living: 'renting' });
    expect(renting.totalCostEUR).toBeGreaterThan(atHome.totalCostEUR);
  });

  it('studying abroad costs more than studying locally', () => {
    const local = simulateCareerEconomics(BASE);
    const abroad = simulateCareerEconomics({ ...BASE, location: 'abroad' });
    expect(abroad.totalCostEUR).toBeGreaterThan(local.totalCostEUR);
  });

  it('a scholarship reduces net cost but not total cost', () => {
    const noScholarship = simulateCareerEconomics(BASE);
    const withScholarship = simulateCareerEconomics({
      ...BASE,
      hasScholarship: true,
      scholarshipAmountEUR: 3000,
    });
    expect(withScholarship.totalCostEUR).toBe(noScholarship.totalCostEUR);
    expect(withScholarship.netCostEUR).toBeLessThan(noScholarship.netCostEUR);
  });

  it('part-time work reduces net cost', () => {
    const withoutWork = simulateCareerEconomics(BASE);
    const withWork = simulateCareerEconomics({
      ...BASE,
      hasPartTimeWork: true,
    });
    expect(withWork.netCostEUR).toBeLessThan(withoutWork.netCostEUR);
  });

  it('never returns a negative net cost, even when offsets exceed the total', () => {
    const result = simulateCareerEconomics({
      ...BASE,
      yearsToQualify: 1,
      hasScholarship: true,
      scholarshipAmountEUR: 999_999,
      hasPartTimeWork: true,
    });
    expect(result.netCostEUR).toBe(0);
  });

  it('computes break-even from net cost over entry salary midpoint', () => {
    const result = simulateCareerEconomics(BASE);
    expect(result.entrySalaryMid).toBe(22000);
    expect(result.breakEvenYears).not.toBeNull();
    expect(result.breakEvenYears).toBeGreaterThan(0);
  });

  it('returns null break-even when entry salary is zero', () => {
    const result = simulateCareerEconomics({
      ...BASE,
      entrySalaryMin: 0,
      entrySalaryMax: 0,
    });
    expect(result.breakEvenYears).toBeNull();
  });
});
