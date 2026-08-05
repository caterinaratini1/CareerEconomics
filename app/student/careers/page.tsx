import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CareerLibraryCard } from '@/components/student/CareerLibraryCard';
import { StepNav } from '@/components/student/StepNav';
import { careerRepository } from '@/lib/content/repository';
import { CATEGORY_LABELS } from '@/lib/site';
import { getStudentWork } from '@/lib/student-work/state';

export const metadata: Metadata = {
  title: 'Esplora le professioni',
  description:
    'Cerca o sfoglia le professioni. Ognuna spiega che cosa si fa in quel ' +
    'lavoro, come ci si arriva e quanto si guadagna.',
};

/**
 * Guide §8 step 3. Listing and search results share one page (same rationale
 * as the original app/careers/page.tsx this replaces — see ADR-0006): one
 * layout, one empty state, one place for the search box.
 */
export default async function CareerLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const query = q?.trim() ?? '';
  const isSearching = query.length > 0;
  const work = await getStudentWork();

  const hits = isSearching ? await careerRepository.search(query) : [];
  const all = isSearching
    ? []
    : await careerRepository.listSummaries({ category: category || undefined });

  return (
    <div className="app-shell max-w-6xl py-8 sm:py-10">
      <StepNav current="explore" />

      <div className="mt-7">
        <p className="page-kicker">Archivio professioni</p>
        <h1 className="editorial-title mt-2 text-4xl">
          {isSearching ? `Risultati per “${query}”` : 'Esplora le professioni'}
        </h1>
      </div>

      {!isSearching && <CategoryFilter current={category} />}

      {isSearching ? (
        <SearchResults
          query={query}
          hits={hits}
          selectedSlugs={work.comparedSlugs}
        />
      ) : (
        <AllCareers careers={all} selectedSlugs={work.comparedSlugs} />
      )}

      {work.comparedSlugs.length > 0 && (
        <div className="border-border bg-surface/95 sticky bottom-0 z-20 mt-8 border-t py-3 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium">
              {work.comparedSlugs.length} di 3 selezionate per il confronto
            </p>
            <Link
              href="/student/compare"
              className="button-primary rounded-control inline-flex min-h-10 items-center px-4 py-2 text-sm font-medium"
            >
              Confronta
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryFilter({ current }: { current?: string | undefined }) {
  return (
    <nav aria-label="Filtra per area" className="mt-6 flex flex-wrap gap-2">
      <FilterPill href="/student/careers" active={!current}>
        Tutte
      </FilterPill>
      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
        <FilterPill
          key={value}
          href={`/student/careers?category=${value}`}
          active={current === value}
        >
          {label}
        </FilterPill>
      ))}
    </nav>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'bg-primary rounded-control px-3 py-1.5 text-sm font-medium text-white'
          : 'border-border text-ink-muted hover:text-primary rounded-control border px-3 py-1.5 text-sm'
      }
    >
      {children}
    </Link>
  );
}

function SearchResults({
  query,
  hits,
  selectedSlugs,
}: {
  query: string;
  hits: Awaited<ReturnType<typeof careerRepository.search>>;
  selectedSlugs: string[];
}) {
  if (hits.length === 0) {
    return <NoResults query={query} />;
  }

  return (
    <section aria-label="Risultati della ricerca" className="mt-10">
      {/* Announced politely so screen-reader users get the count without the
          page having to steal focus. */}
      <p role="status" className="text-ink-muted">
        {hits.length === 1
          ? '1 professione trovata.'
          : `${hits.length} professioni trovate.`}
      </p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {hits.map((hit) => (
          <CareerLibraryCard
            key={hit.career.slug}
            career={hit.career}
            matchedOn={hit.matchedOn}
            selected={selectedSlugs.includes(hit.career.slug)}
            compareDisabled={
              selectedSlugs.length >= 3 &&
              !selectedSlugs.includes(hit.career.slug)
            }
          />
        ))}
      </ul>
    </section>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <section aria-label="Nessun risultato" className="mt-10 max-w-prose">
      <div className="border-border bg-surface-muted rounded-card border p-6">
        <h2 className="text-xl font-semibold">
          Questa professione non c’è ancora
        </h2>
        <p className="text-ink-muted mt-3">
          Non abbiamo trovato niente per “{query}”. Stiamo aggiungendo le schede
          una alla volta, verificandole bene, quindi l’elenco è ancora corto.
        </p>
        <p className="text-ink-muted mt-3">
          Prova anche con un altro nome per lo stesso lavoro: molte professioni
          si chiamano in più modi e potremmo averla messa sotto un altro nome.
        </p>
        <p className="mt-4">
          <Link
            href="/student/careers"
            className="text-primary underline underline-offset-4"
          >
            Guarda tutte quelle che abbiamo
          </Link>
        </p>
      </div>
    </section>
  );
}

function AllCareers({
  careers,
  selectedSlugs,
}: {
  careers: Awaited<ReturnType<typeof careerRepository.listSummaries>>;
  selectedSlugs: string[];
}) {
  if (careers.length === 0) {
    return (
      <p className="text-ink-muted mt-10">
        Non c’è ancora nessuna professione in questa area.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-ink-muted">
        {careers.length === 1
          ? '1 professione.'
          : `${careers.length} professioni.`}
      </p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {careers.map((career) => (
          <CareerLibraryCard
            key={career.slug}
            career={career}
            selected={selectedSlugs.includes(career.slug)}
            compareDisabled={
              selectedSlugs.length >= 3 && !selectedSlugs.includes(career.slug)
            }
          />
        ))}
      </ul>
    </div>
  );
}
