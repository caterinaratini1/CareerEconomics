import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Columns3, NotebookPen, Search } from 'lucide-react';
import { classRepository } from '@/lib/classes/repository';
import { setSession } from '@/lib/session/session';

/**
 * Join screen — the first screen, per the UI/UX guide's §4.1: not a
 * marketing homepage, a way to start the activity in under 30 seconds.
 *
 * The Server Action keeps this working with scripting off, consistent with
 * the rest of the site's bias toward server rendering (see ADR-0006): the
 * browser's native form submission does the validation round-trip, and
 * errors come back as a query param the page reads server-side.
 */
export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function joinClass(formData: FormData): Promise<void> {
    'use server';

    const classCode = String(formData.get('classCode') ?? '').trim();
    const nickname = String(formData.get('nickname') ?? '').trim();

    if (!classCode || !nickname) {
      redirect('/?error=missing');
    }

    const classRecord = await classRepository.getByCode(classCode);
    if (!classRecord) {
      redirect('/?error=code');
    }

    await setSession({ classCode: classRecord.code, nickname });
    redirect('/student');
  }

  return (
    <div className="app-shell flex min-h-[72dvh] max-w-6xl items-center py-8 sm:py-14">
      <div className="landing-workspace w-full">
        <section className="landing-intro">
          <div className="data-rule pt-5">
            <p className="page-kicker">Orientamento · Italia</p>
            <h1 className="editorial-title mt-3 max-w-xl">
              Scegli con più informazioni, non con più pressione.
            </h1>
            <p className="text-ink-muted mt-4 max-w-lg text-lg">
              Un percorso guidato per esplorare professioni, confrontare ciò che
              conta per te e arrivare a una domanda concreta da approfondire.
            </p>
          </div>

          <ol className="landing-steps" aria-label="Come funziona l’attività">
            <LandingStep
              icon={Search}
              number="01"
              title="Esplora"
              description="Scopri professioni, percorsi e informazioni essenziali."
            />
            <LandingStep
              icon={Columns3}
              number="02"
              title="Confronta"
              description="Metti a confronto fino a tre possibilità."
            />
            <LandingStep
              icon={NotebookPen}
              number="03"
              title="Rifletti"
              description="Annota quello che hai capito e cosa cercare dopo."
            />
          </ol>
        </section>

        <section className="landing-join panel p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <p className="page-kicker">Inizia l’attività</p>
            <span className="landing-join-label">2 minuti</span>
          </div>
          <h2 className="editorial-title mt-3 text-2xl">
            Entra nella tua classe
          </h2>
          <p className="text-ink-muted mt-2 text-sm">
            Inserisci il codice ricevuto dal tuo insegnante e un nome con cui
            vuoi essere riconosciuto.
          </p>
          {error && (
            <p
              role="alert"
              className="border-risk bg-risk/10 text-risk rounded-card mt-5 border px-4 py-3 text-sm"
            >
              {error === 'code'
                ? 'Codice classe non trovato. Controlla il codice con il tuo insegnante e riprova.'
                : 'Inserisci sia il codice della classe sia un nome.'}
            </p>
          )}

          <form action={joinClass} className="mt-6 space-y-5" noValidate>
            <div>
              <label htmlFor="classCode" className="block text-sm font-medium">
                Codice classe
              </label>
              <input
                id="classCode"
                name="classCode"
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                placeholder="es. DEMO01"
                className="border-border bg-surface text-ink focus:border-primary rounded-control mt-1 w-full border px-3 py-2.5 text-base"
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium">
                Come vuoi chiamarti
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                autoComplete="off"
                placeholder="es. Sofia"
                className="border-border bg-surface text-ink focus:border-primary rounded-control mt-1 w-full border px-3 py-2.5 text-base"
              />
            </div>

            <button
              type="submit"
              className="button-primary rounded-control w-full px-5 py-3 font-medium"
            >
              Entra nella classe
            </button>
          </form>

          <p className="text-ink-muted mt-7 text-center text-sm">
            Sei un insegnante?{' '}
            <Link
              href="/teacher"
              className="text-primary underline underline-offset-4"
            >
              Accesso insegnanti
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

function LandingStep({
  icon: Icon,
  number,
  title,
  description,
}: {
  icon: typeof Search;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <li className="landing-step">
      <span className="landing-step-number">{number}</span>
      <span className="landing-step-icon" aria-hidden="true">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="text-ink-muted block text-sm">{description}</span>
      </span>
    </li>
  );
}
