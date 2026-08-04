import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CareerLibraryCard } from '@/components/student/CareerLibraryCard';
import { StepNav } from '@/components/student/StepNav';
import { SearchForm } from '@/components/search/SearchForm';
import { careerRepository } from '@/lib/content/repository';
import { CATEGORY_LABELS } from '@/lib/site';

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

  const hits = isSearching ? await careerRepository.search(query) : [];
  const all = isSearching
    ? []
    : await careerRepository.listSummaries({ category: category || undefined });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <StepNav current="explore" />

      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        {isSearching ? `Risultati per “${query}”` : 'Esplora le professioni'}
      </h1>

      <div className="mt-6 max-w-2xl">
        <SearchForm defaultValue={query} autoFocus={!isSearching} />
      </div>

      {!isSearching && <CategoryFilter current={category} />}

      {isSearching ? (
        <SearchResults query={query} hits={hits} />
      ) : (
        <AllCareers careers={all} />
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
          ? 'bg-primary rounded-pill px-3 py-1.5 text-sm font-medium text-white'
          : 'border-border text-ink-muted hover:text-ink rounded-pill border px-3 py-1.5 text-sm'
      }
    >
      {children}
    </Link>
  );
}

function SearchResults({
  query,
  hits,
}: {
  query: string;
  hits: Awaited<ReturnType<typeof careerRepository.search>>;
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
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {hits.map((hit) => (
          <CareerLibraryCard
            key={hit.career.slug}
            career={hit.career}
            matchedOn={hit.matchedOn}
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
}: {
  careers: Awaited<ReturnType<typeof careerRepository.listSummaries>>;
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
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {careers.map((career) => (
          <CareerLibraryCard key={career.slug} career={career} />
        ))}
      </ul>
    </div>
  );
}
