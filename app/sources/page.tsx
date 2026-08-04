import type { Metadata } from 'next';
import Link from 'next/link';
import { Prose } from '@/components/ui/primitives';
import { SourceList } from '@/components/career/SourceList';
import { careerRepository, loadAllCareers } from '@/lib/content/repository';

export const metadata: Metadata = {
  title: 'Fonti',
  description: 'Tutte le fonti usate nel sito, raggruppate per professione.',
};

/**
 * A single index of every source on the site.
 *
 * Worth its own page rather than only living per-career: a teacher deciding
 * whether this is trustworthy enough for a classroom wants to see the whole
 * evidence base at once, not click through fifteen careers to assemble it.
 */
export default async function SourcesPage() {
  const summaries = await careerRepository.listSummaries();
  const visible = new Set(summaries.map((s) => s.slug));
  const careers = loadAllCareers().filter((c) => visible.has(c.slug));

  const total = careers.reduce((sum, c) => sum + c.sources.length, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Fonti</h1>

      <Prose>
        <p className="text-ink-muted mt-4 text-lg">
          Tutto quello che citiamo, in un unico posto.{' '}
          {total === 0 ? 'Per ora nessuna fonte: ' : ''}
          vedi{' '}
          <Link
            href="/methodology"
            className="text-accent underline underline-offset-4"
          >
            come lavoriamo
          </Link>{' '}
          per sapere quali tipi di fonte accettiamo e perché.
        </p>
      </Prose>

      <div className="mt-10 space-y-10">
        {careers.map((career) => (
          <section key={career.slug} aria-labelledby={`sources-${career.slug}`}>
            <h2
              id={`sources-${career.slug}`}
              className="border-rule border-b pb-2 text-xl font-semibold"
            >
              <Link
                href={`/careers/${career.slug}`}
                className="text-ink hover:text-accent underline-offset-4 hover:underline"
              >
                {career.canonicalName}
              </Link>
            </h2>
            <div className="mt-4">
              <SourceList career={career} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
