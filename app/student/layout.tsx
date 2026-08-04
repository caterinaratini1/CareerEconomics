import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { clearSession, getSession } from '@/lib/session/session';

/**
 * Guards every /student/* route: no session cookie means the student never
 * joined a class, so they're sent back to the join screen (app/page.tsx)
 * rather than seeing an empty dashboard.
 */
export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/');

  async function leaveClass(): Promise<void> {
    'use server';
    await clearSession();
    redirect('/');
  }

  return (
    <div>
      <div className="border-border bg-surface-muted border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2 text-sm">
          <span className="text-ink-muted">
            Ciao,{' '}
            <span className="text-ink font-medium">{session.nickname}</span> ·
            Classe {session.classCode}
          </span>
          <form action={leaveClass}>
            <button
              type="submit"
              className="text-ink-muted hover:text-ink underline-offset-4 hover:underline"
            >
              Esci
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
