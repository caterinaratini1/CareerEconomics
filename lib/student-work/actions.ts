'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { careerRepository } from '@/lib/content/repository';
import { getSession } from '@/lib/session/session';
import {
  getStudentWork,
  hasReflectionContent,
  setStudentWork,
  type StudentWorkState,
} from './state';

async function requireStudentSession(): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/');
}

async function knownSlug(slug: string): Promise<boolean> {
  return Boolean(await careerRepository.getBySlug(slug));
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function addCareerToComparison(slug: string): Promise<void> {
  await requireStudentSession();
  if (!(await knownSlug(slug))) return;

  const state = await getStudentWork();
  if (!state.comparedSlugs.includes(slug) && state.comparedSlugs.length < 3) {
    state.comparedSlugs.push(slug);
    await setStudentWork(state);
  }
  revalidatePath('/student', 'layout');
}

export async function removeCareerFromComparison(slug: string): Promise<void> {
  await requireStudentSession();
  const state = await getStudentWork();
  state.comparedSlugs = state.comparedSlugs.filter((s) => s !== slug);
  if (state.realisticSlug === slug) state.realisticSlug = null;
  await setStudentWork(state);
  revalidatePath('/student', 'layout');
}

export async function saveComparison(formData: FormData): Promise<void> {
  await requireStudentSession();
  const state = await getStudentWork();
  const realisticSlug = String(formData.get('realisticSlug') ?? '');
  state.realisticSlug = state.comparedSlugs.includes(realisticSlug)
    ? realisticSlug
    : null;
  await setStudentWork(state);
  revalidatePath('/student', 'layout');
}

function reflectionFromForm(
  formData: FormData,
  previous: StudentWorkState,
): StudentWorkState {
  const confidenceRaw = Number(formData.get('confidence'));
  const confidence =
    Number.isInteger(confidenceRaw) && confidenceRaw >= 1 && confidenceRaw <= 5
      ? confidenceRaw
      : null;

  return {
    ...previous,
    reflection: {
      surprised: String(formData.get('surprised') ?? '').trim(),
      realisticPath: String(formData.get('realisticPath') ?? '').trim(),
      hardestTradeoff: String(formData.get('hardestTradeoff') ?? '').trim(),
      nextResearch: String(formData.get('nextResearch') ?? '').trim(),
      confidence,
      savedAt: nowIso(),
      submittedAt: previous.reflection.submittedAt,
    },
  };
}

export async function saveReflectionDraft(formData: FormData): Promise<void> {
  await requireStudentSession();
  const next = reflectionFromForm(formData, await getStudentWork());
  await setStudentWork(next);
  revalidatePath('/student', 'layout');
}

export async function submitReflection(formData: FormData): Promise<void> {
  await requireStudentSession();
  const next = reflectionFromForm(formData, await getStudentWork());
  if (!hasReflectionContent(next.reflection)) {
    redirect('/student/reflection?error=empty');
  }
  next.reflection.submittedAt = nowIso();
  await setStudentWork(next);
  redirect('/student/reflection?submitted=1');
}
