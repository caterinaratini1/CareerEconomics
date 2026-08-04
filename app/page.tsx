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
          Scopri com’è davvero un lavoro.
        </h1>
        <p className="text-ink-muted mt-4 text-lg">
          Risposte chiare su che cosa si fa in una professione, come ci si
          arriva, quanto si guadagna e quanto è difficile — con la fonte dietro
          ogni informazione importante, così puoi controllare da te.
        </p>
        <p className="text-ink-muted mt-3">
          Gratuito, senza registrazione. Al momento le informazioni riguardano
          l’{SITE.country.name}.
        </p>
      </section>

      <section aria-label="Cerca una professione" className="mt-10 max-w-2xl">
        <SearchForm />
      </section>

      <section aria-labelledby="browse-heading" className="mt-14">
        <h2 id="browse-heading" className="text-2xl font-semibold">
          Sfoglia le professioni
        </h2>

        {careers.length === 0 ? (
          <p className="text-ink-muted mt-4">
            Non c’è ancora nessuna professione pubblicata. Torna presto.
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
            Vedi tutte le professioni
          </Link>
        </p>
      </section>

      <section aria-labelledby="trust-heading" className="mt-16 max-w-prose">
        <h2 id="trust-heading" className="text-2xl font-semibold">
          Perché puoi verificare quello che scriviamo
        </h2>
        <ul className="mt-4 space-y-3">
          <li>
            <strong>Ogni informazione importante ha la sua fonte.</strong>{' '}
            Stipendi, requisiti di accesso e regole di legge vengono da
            ministeri, istituti di statistica e ordini professionali, e ti
            diciamo sempre quando li abbiamo controllati l’ultima volta.
          </li>
          <li>
            <strong>Diciamo quando non sappiamo una cosa.</strong> Se non
            abbiamo ancora verificato qualcosa, la pagina lo scrive invece di
            tirare a indovinare o di far sparire la sezione.
          </li>
          <li>
            <strong>Intervalli, non medie.</strong> Lo stipendio dipende da dove
            lavori e da quanti anni di esperienza hai, quindi mostriamo la
            forbice e che cosa la fa spostare.
          </li>
          <li>
            <strong>Ci sono anche i lati negativi.</strong> Ogni professione ha
            i suoi svantaggi. Una pagina che elenca solo i pregi è pubblicità.
          </li>
        </ul>
        <p className="mt-4">
          <Link
            href="/methodology"
            className="text-accent underline underline-offset-4"
          >
            Come raccogliamo e verifichiamo le informazioni
          </Link>
        </p>
      </section>
    </div>
  );
}
