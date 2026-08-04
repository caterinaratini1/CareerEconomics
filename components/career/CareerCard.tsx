import Link from 'next/link';
import type { CareerSummary } from '@/lib/content/schema';
import { CATEGORY_LABELS } from '@/lib/site';
import { Badge } from '@/components/ui/primitives';

/**
 * §12.2 search-result format: name, one sentence, category, time to enter,
 * and the main education requirement — enough to decide whether to open it.
 */
export function CareerCard({
  career,
  matchedOn,
}: {
  career: CareerSummary;
  /** Shown when the match came from an alias, so the ranking is explicable. */
  matchedOn?: string;
}) {
  const showMatch =
    matchedOn &&
    matchedOn.toLowerCase() !== career.canonicalName.toLowerCase() &&
    matchedOn !== career.oneSentence;

  return (
    <li className="border-rule hover:border-accent rounded border p-4 transition-colors">
      <h3 className="text-lg font-semibold">
        <Link
          href={`/careers/${career.slug}`}
          className="text-ink hover:text-accent underline-offset-4 hover:underline"
        >
          {career.canonicalName}
        </Link>
      </h3>

      {showMatch && (
        <p className="text-ink-muted mt-1 text-sm">
          Also known as <span className="font-medium">{matchedOn}</span>
        </p>
      )}

      <p className="text-ink-muted mt-2 max-w-prose">{career.oneSentence}</p>

      <ul className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <li>
          <Badge>{CATEGORY_LABELS[career.category] ?? career.category}</Badge>
        </li>
        {career.timeToEnterLabel && (
          <li className="text-ink-muted">
            · {career.timeToEnterLabel} to enter
          </li>
        )}
        {career.educationLabel && (
          <li className="text-ink-muted">· {career.educationLabel}</li>
        )}
        {career.status !== 'published' && (
          <li>
            <Badge tone="draft">Draft</Badge>
          </li>
        )}
      </ul>
    </li>
  );
}
