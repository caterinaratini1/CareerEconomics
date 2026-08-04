import Link from 'next/link';
import { Clock, Euro } from 'lucide-react';
import { Badge } from '@/components/ui/primitives';
import type { CareerSummary } from '@/lib/content/schema';
import { CATEGORY_LABELS, LEVEL_LABELS, SITE } from '@/lib/site';

const COMPETITION_TONE: Record<string, 'verified' | 'draft' | 'risk'> = {
  low: 'verified',
  moderate: 'draft',
  high: 'risk',
  'very-high': 'risk',
};

function formatSalary(salary: CareerSummary['salaryEntry']): string | null {
  if (!salary) return null;
  const format = (n: number) =>
    new Intl.NumberFormat(SITE.intlLocale, {
      notation: 'compact',
      maximumFractionDigits: 0,
    }).format(n);
  const period = salary.basis.endsWith('annual') ? 'anno' : 'mese';
  return `${format(salary.min)}–${format(salary.max)} ${salary.currency}/${period}`;
}

/**
 * Guide §10 "Career Cards": category badge, risk badge, title, short
 * description, years/salary/demand row, compare affordance. `competition`
 * doubles as the guide's risk/uncertainty badge — it is already a sourced
 * claim (see `lib/content/schema.ts`), so this reuses real data rather than
 * inventing a separate risk figure.
 */
export function CareerLibraryCard({
  career,
  matchedOn,
}: {
  career: CareerSummary;
  matchedOn?: string;
}) {
  const showMatch =
    matchedOn &&
    matchedOn.toLowerCase() !== career.canonicalName.toLowerCase() &&
    matchedOn !== career.oneSentence;
  const salaryLabel = formatSalary(career.salaryEntry);

  return (
    <li className="border-border bg-surface hover:border-primary shadow-soft rounded-card block border p-5 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Badge>{CATEGORY_LABELS[career.category] ?? career.category}</Badge>
          {career.status !== 'published' && <Badge tone="draft">Bozza</Badge>}
        </div>
        {career.competitionLevel && (
          <Badge tone={COMPETITION_TONE[career.competitionLevel] ?? 'draft'}>
            Competizione {LEVEL_LABELS[career.competitionLevel]}
          </Badge>
        )}
      </div>

      <h3 className="mt-3 text-lg font-semibold">
        <Link
          href={`/student/careers/${career.slug}`}
          className="text-ink hover:text-primary underline-offset-4 hover:underline"
        >
          {career.canonicalName}
        </Link>
      </h3>

      {showMatch && (
        <p className="text-ink-muted mt-1 text-sm">
          Detto anche <span className="font-medium">{matchedOn}</span>
        </p>
      )}

      <p className="text-ink-muted mt-2">{career.oneSentence}</p>

      <ul className="text-ink-muted mt-4 space-y-1.5 text-sm">
        {career.timeToEnterLabel && (
          <li className="flex items-center gap-2">
            <Clock aria-hidden="true" className="h-4 w-4 shrink-0" />
            {career.timeToEnterLabel}
          </li>
        )}
        <li className="flex items-center gap-2">
          <Euro aria-hidden="true" className="h-4 w-4 shrink-0" />
          {salaryLabel ?? 'Stipendio non ancora verificato'}
        </li>
      </ul>
    </li>
  );
}
