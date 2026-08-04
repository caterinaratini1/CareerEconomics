'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { classRepository } from './repository';

export async function createClass(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  const school = String(formData.get('school') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();

  if (!name) {
    redirect('/teacher?error=missing-class-name');
  }

  const record = await classRepository.createClass({ name, school, notes });
  revalidatePath('/teacher');
  redirect(`/teacher?created=${record.code}`);
}
