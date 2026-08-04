import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Accesso insegnanti',
};

/**
 * Planned, not built this pass. Real teacher auth (magic link) and the class
 * dashboard need a persistent backend — see docs/DECISIONS.md and
 * docs/PILOT_GUIDE.md. This exists so the join screen's "Accesso insegnanti"
 * link has somewhere honest to go instead of 404ing.
 */
export default function TeacherPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Accesso insegnanti</h1>
      <p className="text-ink-muted mt-3 max-w-prose">
        La parte per gli insegnanti — creare una classe, avere un codice da
        condividere, vedere i progressi della classe — è in arrivo.
      </p>
      <p className="mt-6">
        <Link href="/" className="text-primary underline underline-offset-4">
          Torna alla pagina iniziale
        </Link>
      </p>
    </div>
  );
}
