import { describe, expect, it } from 'vitest';
import {
  checkPublishable,
  evidenceLevel,
  isPublishable,
} from '@/lib/content/publication';
import { makeCareer, VERIFIED_CAREER } from '../fixtures/career';

/**
 * The publication gate is the single mechanism standing between a plausible
 * unsourced number and a fifteen-year-old reading it as fact. Each test below
 * corresponds to a way that could happen.
 *
 * `now` is pinned so the staleness rules are deterministic.
 */
const NOW = new Date('2026-08-04T00:00:00Z');

const blockers = (career: Parameters<typeof checkPublishable>[0]) =>
  checkPublishable(career, NOW).filter((i) => i.severity === 'blocker');

describe('checkPublishable', () => {
  it('passes a fully verified, reviewed career', () => {
    expect(blockers(VERIFIED_CAREER)).toEqual([]);
    expect(isPublishable(VERIFIED_CAREER, NOW)).toBe(true);
  });

  it('blocks publication when a required claim was never researched', () => {
    const career = makeCareer((c) => {
      c.countryProfiles[0]!.salary = {
        state: 'not_researched',
        note: 'Awaiting the official pay tables.',
      };
    });
    expect(isPublishable(career, NOW)).toBe(false);
    expect(blockers(career).some((i) => i.path.includes('salary'))).toBe(true);
  });

  it('blocks publication when a claim has a value but no source', () => {
    // The most dangerous state: it renders as a real number, so nothing about
    // the page looks wrong to a reviewer skimming it.
    const career = makeCareer((c) => {
      c.countryProfiles[0]!.educationSummary = {
        state: 'unverified',
        value: 'A technical maintenance qualification.',
        note: 'Needs the authority page.',
      };
    });
    expect(isPublishable(career, NOW)).toBe(false);
  });

  it('blocks publication with fewer than two sources', () => {
    const career = makeCareer((c) => {
      c.sources = [c.sources[0]!];
      c.countryProfiles[0]!.competition = {
        state: 'verified',
        value:
          c.countryProfiles[0]!.competition.state !== 'not_researched'
            ? c.countryProfiles[0]!.competition.value
            : { level: 'high', whatThisMeans: 'x'.repeat(40) },
        sourceIds: ['example-authority'],
        verifiedAt: '2026-07-01',
      };
    });
    expect(blockers(career).some((i) => i.path === 'sources')).toBe(true);
  });

  it('blocks publication when a human has not reviewed the profile', () => {
    const career = makeCareer((c) => {
      c.countryProfiles[0]!.reviewStatus = 'needs-review';
    });
    expect(isPublishable(career, NOW)).toBe(false);
    expect(blockers(career).some((i) => i.path.includes('reviewStatus'))).toBe(
      true,
    );
  });

  it('blocks publication while open research questions remain', () => {
    const career = makeCareer((c) => {
      c.editorial.openQuestions = ['Confirm the current pay scale.'];
    });
    expect(isPublishable(career, NOW)).toBe(false);
  });

  it('requires an official source specifically for legal and licensing claims', () => {
    // A statistics office is a credible source, but not for what the law says.
    const career = makeCareer((c) => {
      const regulation = c.countryProfiles[0]!.regulation;
      if (regulation.state === 'verified') {
        regulation.sourceIds = ['example-statistics'];
      }
    });
    expect(isPublishable(career, NOW)).toBe(false);
    expect(blockers(career).some((i) => i.path.includes('regulation'))).toBe(
      true,
    );
  });

  it('warns, but does not block, when a source has gone stale', () => {
    const career = makeCareer((c) => {
      c.sources[0]!.accessedAt = '2024-01-01';
    });
    const issues = checkPublishable(career, NOW);
    expect(issues.some((i) => i.severity === 'warning')).toBe(true);
    expect(isPublishable(career, NOW)).toBe(true);
  });

  it('warns when advantages and disadvantages are badly unbalanced', () => {
    const career = makeCareer((c) => {
      c.disadvantages = [c.disadvantages[0]!];
    });
    const issues = checkPublishable(career, NOW);
    expect(issues.some((i) => i.path === 'advantages/disadvantages')).toBe(
      true,
    );
  });
});

describe('evidenceLevel', () => {
  it('reports verified when every required claim is sourced', () => {
    expect(evidenceLevel(VERIFIED_CAREER.countryProfiles[0]!)).toBe('verified');
  });

  it('reports partial when some claims are drafted but unsourced', () => {
    const career = makeCareer((c) => {
      c.countryProfiles[0]!.salary = {
        state: 'unverified',
        value: {
          currency: 'EUR',
          basis: 'gross-annual',
          entry: { min: 1, max: 2 },
          factorsAffectingPay: ['x'],
        },
        note: 'unsourced',
      };
    });
    expect(evidenceLevel(career.countryProfiles[0]!)).toBe('partial');
  });

  it('reports unresearched when nothing has a value', () => {
    const career = makeCareer((c) => {
      const profile = c.countryProfiles[0]!;
      const gap = { state: 'not_researched', note: 'todo' } as const;
      profile.salary = gap;
      profile.timeToEnter = gap;
      profile.educationSummary = gap;
      profile.regulation = gap;
      profile.competition = gap;
    });
    expect(evidenceLevel(career.countryProfiles[0]!)).toBe('unresearched');
  });
});
