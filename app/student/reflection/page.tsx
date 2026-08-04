import type { Metadata } from 'next';
import Link from 'next/link';
import { CircleCheck, Save } from 'lucide-react';
import { StepNav } from '@/components/student/StepNav';
import { careerRepository } from '@/lib/content/repository';
import type { CareerProfile } from '@/lib/content/schema';
import {
  saveReflectionDraft,
  submitReflection,
} from '@/lib/student-work/actions';
import {
  getStudentWork,
  hasSavedComparison,
  hasSubmittedReflection,
} from '@/lib/student-work/state';

export const metadata: Metadata = {
  title: 'La tua riflessione',
};

export default async function ReflectionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; submitted?: string }>;
}) {
  const [{ error, submitted }, work] = await Promise.all([
    searchParams,
    getStudentWork(),
  ]);
  const selectedCareers = (
    await Promise.all(
      work.comparedSlugs.map((slug) => careerRepository.getBySlug(slug)),
    )
  ).filter((career): career is CareerProfile => Boolean(career));
  const reflection = work.reflection;
  const isSubmitted = hasSubmittedReflection(work) || submitted === '1';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <StepNav current="reflect" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        La tua riflessione
      </h1>
      <p className="text-ink-muted mt-3 max-w-prose">
        Trasforma il confronto in una prossima domanda concreta. Il tuo
        insegnante vedra la consegna quando premi &quot;Invia riflessione&quot;.
      </p>

      {isSubmitted && (
        <div
          role="status"
          className="border-success bg-evidence-verified-soft rounded-card mt-6 flex gap-3 border p-4"
        >
          <CircleCheck
            aria-hidden="true"
            className="text-success mt-0.5 h-5 w-5 shrink-0"
          />
          <p className="text-sm">
            Riflessione inviata. Puoi ancora modificarla e inviarla di nuovo se
            il tuo insegnante te lo chiede.
          </p>
        </div>
      )}

      {error === 'empty' && (
        <p
          role="alert"
          className="border-risk bg-risk/10 text-risk rounded-card mt-6 border px-4 py-3 text-sm"
        >
          Scrivi almeno una risposta o scegli il livello di chiarezza prima di
          inviare.
        </p>
      )}

      {!hasSavedComparison(work) && (
        <div className="border-border bg-surface-muted rounded-card mt-6 border p-4">
          <p className="text-sm">
            Non hai ancora salvato un percorso realistico nel confronto. Puoi
            compilare comunque la riflessione, ma prima e meglio confrontare
            almeno due professioni.
          </p>
          <Link
            href="/student/compare"
            className="text-primary mt-3 inline-flex text-sm font-medium underline-offset-4 hover:underline"
          >
            Vai al confronto
          </Link>
        </div>
      )}

      <ComparedCareers
        careers={selectedCareers.map((career) => ({
          slug: career.slug,
          name: career.canonicalName,
          realistic: career.slug === work.realisticSlug,
        }))}
      />

      <form className="border-border bg-surface rounded-card mt-8 border p-5 sm:p-6">
        <ReflectionTextarea
          id="surprised"
          label="Che cosa ti ha sorpreso di piu?"
          defaultValue={reflection.surprised}
        />
        <ReflectionTextarea
          id="realisticPath"
          label="Quale percorso ti sembra piu realistico adesso?"
          defaultValue={reflection.realisticPath}
        />
        <ReflectionTextarea
          id="hardestTradeoff"
          label="Quale compromesso sarebbe piu difficile per te?"
          defaultValue={reflection.hardestTradeoff}
        />
        <ReflectionTextarea
          id="nextResearch"
          label="Che cosa devi verificare o cercare dopo?"
          defaultValue={reflection.nextResearch}
        />

        <fieldset className="mt-6">
          <legend className="font-medium">
            Quanto ti e chiaro il prossimo passo?
          </legend>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <label
                key={value}
                className="border-border rounded-control flex min-h-12 cursor-pointer flex-col items-center justify-center border px-2 py-1 text-sm"
              >
                <input
                  type="radio"
                  name="confidence"
                  value={value}
                  defaultChecked={reflection.confidence === value}
                  className="sr-only"
                />
                <span className="font-semibold">{value}</span>
                <span className="text-ink-muted text-center text-xs">
                  {value === 1
                    ? 'Non so'
                    : value === 3
                      ? 'Abbastanza'
                      : value === 5
                        ? 'Chiaro'
                        : ''}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {reflection.savedAt && (
          <p className="text-ink-muted mt-4 text-sm">
            Bozza salvata in questa sessione.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            formAction={saveReflectionDraft}
            className="border-border text-ink hover:border-primary rounded-control inline-flex min-h-11 items-center gap-2 px-5 py-2.5 font-medium"
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            Salva bozza
          </button>
          <button
            formAction={submitReflection}
            className="bg-primary rounded-control inline-flex min-h-11 items-center px-5 py-2.5 font-medium text-white"
          >
            Invia riflessione
          </button>
        </div>
      </form>
    </div>
  );
}

function ComparedCareers({
  careers,
}: {
  careers: { slug: string; name: string; realistic: boolean }[];
}) {
  if (careers.length === 0) {
    return (
      <p className="text-ink-muted mt-6 text-sm">
        Nessuna professione selezionata per ora.
      </p>
    );
  }

  return (
    <section aria-labelledby="selected-careers-heading" className="mt-8">
      <h2 id="selected-careers-heading" className="text-xl font-semibold">
        Professioni confrontate
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {careers.map((career) => (
          <li
            key={career.slug}
            className="border-border bg-surface rounded-pill border px-3 py-1.5 text-sm"
          >
            {career.name}
            {career.realistic && (
              <span className="text-success ml-2 font-medium">Realistica</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReflectionTextarea({
  id,
  label,
  defaultValue,
}: {
  id: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <label htmlFor={id} className="block font-medium">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        defaultValue={defaultValue}
        rows={4}
        maxLength={800}
        className="border-border bg-surface text-ink focus:border-primary rounded-control mt-2 w-full resize-y border px-3 py-2 text-base"
      />
    </div>
  );
}
