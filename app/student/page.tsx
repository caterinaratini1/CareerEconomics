import Link from 'next/link';
import type { Metadata } from 'next';
import { Columns3, NotebookPen, Search } from 'lucide-react';
import { getSession } from '@/lib/session/session';

export const metadata: Metadata = {
  title: 'La tua attività',
};

/**
 * Guide §8 step 2: greeting, progress, three actions, no long explanatory
 * text. There is no persistence layer yet (Phase B — see docs/DECISIONS.md),
 * so this deliberately does not claim to track which steps are "done": that
 * would be a fabricated status, and this product does not render numbers it
 * cannot back up.
 */
export default async function StudentDashboardPage() {
  const session = await getSession();
  const nickname = session?.nickname ?? '';

  const actions = [
    {
      href: '/student/careers',
      icon: Search,
      title: 'Esplora le professioni',
      description:
        'Cerca o sfoglia le professioni e scopri quanto si guadagna, quanto tempo ci vuole e quanto è competitiva.',
    },
    {
      href: '/student/compare',
      icon: Columns3,
      title: 'Confronta fino a 3 percorsi',
      description:
        'Metti a confronto le professioni che ti interessano di più: tempi, costi, stipendi e livello di competizione.',
    },
    {
      href: '/student/reflection',
      icon: NotebookPen,
      title: 'Scrivi la tua riflessione',
      description:
        'Rispondi a qualche domanda guidata su cosa hai scoperto e su cosa ti serve ancora capire.',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Ciao, {nickname}</h1>
      <p className="text-ink-muted mt-2 max-w-prose">
        Questa attività ha tre parti. Puoi farle in ordine o tornare qui in
        qualsiasi momento.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {actions.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="border-border bg-surface hover:border-primary shadow-soft rounded-card block border p-5 transition-colors"
          >
            <div
              aria-hidden="true"
              className="bg-primary-soft text-primary flex h-10 w-10 items-center justify-center rounded-full"
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="text-ink-muted mt-1.5 text-sm">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
