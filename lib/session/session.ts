import { cookies } from 'next/headers';

/**
 * Student session, dev-mode.
 *
 * A plain (unsigned) JSON cookie holding which class the student joined and
 * the nickname they gave. This is deliberately not real auth: there is no
 * password, no identity, and nothing here should be trusted for anything
 * more sensitive than "which class code did this browser last enter" — which
 * is also all `PILOT_GUIDE.md`'s class-code model needs for a student. Phase
 * B (Supabase-backed classes, real teacher auth) replaces this with a signed
 * session; the read/write surface below (`getSession`/`setSession`) is the
 * seam that migration touches.
 */

const COOKIE_NAME = 'cel_session';

export interface StudentSession {
  classCode: string;
  nickname: string;
}

export async function getSession(): Promise<StudentSession | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'classCode' in parsed &&
      'nickname' in parsed &&
      typeof (parsed as StudentSession).classCode === 'string' &&
      typeof (parsed as StudentSession).nickname === 'string'
    ) {
      return parsed as StudentSession;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setSession(session: StudentSession): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // A school day.
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
