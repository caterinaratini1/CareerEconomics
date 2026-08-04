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
        Qualcosa è andato storto
      </h1>
      <p className="text-ink-muted mt-4 max-w-prose text-lg">
        Questa pagina non si è caricata. È un problema nostro, non tuo.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={reset}
          className="bg-primary rounded-control px-5 py-2.5 font-medium text-white"
        >
          Riprova
        </button>
        <Link
          href="/"
          className="border-border rounded-control border px-5 py-2.5 font-medium"
        >
          Torna alla pagina iniziale
        </Link>
      </div>
    </div>
  );
}
