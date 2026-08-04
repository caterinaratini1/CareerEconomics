import Link from 'next/link';
import { redirect } from 'next/navigation';
import { classRepository } from '@/lib/classes/repository';
import { setSession } from '@/lib/session/session';
import { SITE } from '@/lib/site';

/**
 * Join screen — the first screen, per the UI/UX guide's §4.1: not a
 * marketing homepage, a way to start the activity in under 30 seconds.
 *
 * The Server Action keeps this working with scripting off, consistent with
 * the rest of the site's bias toward server rendering (see ADR-0006): the
 * browser's native form submission does the validation round-trip, and
 * errors come back as a query param the page reads server-side.
 */
export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function joinClass(formData: FormData): Promise<void> {
    'use server';

    const classCode = String(formData.get('classCode') ?? '').trim();
    const nickname = String(formData.get('nickname') ?? '').trim();

    if (!classCode || !nickname) {
      redirect('/?error=missing');
    }

    const classRecord = await classRepository.getByCode(classCode);
    if (!classRecord) {
      redirect('/?error=code');
    }

    await setSession({ classCode: classRecord.code, nickname });
    redirect('/student');
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col justify-center px-4 py-16">
      <p className="text-primary text-sm font-semibold tracking-wide uppercase">
        {SITE.name}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Entra nella tua classe
      </h1>
      <p className="text-ink-muted mt-2">
        Il tuo insegnante ti ha dato un codice classe. Scrivilo qui insieme a un
        nome con cui vuoi essere riconosciuto — non serve il tuo vero nome.
      </p>

      {error && (
        <p
          role="alert"
          className="border-risk bg-risk/10 text-risk rounded-card mt-6 border px-4 py-3 text-sm"
        >
          {error === 'code'
            ? 'Codice classe non trovato. Controlla il codice con il tuo insegnante e riprova.'
            : 'Inserisci sia il codice della classe sia un nome.'}
        </p>
      )}

      <form action={joinClass} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="classCode" className="block text-sm font-medium">
            Codice classe
          </label>
          <input
            id="classCode"
            name="classCode"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="es. DEMO01"
            className="border-border bg-surface text-ink focus:border-primary rounded-control mt-1 w-full border px-3 py-2.5 text-base"
          />
        </div>

        <div>
          <label htmlFor="nickname" className="block text-sm font-medium">
            Come vuoi chiamarti
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            autoComplete="off"
            placeholder="es. Sofia"
            className="border-border bg-surface text-ink focus:border-primary rounded-control mt-1 w-full border px-3 py-2.5 text-base"
          />
        </div>

        <button
          type="submit"
          className="bg-primary rounded-control w-full px-5 py-2.5 font-medium text-white"
        >
          Entra nella classe
        </button>
      </form>

      <p className="text-ink-muted mt-8 text-center text-sm">
        Sei un insegnante?{' '}
        <Link
          href="/teacher"
          className="text-primary underline underline-offset-4"
        >
          Accesso insegnanti
        </Link>
      </p>
    </div>
  );
}
