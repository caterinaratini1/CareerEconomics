import { cookies } from 'next/headers';

const COOKIE_NAME = 'cel_student_work';
const MAX_COMPARE = 3;
const MAX_TEXT_LENGTH = 800;

export interface ReflectionDraft {
  surprised: string;
  realisticPath: string;
  hardestTradeoff: string;
  nextResearch: string;
  confidence: number | null;
  savedAt: string | null;
  submittedAt: string | null;
}

export interface StudentWorkState {
  comparedSlugs: string[];
  realisticSlug: string | null;
  reflection: ReflectionDraft;
}

const EMPTY_REFLECTION: ReflectionDraft = {
  surprised: '',
  realisticPath: '',
  hardestTradeoff: '',
  nextResearch: '',
  confidence: null,
  savedAt: null,
  submittedAt: null,
};

export const EMPTY_STUDENT_WORK: StudentWorkState = {
  comparedSlugs: [],
  realisticSlug: null,
  reflection: EMPTY_REFLECTION,
};

function cleanText(value: unknown): string {
  return typeof value === 'string'
    ? value.trim().slice(0, MAX_TEXT_LENGTH)
    : '';
}

function cleanConfidence(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null;
  return value >= 1 && value <= 5 ? value : null;
}

function cleanSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const item of value) {
    if (
      typeof item === 'string' &&
      /^[a-z0-9]+(-[a-z0-9]+)*$/.test(item) &&
      !seen.has(item)
    ) {
      seen.add(item);
    }
    if (seen.size === MAX_COMPARE) break;
  }
  return [...seen];
}

export function normalizeStudentWork(raw: unknown): StudentWorkState {
  if (typeof raw !== 'object' || raw === null) return EMPTY_STUDENT_WORK;

  const record = raw as Record<string, unknown>;
  const comparedSlugs = cleanSlugs(record['comparedSlugs']);
  const realisticSlug =
    typeof record['realisticSlug'] === 'string' &&
    comparedSlugs.includes(record['realisticSlug'])
      ? record['realisticSlug']
      : null;

  const rawReflection =
    typeof record['reflection'] === 'object' && record['reflection'] !== null
      ? (record['reflection'] as Record<string, unknown>)
      : {};

  const savedAt =
    typeof rawReflection['savedAt'] === 'string'
      ? rawReflection['savedAt']
      : null;
  const submittedAt =
    typeof rawReflection['submittedAt'] === 'string'
      ? rawReflection['submittedAt']
      : null;

  return {
    comparedSlugs,
    realisticSlug,
    reflection: {
      surprised: cleanText(rawReflection['surprised']),
      realisticPath: cleanText(rawReflection['realisticPath']),
      hardestTradeoff: cleanText(rawReflection['hardestTradeoff']),
      nextResearch: cleanText(rawReflection['nextResearch']),
      confidence: cleanConfidence(rawReflection['confidence']),
      savedAt,
      submittedAt,
    },
  };
}

export async function getStudentWork(): Promise<StudentWorkState> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return EMPTY_STUDENT_WORK;

  try {
    return normalizeStudentWork(JSON.parse(raw));
  } catch {
    return EMPTY_STUDENT_WORK;
  }
}

export async function setStudentWork(state: StudentWorkState): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(normalizeStudentWork(state)), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export function hasReflectionContent(reflection: ReflectionDraft): boolean {
  return Boolean(
    reflection.surprised ||
    reflection.realisticPath ||
    reflection.hardestTradeoff ||
    reflection.nextResearch ||
    reflection.confidence,
  );
}

export function hasSubmittedReflection(state: StudentWorkState): boolean {
  return Boolean(state.reflection.submittedAt);
}

export function hasSavedComparison(state: StudentWorkState): boolean {
  return state.comparedSlugs.length >= 2 && Boolean(state.realisticSlug);
}

export { MAX_COMPARE };
