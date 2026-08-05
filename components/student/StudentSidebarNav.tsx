'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Columns3, Home, NotebookPen, Search } from 'lucide-react';

const links = [
  { href: '/student', icon: Home, label: 'Panoramica', exact: true },
  { href: '/student/careers', icon: Search, label: 'Esplora professioni' },
  { href: '/student/compare', icon: Columns3, label: 'Confronta' },
  { href: '/student/reflection', icon: NotebookPen, label: 'Riflessione' },
] as const;

/** Keeps the persistent workspace navigation oriented without changing the
 * server-rendered student pages or their no-JavaScript content flow. */
export function StudentSidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Attività dello studente" className="student-sidebar-nav">
      {links.map((link) => {
        const { href, icon: Icon, label } = link;
        const active =
          'exact' in link ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={
              active ? 'student-nav-link is-active' : 'student-nav-link'
            }
          >
            <Icon
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
              strokeWidth={1.8}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
