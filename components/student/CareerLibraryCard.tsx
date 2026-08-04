import Link from 'next/link';
import { Clock, Columns3, Euro } from 'lucide-react';
import { Badge } from '@/components/ui/primitives';
import type { CareerSummary } from '@/lib/content/schema';
import { CATEGORY_LABELS, LEVEL_LABELS, SITE } from '@/lib/site';
import { addCareerToComparison } from '@/lib/student-work/actions';

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
  selected = false,
  compareDisabled = false,
}: {
  career: CareerSummary;
  matchedOn?: string;
  selected?: boolean;
  compareDisabled?: boolean;
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

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <form action={addCareerToComparison.bind(null, career.slug)}>
          <button
            type="submit"
            disabled={selected || compareDisabled}
            className={
              selected
                ? 'bg-success rounded-control inline-flex min-h-10 items-center gap-2 px-3 py-2 text-sm font-medium text-white'
                : compareDisabled
                  ? 'border-border text-ink-muted rounded-control inline-flex min-h-10 items-center gap-2 border px-3 py-2 text-sm'
                  : 'border-primary text-primary hover:bg-primary-soft rounded-control inline-flex min-h-10 items-center gap-2 border px-3 py-2 text-sm font-medium'
            }
          >
            <Columns3 aria-hidden="true" className="h-4 w-4" />
            {selected ? 'Nel confronto' : 'Confronta'}
          </button>
        </form>
        <Link
          href={`/student/careers/${career.slug}`}
          className="text-primary rounded-control inline-flex min-h-10 items-center px-3 py-2 text-sm font-medium underline-offset-4 hover:underline"
        >
          Apri
        </Link>
      </div>
    </li>
  );
}
