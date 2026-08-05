import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CircleHelp, Search } from 'lucide-react';
import { StudentSidebarNav } from '@/components/student/StudentSidebarNav';
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
    <div className="student-workspace">
      <aside className="student-sidebar">
        <div className="student-sidebar-inner">
          <Link href="/student" className="student-brand">
            <span className="student-brand-mark" aria-hidden="true">
              CE
            </span>
            <span>
              <span className="student-brand-title">Career Economics Lab</span>
              <span className="student-brand-subtitle">
                Orientamento informato
              </span>
            </span>
          </Link>

          <StudentSidebarNav />

          <div className="student-profile">
            <p className="text-ink-muted text-xs">Studente</p>
            <p className="mt-0.5 text-sm font-semibold">{session.nickname}</p>
            <p className="text-ink-muted text-xs">Classe {session.classCode}</p>
            <form action={leaveClass} className="mt-3">
              <button type="submit" className="student-leave-button">
                Esci dalla classe
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="student-workspace-main">
        <div className="student-utility-bar">
          <form
            action="/student/careers"
            method="get"
            role="search"
            className="student-global-search"
          >
            <label htmlFor="student-global-search" className="sr-only">
              Cerca una professione
            </label>
            <Search
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
              strokeWidth={2}
            />
            <input
              id="student-global-search"
              name="q"
              type="search"
              autoComplete="off"
              placeholder="Cerca una professione o un settore…"
            />
          </form>
          <div className="student-utility-actions">
            <Link
              href="/about"
              className="student-utility-link"
              aria-label="Come funziona Career Economics Lab"
              title="Come funziona"
            >
              <CircleHelp
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </Link>
            <span className="student-utility-user">
              <span className="student-user-initial" aria-hidden="true">
                {session.nickname.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden text-sm font-semibold sm:inline">
                {session.nickname}
              </span>
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
