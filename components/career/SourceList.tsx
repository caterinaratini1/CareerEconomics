import type { CareerProfile } from '@/lib/content/schema';
import { formatDate } from './ClaimValue';

const AUTHORITY_LABELS: Record<string, string> = {
  'official-government': 'Fonte governativa',
  'national-statistics': 'Statistica nazionale',
  'professional-body': 'Ordine o albo professionale',
  'academic-institution': 'Università o ente d’esame',
  'public-career-portal': 'Portale pubblico sul lavoro',
  'labour-market-research': 'Ricerca sul mercato del lavoro',
  'salary-dataset': 'Banca dati sugli stipendi',
};

/**
 * §10.14 — the source list.
 *
 * The empty state is not a fallback, it is a feature. A draft with no sources
 * says so plainly and explains what that means for the reader, because the
 * alternative — hiding the section — would make an unsourced page look
 * identical to a well-sourced one.
 */
export function SourceList({ career }: { career: CareerProfile }) {
  if (career.sources.length === 0) {
    return (
      <div className="border-evidence-draft/40 bg-evidence-draft-soft rounded border-l-4 p-4">
        <p className="font-medium">
          A questa pagina non è ancora collegata nessuna fonte.
        </p>
        <p className="text-ink-muted mt-2 max-w-prose text-sm">
          Questa scheda è una bozza. Pubblichiamo una pagina solo quando le
          informazioni principali — stipendi, requisiti di accesso e regole di
          legge — sono tutte sostenute da una fonte ufficiale. Nel frattempo
          usala per capire com’è fatta la professione, e verifica da te i dati
          che ti servono davvero.
        </p>
        {career.editorial.openQuestions.length > 0 && (
          <details className="mt-4">
            <summary className="text-sm font-medium">
              Cosa dobbiamo ancora verificare (
              {career.editorial.openQuestions.length})
            </summary>
            <ul className="text-ink-muted mt-2 list-disc space-y-1 pl-5 text-sm">
              {career.editorial.openQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {career.sources.map((source) => (
        <li
          key={source.id}
          className="border-border border-b pb-4 last:border-b-0"
        >
          <a
            href={source.url}
            className="text-primary font-medium underline underline-offset-2"
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            {source.title}
          </a>
          <p className="text-ink-muted mt-1 text-sm">
            {source.publisher} ·{' '}
            {AUTHORITY_LABELS[source.authorityLevel] ?? source.authorityLevel}
            {source.publicationDate &&
              ` · pubblicata il ${formatDate(source.publicationDate)}`}{' '}
            · l’abbiamo consultata il {formatDate(source.accessedAt)}
          </p>
          {source.limitations && (
            <p className="text-ink-muted mt-1 max-w-prose text-sm italic">
              Limiti di questa fonte: {source.limitations}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
