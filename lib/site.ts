/** Single source of truth for site-wide constants used in metadata and copy. */

export const SITE = {
  name: 'Career Economics Lab',
  tagline: 'Clear, sourced answers about what a career actually involves.',
  description:
    'A free, transparent career guide for students. What a job really involves, ' +
    'how you get into it, what it pays, how competitive it is — with the sources ' +
    'behind every claim.',
  /** Falls back to a relative base, which Next handles for metadata. */
  url: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000',
  locale: 'en',
  /** §3: one fully supported country in Phase 1. */
  country: { code: 'IT', name: 'Italy' },
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  'public-service': 'Public service and institutions',
  healthcare: 'Healthcare',
  'law-and-business': 'Law and business',
  'technology-and-design': 'Technology and design',
  'science-and-engineering': 'Science and engineering',
  'education-and-communication': 'Education and communication',
};

export const LEVEL_LABELS: Record<string, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  'very-high': 'Very high',
};

export const REQUIREMENT_LABELS: Record<string, string> = {
  'legally-required': 'Legally required',
  'usually-expected': 'Usually expected',
  'useful-but-optional': 'Useful but optional',
  'alternative-route': 'Alternative route',
};

/**
 * §10.6 is the section students most often misread, so the labels carry a
 * plain-language gloss rather than relying on the term alone.
 */
export const REQUIREMENT_EXPLANATIONS: Record<string, string> = {
  'legally-required': 'You cannot do this job without it.',
  'usually-expected': 'Not a legal rule, but almost everyone has it.',
  'useful-but-optional': 'Helps, but nobody is turned away for lacking it.',
  'alternative-route': 'A different way in that also works.',
};
