import type { CareerProfile } from '@/lib/content/schema';
import { formatDate } from './ClaimValue';

const AUTHORITY_LABELS: Record<string, string> = {
  'official-government': 'Government',
  'national-statistics': 'National statistics',
  'professional-body': 'Professional body',
  'academic-institution': 'University or examining body',
  'public-career-portal': 'Public careers service',
  'labour-market-research': 'Labour-market research',
  'salary-dataset': 'Salary dataset',
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
        <p className="font-medium">No sources are attached to this page yet.</p>
        <p className="text-ink-muted mt-2 max-w-prose text-sm">
          This career is a working draft. We publish a page only once its key
          facts — pay, entry requirements, and the legal rules — are each backed
          by an official source. Until then, use it to understand the shape of
          the career, and check anything specific yourself.
        </p>
        {career.editorial.openQuestions.length > 0 && (
          <details className="mt-4">
            <summary className="text-sm font-medium">
              What we still need to check (
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
          className="border-rule border-b pb-4 last:border-b-0"
        >
          <a
            href={source.url}
            className="text-accent font-medium underline underline-offset-2"
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            {source.title}
          </a>
          <p className="text-ink-muted mt-1 text-sm">
            {source.publisher} ·{' '}
            {AUTHORITY_LABELS[source.authorityLevel] ?? source.authorityLevel}
            {source.publicationDate &&
              ` · published ${formatDate(source.publicationDate)}`}{' '}
            · we checked it on {formatDate(source.accessedAt)}
          </p>
          {source.limitations && (
            <p className="text-ink-muted mt-1 max-w-prose text-sm italic">
              Limitations: {source.limitations}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
