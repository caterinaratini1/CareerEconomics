import { describe, expect, it } from 'vitest';
import {
  MAX_READING_MINUTES,
  estimateReading,
} from '@/lib/content/reading-time';
import {
  DEFAULT_COUNTRY,
  loadAllCareers,
  profileForCountry,
  toSummary,
} from '@/lib/content/repository';
import { careerProfileSchema } from '@/lib/content/schema';

/**
 * Tests against the real shipped content, not fixtures.
 *
 * These are the checks that catch an author breaking a rule in a JSON file —
 * the most likely source of a defect in this codebase, since content changes
 * far more often than code does.
 */

const careers = loadAllCareers();

describe('shipped career content', () => {
  it('loads and validates every registered career', () => {
    expect(careers.length).toBeGreaterThan(0);
    for (const career of careers) {
      expect(careerProfileSchema.safeParse(career).success).toBe(true);
    }
  });

  it('has a unique slug for every career', () => {
    const slugs = careers.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('covers the initial target country for every career', () => {
    for (const career of careers) {
      expect(profileForCountry(career, DEFAULT_COUNTRY)).not.toBeNull();
    }
  });

  it('keeps every core reading path within the ten-minute budget', () => {
    for (const career of careers) {
      const { coreMinutes } = estimateReading(career, DEFAULT_COUNTRY);
      expect(
        coreMinutes,
        `${career.slug} core path is ${coreMinutes} minutes`,
      ).toBeLessThanOrEqual(MAX_READING_MINUTES);
    }
  });

  it('carries at least one Italian alias per career, since the market is Italy', () => {
    for (const career of careers) {
      const italian = career.aliases.filter((a) => a.language === 'it');
      expect(
        italian.length,
        `${career.slug} has no Italian alias`,
      ).toBeGreaterThan(0);
    }
  });

  it('never publishes a career whose figures are unsourced', () => {
    // The guarantee the whole content layer exists to provide.
    for (const career of careers) {
      if (career.status !== 'published') continue;
      for (const profile of career.countryProfiles) {
        expect(profile.salary.state, `${career.slug} salary`).toBe('verified');
        expect(profile.regulation.state, `${career.slug} regulation`).toBe(
          'verified',
        );
      }
    }
  });

  it('states what is missing wherever a claim is not verified', () => {
    for (const career of careers) {
      for (const profile of career.countryProfiles) {
        for (const claim of [
          profile.salary,
          profile.timeToEnter,
          profile.educationSummary,
          profile.regulation,
          profile.competition,
        ]) {
          if (claim.state === 'verified') continue;
          expect(
            claim.note.length,
            `${career.slug} claim note`,
          ).toBeGreaterThan(20);
        }
      }
    }
  });
});

describe('toSummary', () => {
  it('derives a listing summary from the full profile', () => {
    const career = careers[0]!;
    const summary = toSummary(career, DEFAULT_COUNTRY);
    expect(summary.slug).toBe(career.slug);
    expect(summary.canonicalName).toBe(career.canonicalName);
    expect(summary.oneSentence).toBe(career.oneSentence);
  });

  it('returns a null time-to-enter label rather than inventing one', () => {
    const career = careers.find(
      (c) =>
        profileForCountry(c, DEFAULT_COUNTRY)?.timeToEnter.state ===
        'not_researched',
    );
    if (!career) return; // no such career currently; nothing to assert
    expect(toSummary(career, DEFAULT_COUNTRY).timeToEnterLabel).toBeNull();
  });

  it('returns null for a country we do not cover', () => {
    const summary = toSummary(careers[0]!, 'ZZ');
    expect(summary.timeToEnterLabel).toBeNull();
    expect(summary.educationLabel).toBeNull();
  });
});
