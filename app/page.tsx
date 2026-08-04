import Link from 'next/link';
import { CareerCard } from '@/components/career/CareerCard';
import { SearchForm } from '@/components/search/SearchForm';
import { careerRepository } from '@/lib/content/repository';
import { CATEGORY_LABELS, SITE } from '@/lib/site';

export default async function HomePage() {
  const careers = await careerRepository.listSummaries();

  const byCategory = new Map<string, typeof careers>();
  for (const career of careers) {
    const bucket = byCategory.get(career.category) ?? [];
    bucket.push(career);
    byCategory.set(career.category, bucket);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="max-w-prose">
        <h1 className="text-4xl font-bold tracking-tight">
          Find out what a career actually involves.
        </h1>
        <p className="text-ink-muted mt-4 text-lg">
          Straight answers about what a job is really like, how you get into it,
          what it pays, and how hard it is to reach — with the source behind
          every claim, so you can check it yourself.
        </p>
        <p className="text-ink-muted mt-3">
          Free, no account needed. Career information currently covers{' '}
          {SITE.country.name}.
        </p>
      </section>

      <section aria-label="Search careers" className="mt-10 max-w-2xl">
        <SearchForm />
      </section>

      <section aria-labelledby="browse-heading" className="mt-14">
        <h2 id="browse-heading" className="text-2xl font-semibold">
          Browse careers
        </h2>

        {careers.length === 0 ? (
          <p className="text-ink-muted mt-4">
            No careers are published yet. Check back soon.
          </p>
        ) : (
          <div className="mt-6 space-y-10">
            {[...byCategory.entries()].map(([category, items]) => (
              <div key={category}>
                <h3 className="text-ink-muted text-sm font-semibold tracking-wide uppercase">
                  {CATEGORY_LABELS[category] ?? category}
                </h3>
                <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                  {items.map((career) => (
                    <CareerCard key={career.slug} career={career} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <p className="mt-8">
          <Link
            href="/careers"
            className="text-accent underline underline-offset-4"
          >
            See all careers
          </Link>
        </p>
      </section>

      <section aria-labelledby="trust-heading" className="mt-16 max-w-prose">
        <h2 id="trust-heading" className="text-2xl font-semibold">
          Why you can check what we say
        </h2>
        <ul className="mt-4 space-y-3">
          <li>
            <strong>Every important fact links to its source.</strong> Pay,
            entry requirements and legal rules come from government, statistical
            and professional bodies, and we show you when we last checked.
          </li>
          <li>
            <strong>We say when we do not know.</strong> If we have not
            researched something, the page says so rather than guessing or
            quietly leaving the section out.
          </li>
          <li>
            <strong>Ranges, not averages.</strong> Pay depends on where you work
            and how long you have been doing it, so we show the spread and what
            moves it.
          </li>
          <li>
            <strong>Downsides are on the page too.</strong> Every career has
            trade-offs. A page that only lists advantages is advertising.
          </li>
        </ul>
        <p className="mt-4">
          <Link
            href="/methodology"
            className="text-accent underline underline-offset-4"
          >
            How we research careers
          </Link>
        </p>
      </section>
    </div>
  );
}
