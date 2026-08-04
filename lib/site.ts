/** Single source of truth for site-wide constants used in metadata and copy. */

export const SITE = {
  name: 'Career Economics Lab',
  tagline: 'Risposte chiare e verificabili su come sono davvero i lavori.',
  description:
    'Una guida gratuita e trasparente alle professioni, pensata per chi va a ' +
    'scuola. Che cosa si fa davvero in un lavoro, come ci si arriva, quanto si ' +
    'guadagna, quanto è difficile — con la fonte dietro ogni informazione.',
  /** Falls back to a relative base, which Next handles for metadata. */
  url: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000',
  /**
   * Drives `<html lang>`, date formatting and currency formatting. Content is
   * authored in Italian for the Italian pilot — see docs/DECISIONS.md ADR-0005.
   */
  locale: 'it',
  /** BCP 47 tag for Intl formatting. */
  intlLocale: 'it-IT',
  /** §3: one fully supported country in Phase 1. */
  country: { code: 'IT', name: 'Italia' },
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  'public-service': 'Servizio pubblico e istituzioni',
  healthcare: 'Sanità',
  'law-and-business': 'Diritto ed economia',
  'technology-and-design': 'Tecnologia e design',
  'science-and-engineering': 'Scienze e ingegneria',
  'education-and-communication': 'Istruzione e comunicazione',
};

export const LEVEL_LABELS: Record<string, string> = {
  low: 'Bassa',
  moderate: 'Media',
  high: 'Alta',
  'very-high': 'Molto alta',
};

export const REQUIREMENT_LABELS: Record<string, string> = {
  'legally-required': 'Obbligatorio per legge',
  'usually-expected': 'Di solito richiesto',
  'useful-but-optional': 'Utile ma facoltativo',
  'alternative-route': 'Percorso alternativo',
};

/**
 * §10.6 is the section students most often misread, so the labels carry a
 * plain-language gloss rather than relying on the term alone.
 */
export const REQUIREMENT_EXPLANATIONS: Record<string, string> = {
  'legally-required': 'Senza questo non puoi fare questo lavoro.',
  'usually-expected': 'Non è una regola di legge, ma ce l’hanno quasi tutti.',
  'useful-but-optional': 'Aiuta, ma nessuno viene escluso se non ce l’ha.',
  'alternative-route': 'Un altro modo per arrivarci, altrettanto valido.',
};
