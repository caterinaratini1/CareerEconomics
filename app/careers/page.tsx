import type { Metadata } from 'next';
import Link from 'next/link';
import { CareerCard } from '@/components/career/CareerCard';
import { SearchForm } from '@/components/search/SearchForm';
import { careerRepository } from '@/lib/content/repository';
import { CATEGORY_LABELS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Tutte le professioni',
  description:
    'Sfoglia o cerca tutte le schede. Ognuna spiega che cosa si fa in quel ' +
    'lavoro, come ci si arriva e quanto si guadagna.',
};

/**
 * Listing and search results are the same page.
 *
 * Splitting them would mean two layouts, two empty states and two places for
 * the search box to drift out of sync. One page with an optional `q` also
 * gives a URL a teacher can paste into a lesson plan.
 */
export default async function CareersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const isSearching = query.length > 0;

  const hits = isSearching ? await careerRepository.search(query) : [];
  const all = isSearching ? [] : await careerRepository.listSummaries();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">
        {isSearching ? `Risultati per “${query}”` : 'Tutte le professioni'}
      </h1>

      <div className="mt-6 max-w-2xl">
        <SearchForm defaultValue={query} autoFocus={!isSearching} />
      </div>

      {isSearching ? (
        <SearchResults query={query} hits={hits} />
      ) : (
        <AllCareers careers={all} />
      )}
    </div>
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
          <CareerCard
            key={hit.career.slug}
            career={hit.career}
            matchedOn={hit.matchedOn}
          />
        ))}
      </ul>
    </section>
  );
}

/**
 * §12.3 no-result state.
 *
 * Logging the missing-career request is Phase 6 work (it needs a database and
 * a rate limit). The copy already promises only what the MVP can do today —
 * nothing here claims the term was recorded, because it is not yet.
 */
function NoResults({ query }: { query: string }) {
  return (
    <section aria-label="Nessun risultato" className="mt-10 max-w-prose">
      <div className="border-rule bg-paper-sunk rounded border p-6">
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
            href="/careers"
            className="text-accent underline underline-offset-4"
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
        Non c’è ancora nessuna professione pubblicata.
      </p>
    );
  }

  const byCategory = new Map<string, typeof careers>();
  for (const career of careers) {
    const bucket = byCategory.get(career.category) ?? [];
    bucket.push(career);
    byCategory.set(career.category, bucket);
  }

  return (
    <div className="mt-10 space-y-10">
      <p className="text-ink-muted">
        {careers.length === 1
          ? '1 professione, divisa per area.'
          : `${careers.length} professioni, divise per area.`}
      </p>
      {[...byCategory.entries()].map(([category, items]) => (
        <section key={category} aria-label={CATEGORY_LABELS[category]}>
          <h2 className="text-ink-muted text-sm font-semibold tracking-wide uppercase">
            {CATEGORY_LABELS[category] ?? category}
          </h2>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {items.map((career) => (
              <CareerCard key={career.slug} career={career} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
