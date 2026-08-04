import { describe, expect, it } from 'vitest';
import { careerProfileSchema } from '@/lib/content/schema';
import { makeCareer, VERIFIED_CAREER } from '../fixtures/career';

/**
 * These tests exist to prove the schema *rejects* things. A schema that only
 * ever accepts valid input is indistinguishable from no schema at all, and the
 * whole publication-integrity story rests on it catching the cases below.
 */

function issuePaths(result: ReturnType<typeof careerProfileSchema.safeParse>) {
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'));
}

describe('careerProfileSchema', () => {
  it('accepts a well-formed career', () => {
    const result = careerProfileSchema.safeParse(VERIFIED_CAREER);
    expect(result.success).toBe(true);
  });

  it('rejects a slug that is not kebab-case', () => {
    const result = careerProfileSchema.safeParse(
      makeCareer((c) => {
        c.slug = 'Software Engineer';
      }),
    );
    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContain('slug');
  });

  it('rejects a claim citing a source id that does not exist', () => {
    const result = careerProfileSchema.safeParse(
      makeCareer((c) => {
        const salary = c.countryProfiles[0]!.salary;
        if (salary.state === 'verified') salary.sourceIds = ['does-not-exist'];
      }),
    );
    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContain('countryProfiles.0.salary.sourceIds');
  });

  it('rejects a verified claim with no sources at all', () => {
    const result = careerProfileSchema.safeParse(
      makeCareer((c) => {
        const salary = c.countryProfiles[0]!.salary;
        if (salary.state === 'verified') salary.sourceIds = [];
      }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects pathway steps that are not numbered consecutively from 1', () => {
    const result = careerProfileSchema.safeParse(
      makeCareer((c) => {
        c.countryProfiles[0]!.pathway[1]!.stepNumber = 5;
      }),
    );
    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContain('countryProfiles.0.pathway');
  });

  it('rejects a salary band whose max is below its min', () => {
    const result = careerProfileSchema.safeParse(
      makeCareer((c) => {
        const salary = c.countryProfiles[0]!.salary;
        if (salary.state === 'verified') {
          salary.value.entry = { min: 40000, max: 20000 };
        }
      }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects duplicate source ids', () => {
    const result = careerProfileSchema.safeParse(
      makeCareer((c) => {
        c.sources[1]!.id = c.sources[0]!.id;
      }),
    );
    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContain('sources');
  });

  it('rejects duplicate aliases within a language, ignoring case', () => {
    const result = careerProfileSchema.safeParse(
      makeCareer((c) => {
        c.aliases.push({ text: 'Lighthouse Keeper', language: 'en' });
      }),
    );
    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContain('aliases');
  });

  it('allows the same alias text in two different languages', () => {
    const result = careerProfileSchema.safeParse(
      makeCareer((c) => {
        c.aliases.push({ text: 'lighthouse keeper', language: 'it' });
      }),
    );
    expect(result.success).toBe(true);
  });

  it('rejects two profiles for the same country', () => {
    const result = careerProfileSchema.safeParse(
      makeCareer((c) => {
        c.countryProfiles.push(structuredClone(c.countryProfiles[0]!));
      }),
    );
    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContain('countryProfiles');
  });

  it('rejects a salary dataset source that does not disclose its limitations', () => {
    const result = careerProfileSchema.safeParse(
      makeCareer((c) => {
        c.sources[0]!.authorityLevel = 'salary-dataset';
      }),
    );
    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContain('sources.0.limitations');
  });

  it('rejects a non-https source url', () => {
    const result = careerProfileSchema.safeParse(
      makeCareer((c) => {
        c.sources[0]!.url = 'http://example.com/insecure';
      }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects a not_researched claim that does not say what is missing', () => {
    const result = careerProfileSchema.safeParse(
      makeCareer((c) => {
        // Type-valid but useless: an empty note turns "we have not researched
        // this" into a dead end instead of an actionable gap. Only Zod's
        // min-length rule catches it, which is why this case is tested.
        c.countryProfiles[0]!.salary = { state: 'not_researched', note: '' };
      }),
    );
    expect(result.success).toBe(false);
  });
});
