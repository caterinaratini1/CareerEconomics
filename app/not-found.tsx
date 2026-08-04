import Link from 'next/link';
import { SearchForm } from '@/components/search/SearchForm';

/**
 * §8 asks that error states be understandable to students. A 404 here usually
 * means "we have not written that career yet" rather than "you typed the URL
 * wrong", so the page offers the search box instead of an apology.
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        We could not find that page
      </h1>
      <p className="text-ink-muted mt-4 max-w-prose text-lg">
        If you were looking for a career, we may not have written it up yet — we
        add them one at a time so each one is properly checked. Try searching
        for it, or browse what we do have.
      </p>

      <div className="mt-8 max-w-xl">
        <SearchForm />
      </div>

      <p className="mt-8">
        <Link
          href="/careers"
          className="text-accent underline underline-offset-4"
        >
          Browse all careers
        </Link>
      </p>
    </div>
  );
}
