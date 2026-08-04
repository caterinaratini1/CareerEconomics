'use client';

import { useState, type ReactNode } from 'react';
import {
  simulateCareerEconomics,
  type SimulationInput,
} from '@/lib/simulator/calculate';
import type {
  LivingSituation,
  StudyLocation,
} from '@/lib/simulator/assumptions';
import { SITE } from '@/lib/site';

const LOCATION_OPTIONS: { value: StudyLocation; label: string }[] = [
  { value: 'local', label: 'Nella tua città' },
  { value: 'elsewhere-in-italy', label: 'Altrove in Italia' },
  { value: 'abroad', label: 'All’estero' },
];

const LIVING_OPTIONS: { value: LivingSituation; label: string }[] = [
  { value: 'at-home', label: 'A casa' },
  { value: 'renting', label: 'In affitto' },
];

/**
 * Guide §8 step 4: simulator controls that update the result without a page
 * reload. This is the one deliberate client component in the codebase
 * outside `app/error.tsx` — see docs/DECISIONS.md for why that's a scoped
 * exception rather than a quiet abandonment of the site's no-JS bias.
 *
 * The inputs (location, living, scholarship, part-time) are the student's own
 * assumptions, not claims about the career — only `yearsToQualify` and the
 * salary band come from sourced content. The result is always labeled an
 * estimate (see lib/simulator/assumptions.ts for why).
 */
export function CareerSimulator({
  yearsToQualify,
  entrySalaryMin,
  entrySalaryMax,
  currency,
}: {
  yearsToQualify: number;
  entrySalaryMin: number;
  entrySalaryMax: number;
  currency: string;
}) {
  const [location, setLocation] = useState<StudyLocation>('local');
  const [living, setLiving] = useState<LivingSituation>('at-home');
  const [hasScholarship, setHasScholarship] = useState(false);
  const [scholarshipAmount, setScholarshipAmount] = useState('');
  const [hasPartTimeWork, setHasPartTimeWork] = useState(false);

  const input: SimulationInput = {
    yearsToQualify,
    entrySalaryMin,
    entrySalaryMax,
    location,
    living,
    hasScholarship,
    scholarshipAmountEUR: scholarshipAmount
      ? Number(scholarshipAmount)
      : undefined,
    hasPartTimeWork,
  };
  const result = simulateCareerEconomics(input);

  const money = (n: number) =>
    new Intl.NumberFormat(SITE.intlLocale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="border-border bg-surface rounded-card border p-5 sm:p-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset>
          <legend className="text-sm font-medium">Dove studi</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {LOCATION_OPTIONS.map((opt) => (
              <SegmentButton
                key={opt.value}
                active={location === opt.value}
                onClick={() => setLocation(opt.value)}
              >
                {opt.label}
              </SegmentButton>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">Dove vivi</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {LIVING_OPTIONS.map((opt) => (
              <SegmentButton
                key={opt.value}
                active={living === opt.value}
                onClick={() => setLiving(opt.value)}
              >
                {opt.label}
              </SegmentButton>
            ))}
          </div>
        </fieldset>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={hasScholarship}
              onChange={(e) => setHasScholarship(e.target.checked)}
              className="h-4 w-4"
            />
            Ho (o potrei avere) una borsa di studio
          </label>
          {hasScholarship && (
            <label className="text-ink-muted mt-2 block text-sm">
              Importo annuo, se lo sai (facoltativo)
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={scholarshipAmount}
                onChange={(e) => setScholarshipAmount(e.target.value)}
                placeholder="es. 3000"
                className="border-border bg-surface text-ink focus:border-primary rounded-control mt-1 w-full border px-3 py-2 text-sm"
              />
            </label>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={hasPartTimeWork}
            onChange={(e) => setHasPartTimeWork(e.target.checked)}
            className="h-4 w-4"
          />
          Penso di lavorare part-time durante gli studi
        </label>
      </div>

      <div className="border-border bg-surface-muted rounded-card mt-6 border p-4">
        <p className="text-ink-muted text-xs">
          Stima, non un dato verificato — cambia i controlli sopra per vedere
          come cambia il conto.
        </p>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-ink-muted text-sm">Costo totale stimato</dt>
            <dd className="text-lg font-semibold">
              {money(result.totalCostEUR)}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted text-sm">Costo netto stimato</dt>
            <dd className="text-lg font-semibold">
              {money(result.netCostEUR)}
            </dd>
          </div>
          <div>
            <dt className="text-ink-muted text-sm">Rientro stimato</dt>
            <dd className="text-lg font-semibold">
              {result.breakEvenYears !== null
                ? `Circa ${result.breakEvenYears} anni dopo la qualifica`
                : 'Non calcolabile con questi dati'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'bg-primary rounded-pill px-3 py-1.5 text-sm font-medium text-white'
          : 'border-border text-ink-muted hover:text-ink rounded-pill border px-3 py-1.5 text-sm'
      }
    >
      {children}
    </button>
  );
}
