import type { Metadata } from 'next';
import Link from 'next/link';
import { StepNav } from '@/components/student/StepNav';

export const metadata: Metadata = {
  title: 'La tua riflessione',
};

/**
 * Planned, not built this pass — see docs/DECISIONS.md and the plan this
 * session shipped from. A placeholder so the dashboard's three actions and
 * StepNav never 404, per the guide's "no broken links" acceptance bar.
 */
export default function ReflectionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <StepNav current="reflect" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        La tua riflessione
      </h1>
      <p className="text-ink-muted mt-3 max-w-prose">
        Questa parte è in arrivo: qualche domanda guidata su cosa hai scoperto
        esplorando le professioni, e su cosa ti serve ancora capire.
      </p>
      <p className="mt-6">
        <Link
          href="/student/careers"
          className="text-primary underline underline-offset-4"
        >
          Intanto, esplora le professioni
        </Link>
      </p>
    </div>
  );
}
