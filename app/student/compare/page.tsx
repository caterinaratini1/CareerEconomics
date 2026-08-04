import type { Metadata } from 'next';
import Link from 'next/link';
import { StepNav } from '@/components/student/StepNav';

export const metadata: Metadata = {
  title: 'Confronta le professioni',
};

/**
 * Planned, not built this pass — see docs/DECISIONS.md and the plan this
 * session shipped from. A placeholder so the dashboard's three actions and
 * StepNav never 404, per the guide's "no broken links" acceptance bar.
 */
export default function ComparePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <StepNav current="compare" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Confronta le professioni
      </h1>
      <p className="text-ink-muted mt-3 max-w-prose">
        Questa parte è in arrivo: potrai mettere a confronto fino a tre
        professioni — tempi, costi, stipendi e livello di competizione, uno
        accanto all’altro.
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
