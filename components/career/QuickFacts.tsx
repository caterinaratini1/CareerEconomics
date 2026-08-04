import { hasValue, type Claim } from '@/lib/content/claim';
import type { CountryProfile, Salary } from '@/lib/content/schema';
import { LEVEL_LABELS, SITE } from '@/lib/site';
import { Fact } from '@/components/ui/primitives';

/**
 * §10.2 quick facts.
 *
 * Every row is present whatever the evidence state, because an absent row
 * reads as "not applicable" rather than "not known". Unknown values say so.
 */
export function QuickFacts({ profile }: { profile: CountryProfile }) {
  return (
    <dl className="border-border bg-surface-muted rounded border px-4">
      <Fact term="Quanto tempo serve per entrarci">
        <ClaimSummary claim={profile.timeToEnter}>
          {(value) =>
            value.minYears === value.maxYears
              ? `Circa ${value.minYears} anni dopo la scuola`
              : `Circa ${value.minYears}–${value.maxYears} anni dopo la scuola`
          }
        </ClaimSummary>
      </Fact>

      <Fact term="Stipendio iniziale">
        <ClaimSummary claim={profile.salary}>
          {(value) => formatBand(value, 'entry')}
        </ClaimSummary>
      </Fact>

      <Fact term="Stipendio con esperienza">
        <ClaimSummary claim={profile.salary}>
          {(value) => formatBand(value, 'senior')}
        </ClaimSummary>
      </Fact>

      <Fact term="Studi di solito necessari">
        <ClaimSummary claim={profile.educationSummary}>
          {(value) => truncate(value, 120)}
        </ClaimSummary>
      </Fact>

      <Fact term="Quanto è competitivo">
        <ClaimSummary claim={profile.competition}>
          {(value) => LEVEL_LABELS[value.level] ?? value.level}
        </ClaimSummary>
      </Fact>

      <Fact term="Dove si lavora">{profile.workEnvironment.join(' · ')}</Fact>
    </dl>
  );
}

/**
 * Compact claim rendering for the facts panel.
 *
 * The full `ClaimValue` treatment is too heavy for a summary table, but the
 * evidence state still has to survive — so unverified values are suffixed with
 * a text marker rather than being shown bare.
 */
function ClaimSummary<T>({
  claim,
  children,
}: {
  claim: Claim<T>;
  children: (value: T) => React.ReactNode;
}) {
  if (!hasValue(claim)) {
    return (
      <span className="text-ink-muted font-normal italic">Non verificato</span>
    );
  }
  return (
    <>
      {children(claim.value)}
      {claim.state === 'unverified' && (
        <span className="text-evidence-draft ml-2 text-xs font-normal">
          (bozza non verificata)
        </span>
      )}
    </>
  );
}

const BASIS_LABELS: Record<Salary['basis'], string> = {
  'gross-annual': 'lordi all’anno',
  'net-annual': 'netti all’anno',
  'gross-monthly': 'lordi al mese',
  'net-monthly': 'netti al mese',
};

export function formatBand(salary: Salary, which: 'entry' | 'senior'): string {
  const band = which === 'entry' ? salary.entry : (salary.senior ?? null);
  if (!band) return 'Non verificato';

  const money = (n: number) =>
    new Intl.NumberFormat(SITE.intlLocale, {
      style: 'currency',
      currency: salary.currency,
      maximumFractionDigits: 0,
    }).format(n);

  // §10.7: always a range, never a single average.
  const range =
    band.min === band.max
      ? money(band.min)
      : `${money(band.min)}–${money(band.max)}`;
  return `${range} ${BASIS_LABELS[salary.basis]}`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}
