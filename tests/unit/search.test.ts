import { describe, expect, it } from 'vitest';
import {
  allowedEditDistance,
  boundedEditDistance,
  normalize,
  tokenize,
} from '@/lib/search/normalize';
import { searchCareers, type SearchableCareer } from '@/lib/search/rank';

/**
 * §12 acceptance criteria, as tests. When Phase 4 ports matching into
 * PostgreSQL, this file is the specification the port has to satisfy.
 */

const CAREERS: SearchableCareer[] = [
  {
    slug: 'diplomat',
    canonicalName: 'Diplomat',
    oneSentence:
      'Represents their country abroad and negotiates with other states.',
    aliases: [
      { text: 'foreign service officer', language: 'en' },
      { text: 'funzionario diplomatico', language: 'it' },
      { text: 'carriera diplomatica', language: 'it' },
    ],
  },
  {
    slug: 'doctor',
    canonicalName: 'Doctor',
    oneSentence: 'Diagnoses and treats illness and injury.',
    aliases: [
      { text: 'physician', language: 'en' },
      { text: 'medico', language: 'it' },
      { text: 'medico chirurgo', language: 'it' },
    ],
  },
  {
    slug: 'software-engineer',
    canonicalName: 'Software engineer',
    oneSentence: 'Designs, builds and maintains software systems.',
    aliases: [
      { text: 'programmer', language: 'en' },
      { text: 'sviluppatore', language: 'it' },
      { text: 'ingegnere informatico', language: 'it' },
    ],
  },
];

const topSlug = (query: string) =>
  searchCareers(CAREERS, query)[0]?.career.slug;

describe('normalize', () => {
  it('lowercases and collapses whitespace', () => {
    expect(normalize('  Software   Engineer ')).toBe('software engineer');
  });

  it('strips Italian diacritics so unaccented typing still matches', () => {
    expect(normalize('psicòlogo')).toBe('psicologo');
    expect(normalize('perità')).toBe('perita');
  });

  it('treats punctuation as a separator', () => {
    expect(normalize('UX/UI designer')).toBe('ux ui designer');
    expect(normalize("l'ingegnere")).toBe('lingegnere');
  });

  it('returns an empty string for input with no letters or digits', () => {
    expect(normalize('   !!!  ')).toBe('');
    expect(tokenize('   !!!  ')).toEqual([]);
  });
});

describe('boundedEditDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(boundedEditDistance('medico', 'medico', 2)).toBe(0);
  });

  it('counts single-character edits', () => {
    expect(boundedEditDistance('medico', 'medicó', 2)).toBe(1);
    expect(boundedEditDistance('doctor', 'doctr', 2)).toBe(1);
  });

  it('counts an adjacent transposition as one edit, not two', () => {
    // The most common typing error. Plain Levenshtein charges 2 here, which
    // put "medcio" outside the one-edit budget a six-letter word gets.
    expect(boundedEditDistance('medcio', 'medico', 2)).toBe(1);
    expect(boundedEditDistance('diplomta', 'diplomat', 2)).toBe(1);
  });

  it('still charges two edits for two unrelated wrong letters', () => {
    expect(boundedEditDistance('mexiro', 'medico', 2)).toBe(2);
  });

  it('gives up once the distance exceeds the bound', () => {
    // The exact value is unspecified past the bound; only "over" matters.
    expect(boundedEditDistance('diplomat', 'engineer', 2)).toBeGreaterThan(2);
  });

  it('handles empty strings', () => {
    expect(boundedEditDistance('', 'abc', 5)).toBe(3);
    expect(boundedEditDistance('abc', '', 5)).toBe(3);
  });
});

describe('allowedEditDistance', () => {
  it('gives short words no tolerance, so "vet" cannot become "net"', () => {
    expect(allowedEditDistance('vet')).toBe(0);
  });

  it('scales tolerance with word length', () => {
    expect(allowedEditDistance('doctor')).toBe(1);
    expect(allowedEditDistance('fisioterapista')).toBe(2);
  });
});

describe('searchCareers', () => {
  it('finds a career by its exact title', () => {
    expect(topSlug('diplomat')).toBe('diplomat');
  });

  it('finds a career by an Italian synonym', () => {
    expect(topSlug('funzionario diplomatico')).toBe('diplomat');
    expect(topSlug('sviluppatore')).toBe('software-engineer');
    expect(topSlug('medico')).toBe('doctor');
  });

  it('tolerates minor misspellings', () => {
    expect(topSlug('diplomta')).toBe('diplomat');
    expect(topSlug('sofware enginer')).toBe('software-engineer');
    expect(topSlug('medcio')).toBe('doctor');
  });

  it('matches on a prefix, so partial typing works', () => {
    expect(topSlug('diplo')).toBe('diplomat');
    expect(topSlug('svilupp')).toBe('software-engineer');
  });

  it('ignores case and accents', () => {
    expect(topSlug('DIPLOMAT')).toBe('diplomat');
    expect(topSlug('mèdico')).toBe('doctor');
  });

  it('ranks an exact title above a description word match', () => {
    // "software" appears in the software engineer title and in no other title.
    const hits = searchCareers(CAREERS, 'software');
    expect(hits[0]?.career.slug).toBe('software-engineer');
    expect(hits[0]?.matchType).toBe('prefix');
  });

  it('reports which alias matched so the UI can explain the result', () => {
    const hits = searchCareers(CAREERS, 'carriera diplomatica');
    expect(hits[0]?.matchedOn).toBe('carriera diplomatica');
  });

  it('returns nothing for an empty or punctuation-only query', () => {
    expect(searchCareers(CAREERS, '')).toEqual([]);
    expect(searchCareers(CAREERS, '   ')).toEqual([]);
    expect(searchCareers(CAREERS, '???')).toEqual([]);
  });

  it('returns nothing for a career we do not have', () => {
    expect(searchCareers(CAREERS, 'astronaut')).toEqual([]);
  });

  it('respects the result limit', () => {
    expect(searchCareers(CAREERS, 'o', 2).length).toBeLessThanOrEqual(2);
  });

  it('never returns the same career twice', () => {
    // Diplomat matches both its title and two aliases; only the best counts.
    const hits = searchCareers(CAREERS, 'diplomat');
    const slugs = hits.map((h) => h.career.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
