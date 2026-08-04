import Link from 'next/link';
import { SearchForm } from '@/components/search/SearchForm';
import { getSession } from '@/lib/session/session';

/**
 * §8 asks that error states be understandable to students. A 404 here usually
 * means "we have not written that career yet" rather than "you typed the URL
 * wrong" — but the career search only works once a class has been joined
 * (`/student/*` is session-gated), so this only offers it when a session
 * cookie already exists. Without one, sending the reader into the search
 * form would just bounce them straight back out via app/student/layout.tsx.
 */
export default async function NotFound() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">
        Non abbiamo trovato questa pagina
      </h1>

      {session ? (
        <>
          <p className="text-ink-muted mt-4 max-w-prose text-lg">
            Se cercavi una professione, forse non l’abbiamo ancora scritta: le
            aggiungiamo una alla volta, per verificarle bene. Prova a cercarla,
            o guarda quelle che ci sono.
          </p>
          <div className="mt-8 max-w-xl">
            <SearchForm />
          </div>
          <p className="mt-8">
            <Link
              href="/student/careers"
              className="text-primary underline underline-offset-4"
            >
              Sfoglia tutte le professioni
            </Link>
          </p>
        </>
      ) : (
        <>
          <p className="text-ink-muted mt-4 max-w-prose text-lg">
            Per cercare una professione devi prima entrare nella tua classe.
          </p>
          <p className="mt-8">
            <Link
              href="/"
              className="text-primary underline underline-offset-4"
            >
              Entra nella tua classe
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
