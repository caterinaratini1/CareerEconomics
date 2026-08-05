import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Columns3, NotebookPen, Search } from 'lucide-react';
import { getSession } from '@/lib/session/session';
import {
  getStudentWork,
  hasSavedComparison,
  hasSubmittedReflection,
} from '@/lib/student-work/state';

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
  const work = await getStudentWork();
  const nickname = session?.nickname ?? '';

  const actions = [
    {
      href: '/student/careers',
      icon: Search,
      title: 'Esplora le professioni',
      description:
        'Cerca o sfoglia le professioni e scopri quanto si guadagna, quanto tempo ci vuole e quanto è competitiva.',
      status: work.comparedSlugs.length > 0 ? 'Iniziato' : 'Da fare',
    },
    {
      href: '/student/compare',
      icon: Columns3,
      title: 'Confronta fino a 3 percorsi',
      description:
        'Metti a confronto le professioni che ti interessano di più: tempi, costi, stipendi e livello di competizione.',
      status: hasSavedComparison(work) ? 'Salvato' : 'Da fare',
    },
    {
      href: '/student/reflection',
      icon: NotebookPen,
      title: 'Scrivi la tua riflessione',
      description:
        'Rispondi a qualche domanda guidata su cosa hai scoperto e su cosa ti serve ancora capire.',
      status: hasSubmittedReflection(work) ? 'Consegnata' : 'Da fare',
    },
  ];
  const nextAction =
    actions.find(({ status }) => status === 'Da fare') ?? actions[2]!;

  return (
    <div className="app-shell max-w-6xl py-8 sm:py-10">
      <div>
        <p className="page-kicker">La tua attività</p>
        <h1 className="editorial-title mt-2 text-4xl">Ciao, {nickname}</h1>
      </div>
      <p className="text-ink-muted mt-2 max-w-prose">
        Questa attività ha tre parti. Puoi farle in ordine o tornare qui in
        qualsiasi momento.
      </p>

      <div className="student-dashboard-grid">
        <div className="min-w-0">
          <section className="student-dashboard-hero">
            <div className="student-hero-scene" aria-hidden="true">
              <span className="student-hero-grid" />
              <span className="student-hero-orbit student-hero-orbit-one">
                <span />
              </span>
              <span className="student-hero-orbit student-hero-orbit-two">
                <span />
              </span>
            </div>

            <div className="student-hero-content">
              <p className="student-hero-label">Percorso guidato</p>
              <h2 className="mt-5 max-w-lg text-3xl font-semibold text-white sm:text-4xl">
                Parti dalla professione che ti incuriosisce.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">
                Cerca informazioni concrete, confronta le alternative e annota
                quello che vuoi approfondire.
              </p>
              <Link href={nextAction.href} className="student-hero-action">
                {nextAction.status === 'Da fare' ? 'Inizia' : 'Continua'}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section aria-labelledby="activities-heading" className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="page-kicker">Attività</p>
                <h2
                  id="activities-heading"
                  className="mt-1 text-2xl font-semibold"
                >
                  I tuoi tre passaggi
                </h2>
              </div>
            </div>
            <div className="student-action-grid">
              {actions.map(
                ({ href, icon: Icon, title, description, status }) => (
                  <Link
                    key={href}
                    href={href}
                    className="student-action-card group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="student-action-icon" aria-hidden="true">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <span className="student-status-label">{status}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                    <p className="text-ink-muted mt-2 text-sm">{description}</p>
                    <span className="text-primary mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
                      Apri <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </Link>
                ),
              )}
            </div>
          </section>
        </div>

        <aside
          className="student-progress-panel"
          aria-labelledby="progress-heading"
        >
          <p className="page-kicker">Panoramica</p>
          <h2 id="progress-heading" className="mt-2 text-2xl font-semibold">
            Il tuo percorso
          </h2>
          <ol className="mt-5">
            {actions.map(({ title, status }, index) => (
              <li key={title} className="student-progress-row">
                <span className="student-progress-number">{index + 1}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="text-ink-muted mt-0.5 block text-xs">
                    {status}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <div className="border-border mt-6 border-t pt-5">
            <p className="text-ink-muted text-xs">Classe attiva</p>
            <p className="mt-1 text-sm font-semibold">{session?.classCode}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
