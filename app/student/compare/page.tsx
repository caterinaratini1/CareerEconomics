import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Clock,
  Euro,
  GraduationCap,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { StepNav } from '@/components/student/StepNav';
import { Badge } from '@/components/ui/primitives';
import { hasValue } from '@/lib/content/claim';
import { careerRepository, profileForCountry } from '@/lib/content/repository';
import type { CareerProfile, CountryProfile } from '@/lib/content/schema';
import { LEVEL_LABELS, SITE } from '@/lib/site';
import {
  removeCareerFromComparison,
  saveComparison,
} from '@/lib/student-work/actions';
import { getStudentWork } from '@/lib/student-work/state';
import { simulateCareerEconomics } from '@/lib/simulator/calculate';

export const metadata: Metadata = {
  title: 'Confronta le professioni',
};

interface ComparedCareer {
  career: CareerProfile;
  profile: CountryProfile;
  cost: number | null;
  netCost: number | null;
  breakEven: number | null;
}

export default async function ComparePage() {
  const work = await getStudentWork();
  const careers = (
    await Promise.all(
      work.comparedSlugs.map((slug) => careerRepository.getBySlug(slug)),
    )
  ).filter((career): career is CareerProfile => Boolean(career));

  const compared: ComparedCareer[] = [];
  for (const career of careers) {
    const profile = profileForCountry(career);
    if (profile) {
      compared.push({
        career,
        profile,
        ...defaultSimulation(profile),
      });
    }
  }

  return (
    <div className="app-shell max-w-6xl py-10 sm:py-14">
      <StepNav current="compare" />
      <div className="data-rule mt-7 pt-4">
        <p className="page-kicker">Decision desk</p>
        <h1 className="editorial-title mt-2">Confronta le professioni</h1>
      </div>

      {compared.length < 2 ? (
        <EmptyState count={compared.length} />
      ) : (
        <>
          <p className="text-ink-muted mt-3 max-w-prose">
            Guarda i compromessi, non una classifica. Il percorso più realistico
            può essere quello con tempi, costi e incertezza più sostenibili per
            te.
          </p>
          <form action={saveComparison} className="mt-8">
            <ComparisonGrid
              compared={compared}
              realisticSlug={work.realisticSlug}
            />
            <fieldset className="panel mt-8 p-5">
              <legend className="px-1 text-base font-semibold">
                Percorso più realistico per me
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {compared.map(({ career }) => (
                  <label
                    key={career.slug}
                    className="border-border has-checked:border-primary has-checked:bg-primary-soft rounded-control flex min-h-11 items-center gap-2 border px-3 py-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="realisticSlug"
                      value={career.slug}
                      defaultChecked={work.realisticSlug === career.slug}
                      className="h-4 w-4"
                    />
                    {career.canonicalName}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                className="button-primary rounded-control inline-flex min-h-11 items-center px-5 py-2.5 font-medium"
              >
                Salva confronto
              </button>
              <Link
                href="/student/reflection"
                className="border-border text-ink hover:border-primary rounded-control inline-flex min-h-11 items-center px-5 py-2.5 font-medium"
              >
                Continua alla riflessione
              </Link>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

function EmptyState({ count }: { count: number }) {
  return (
    <section className="panel-muted mt-8 p-6">
      <h2 className="text-xl font-semibold">Aggiungi almeno due professioni</h2>
      <p className="text-ink-muted mt-2 max-w-prose">
        Hai selezionato {count} professioni. Scegline almeno due, fino a tre,
        per vedere tempi, costi, stipendi e incertezza uno accanto
        all&apos;altro.
      </p>
      <Link
        href="/student/careers"
        className="button-primary rounded-control mt-5 inline-flex min-h-11 items-center px-5 py-2.5 font-medium"
      >
        Esplora professioni
      </Link>
    </section>
  );
}

function ComparisonGrid({
  compared,
  realisticSlug,
}: {
  compared: ComparedCareer[];
  realisticSlug: string | null;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="border-border bg-border border-t-ink grid min-w-[720px] gap-px overflow-hidden border border-t-2"
        style={{
          gridTemplateColumns: `12rem repeat(${compared.length}, minmax(12rem, 1fr))`,
        }}
      >
        <div className="bg-surface-muted p-3 text-sm font-medium">Dato</div>
        {compared.map(({ career }) => (
          <div key={career.slug} className="bg-surface p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="leading-snug font-semibold">
                  {career.canonicalName}
                </p>
                {realisticSlug === career.slug && (
                  <Badge tone="verified">Scelta realistica</Badge>
                )}
              </div>
              <form action={removeCareerFromComparison.bind(null, career.slug)}>
                <button
                  type="submit"
                  aria-label={`Rimuovi ${career.canonicalName}`}
                  title={`Rimuovi ${career.canonicalName}`}
                  className="text-ink-muted hover:text-risk rounded-control p-1"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        ))}

        <Row
          icon={<Clock aria-hidden="true" className="h-4 w-4" />}
          label="Anni per qualificarsi"
          values={compared.map(({ profile }) => timeToEnter(profile))}
        />
        <Row
          icon={<Euro aria-hidden="true" className="h-4 w-4" />}
          label="Costo totale stimato"
          values={compared.map(({ cost }) => formatMoney(cost))}
        />
        <Row
          icon={<Euro aria-hidden="true" className="h-4 w-4" />}
          label="Costo netto stimato"
          values={compared.map(({ netCost }) => formatMoney(netCost))}
        />
        <Row
          icon={<Euro aria-hidden="true" className="h-4 w-4" />}
          label="Stipendio iniziale"
          values={compared.map(({ profile }) => salaryLabel(profile, 'entry'))}
        />
        <Row
          icon={<Euro aria-hidden="true" className="h-4 w-4" />}
          label="Stipendio con esperienza"
          values={compared.map(({ profile }) =>
            salaryLabel(profile, 'experienced'),
          )}
        />
        <Row
          icon={<GraduationCap aria-hidden="true" className="h-4 w-4" />}
          label="Rientro stimato"
          values={compared.map(({ breakEven }) =>
            breakEven === null
              ? 'Non calcolabile'
              : `Circa ${breakEven} anni dopo la qualifica`,
          )}
        />
        <Row
          icon={<TriangleAlert aria-hidden="true" className="h-4 w-4" />}
          label="Incertezza"
          values={compared.map(({ profile }) => competitionLabel(profile))}
        />
        <Row
          label="Competenze chiave"
          values={compared.map(({ career }) =>
            career.skills
              .slice(0, 3)
              .map((skill) => skill.name)
              .join(', '),
          )}
        />
      </div>
    </div>
  );
}

function Row({
  label,
  values,
  icon,
}: {
  label: string;
  values: string[];
  icon?: ReactNode;
}) {
  return (
    <>
      <div className="bg-surface-muted flex items-center gap-2 p-3 text-sm font-medium">
        {icon}
        {label}
      </div>
      {values.map((value, index) => (
        <div key={`${label}-${index}`} className="bg-surface p-3 text-sm">
          {value}
        </div>
      ))}
    </>
  );
}

function defaultSimulation(profile: CountryProfile) {
  if (!hasValue(profile.timeToEnter) || !hasValue(profile.salary)) {
    return { cost: null, netCost: null, breakEven: null };
  }
  const result = simulateCareerEconomics({
    yearsToQualify: profile.timeToEnter.value.maxYears,
    entrySalaryMin: profile.salary.value.entry.min,
    entrySalaryMax: profile.salary.value.entry.max,
    location: 'local',
    living: 'at-home',
    hasScholarship: false,
    hasPartTimeWork: false,
  });
  return {
    cost: result.totalCostEUR,
    netCost: result.netCostEUR,
    breakEven: result.breakEvenYears,
  };
}

function timeToEnter(profile: CountryProfile): string {
  if (!hasValue(profile.timeToEnter)) return 'Non verificato';
  const { minYears, maxYears } = profile.timeToEnter.value;
  return minYears === maxYears
    ? `${minYears} anni`
    : `${minYears}-${maxYears} anni`;
}

function salaryLabel(
  profile: CountryProfile,
  band: 'entry' | 'experienced',
): string {
  if (!hasValue(profile.salary)) return 'Non verificato';
  const salary = profile.salary.value;
  const value = band === 'entry' ? salary.entry : salary.experienced;
  if (!value) return 'Non verificato';
  return `${formatMoney(value.min)}-${formatMoney(value.max)}`;
}

function competitionLabel(profile: CountryProfile): string {
  if (!hasValue(profile.competition)) return 'Non verificata';
  const level = profile.competition.value.level;
  return `${LEVEL_LABELS[level]}: ${profile.competition.value.whatThisMeans}`;
}

function formatMoney(value: number | null): string {
  if (value === null) return 'Non verificato';
  return new Intl.NumberFormat(SITE.intlLocale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}
