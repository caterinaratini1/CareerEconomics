'use client';

import Link from 'next/link';

/**
 * The only client component in the application. Next requires `error.tsx` to
 * be one so it can attach the reset handler.
 *
 * The error message itself is never shown: it can contain internal detail, and
 * it would mean nothing to a fifteen-year-old anyway. §8 asks for error states
 * students can understand, so this says what happened and what to do next.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-ink-muted mt-4 max-w-prose text-lg">
        This page failed to load. It is a problem on our side, not yours.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={reset}
          className="bg-accent rounded px-5 py-2.5 font-medium text-white"
        >
          Try again
        </button>
        <Link
          href="/careers"
          className="border-rule rounded border px-5 py-2.5 font-medium"
        >
          Browse careers
        </Link>
      </div>
    </div>
  );
}
