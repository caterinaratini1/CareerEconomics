import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ClaimValue, formatDate } from '@/components/career/ClaimValue';
import {
  PathwaySteps,
  RequirementBadge,
} from '@/components/career/PathwaySteps';
import { QuickFacts } from '@/components/career/QuickFacts';
import { SourceList } from '@/components/career/SourceList';
import { CareerSimulator } from '@/components/student/CareerSimulator';
import { StepNav } from '@/components/student/StepNav';
import { Badge, Disclosure, Prose, Section } from '@/components/ui/primitives';
import { hasValue } from '@/lib/content/claim';
import { evidenceLevel } from '@/lib/content/publication';
import { estimateReading } from '@/lib/content/reading-time';
import {
  DEFAULT_COUNTRY,
  careerRepository,
  profileForCountry,
} from '@/lib/content/repository';
import type { CareerProfile, CountryProfile } from '@/lib/content/schema';
import { CATEGORY_LABELS, LEVEL_LABELS, SITE } from '@/lib/site';
import { addCareerToComparison } from '@/lib/student-work/actions';
import { getStudentWork } from '@/lib/student-work/state';

/**
 * The career page — §10's template, rendered from structured content, plus
 * the guide's simulator layer (§8 step 4) on top. The evidentiary sections
 * below (pathway, requirements, sources, …) are unchanged from the original
 * Phase 1 template: that content is the actual product, the simulator is an
 * addition, not a replacement.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await careerRepository.listSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const career = await careerRepository.getBySlug(slug);
  if (!career) return { title: 'Professione non trovata' };

  const isDraft = career.status !== 'published';
  return {
    title: `${career.canonicalName} in ${SITE.country.name}`,
    description: career.oneSentence,
    // Draft pages must never be indexed, whatever the site-wide default is.
    ...(isDraft ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical: `/student/careers/${career.slug}` },
    openGraph: {
      title: `${career.canonicalName} — ${SITE.name}`,
      description: career.oneSentence,
      type: 'article',
    },
  };
}

export default async function CareerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const career = await careerRepository.getBySlug(slug);
  if (!career) notFound();

  const profile = profileForCountry(career, DEFAULT_COUNTRY);
  if (!profile) notFound();

  const reading = estimateReading(career, DEFAULT_COUNTRY);
  const relatedSlugs = new Set(await careerRepository.listSlugs());
  const work = await getStudentWork();
  const alreadyCompared = work.comparedSlugs.includes(career.slug);
  const compareFull = work.comparedSlugs.length >= 3 && !alreadyCompared;

  return (
    <article className="app-shell max-w-6xl py-8 sm:py-10">
      <StepNav current="explore" />

      <div className="career-detail-layout">
        <div className="career-detail-main">
          <div className="career-detail-header-panel">
            <Header
              career={career}
              profile={profile}
              minutes={reading.coreMinutes}
            />
          </div>

          <EvidenceNotice career={career} profile={profile} />

          <Section
            id="simulator"
            title="Simula il tuo percorso"
            lead="Cambia le ipotesi qui sotto per vedere come cambiano costi e rientro. Sono stime che puoi regolare, non dati verificati su questa professione."
          >
            {hasValue(profile.salary) && hasValue(profile.timeToEnter) ? (
              <CareerSimulator
                yearsToQualify={
                  (profile.timeToEnter.value.minYears +
                    profile.timeToEnter.value.maxYears) /
                  2
                }
                entrySalaryMin={profile.salary.value.entry.min}
                entrySalaryMax={profile.salary.value.entry.max}
                currency={profile.salary.value.currency}
              />
            ) : (
              <p className="text-ink-muted border-border bg-surface-muted rounded-card border p-4 text-sm">
                Il simulatore ha bisogno dello stipendio e del tempo per
                entrarci, e per questa professione non sono ancora stati
                verificati.
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <form action={addCareerToComparison.bind(null, career.slug)}>
                <button
                  type="submit"
                  disabled={alreadyCompared || compareFull}
                  className={
                    alreadyCompared
                      ? 'bg-success rounded-control inline-flex min-h-10 items-center px-4 py-2 text-sm font-medium text-white'
                      : compareFull
                        ? 'border-border text-ink-muted rounded-control inline-flex min-h-10 items-center border px-4 py-2 text-sm'
                        : 'border-primary text-primary hover:bg-primary-soft rounded-control inline-flex min-h-10 items-center border px-4 py-2 text-sm font-medium'
                  }
                >
                  {alreadyCompared
                    ? 'Gia nel confronto'
                    : 'Aggiungi al confronto'}
                </button>
              </form>
              {work.comparedSlugs.length > 0 && (
                <Link
                  href="/student/compare"
                  className="text-primary text-sm font-medium underline underline-offset-4"
                >
                  Vai al confronto ({work.comparedSlugs.length}/3)
                </Link>
              )}
            </div>
          </Section>

          <Section
            id="what"
            title="Che cosa fa davvero chi svolge questo lavoro?"
          >
            <Prose>
              <p>{career.plainLanguageSummary}</p>
              <p>{career.whatTheyDo.overview}</p>
              <h3 className="pt-2 font-semibold">Per esempio</h3>
              <ul className="list-disc space-y-2 pl-5">
                {career.whatTheyDo.concreteExamples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </Prose>
          </Section>

          <Section id="day" title="Com’è una giornata tipo?">
            <Prose>
              <p>{career.typicalDay.overview}</p>
              <h3 className="pt-2 font-semibold">Cosa si fa più spesso</h3>
              <ul className="list-disc space-y-1 pl-5">
                {career.typicalDay.commonTasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
              <h3 className="pt-2 font-semibold">
                Quanto cambia da caso a caso
              </h3>
              <p>{career.typicalDay.howMuchItVaries}</p>
            </Prose>
          </Section>

          <Section
            id="how"
            title="Come si diventa?"
            lead={`Il percorso più comune in ${SITE.country.name}. Per ogni passo trovi scritto quanto è davvero obbligatorio.`}
          >
            <PathwaySteps profile={profile} />

            <Disclosure
              summary="I percorsi di studio, e quali servono davvero"
              hint={`${profile.educationRoutes.length} percorsi`}
            >
              <ul className="space-y-5">
                {profile.educationRoutes.map((route) => (
                  <li key={route.name}>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h4 className="font-semibold">{route.name}</h4>
                      <RequirementBadge requirement={route.requirement} />
                    </div>
                    <p className="mt-1 max-w-prose">{route.description}</p>
                    {route.notes && (
                      <p className="text-ink-muted mt-1 max-w-prose text-sm">
                        {route.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Disclosure>
          </Section>

          <Section id="requirements" title="Studi e requisiti di legge">
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 font-semibold">Titoli di studio</h3>
                <ClaimValue
                  claim={profile.educationSummary}
                  sources={career.sources}
                  label="i titoli di studio richiesti"
                >
                  {(value) => <p className="max-w-prose">{value}</p>}
                </ClaimValue>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">
                  Abilitazioni e regole di legge
                </h3>
                <ClaimValue
                  claim={profile.regulation}
                  sources={career.sources}
                  label="le regole di legge di questa professione"
                >
                  {(value) => <p className="max-w-prose">{value}</p>}
                </ClaimValue>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Quanto tempo ci vuole</h3>
                <ClaimValue
                  claim={profile.timeToEnter}
                  sources={career.sources}
                  label="quanto tempo ci vuole"
                >
                  {(value) => (
                    <div className="max-w-prose">
                      <p className="font-medium">
                        {value.minYears === value.maxYears
                          ? `Circa ${value.minYears} anni`
                          : `Circa ${value.minYears}–${value.maxYears} anni`}{' '}
                        dalla fine della scuola superiore
                      </p>
                      <p className="mt-1">{value.notes}</p>
                    </div>
                  )}
                </ClaimValue>
              </div>
            </div>
          </Section>

          <Section
            id="pay"
            title="Quanto si guadagna?"
            lead="Lo stipendio è indicato come intervallo, perché dipende da dove lavori, per chi lavori e da quanti anni fai questo mestiere."
          >
            <ClaimValue
              claim={profile.salary}
              sources={career.sources}
              label="gli stipendi di questa professione"
            >
              {(salary) => <SalaryDetail salary={salary} />}
            </ClaimValue>
          </Section>

          <Section id="competition" title="Quanto è competitivo?">
            <ClaimValue
              claim={profile.competition}
              sources={career.sources}
              label="quanto è competitiva questa professione"
            >
              {(value) => (
                <div className="max-w-prose">
                  <p className="font-medium">
                    Competizione: {LEVEL_LABELS[value.level] ?? value.level}
                  </p>
                  <p className="mt-2">{value.whatThisMeans}</p>
                </div>
              )}
            </ClaimValue>
          </Section>

          <Section
            id="tradeoffs"
            title="Vantaggi e svantaggi"
            lead="Qui sotto trovi i titoli. Apri quelli che ti interessano per leggere i dettagli."
          >
            <div className="grid gap-8 md:grid-cols-2">
              <TradeoffColumn
                heading="Vantaggi"
                items={career.advantages}
                tone="verified"
              />
              <TradeoffColumn
                heading="Svantaggi"
                items={career.disadvantages}
                tone="draft"
              />
            </div>
          </Section>

          <Section
            id="misconceptions"
            title="Idee sbagliate più diffuse"
            lead="Cose che si danno per scontate su questa professione e che invece non sono proprio così."
          >
            <ul className="space-y-6">
              {career.misconceptions.map((item) => (
                <li key={item.belief} className="max-w-prose">
                  <p className="text-ink-muted">
                    <span className="sr-only">Idea diffusa: </span>
                    <span aria-hidden="true" className="font-semibold">
                      Si dice che:{' '}
                    </span>
                    {item.belief}
                  </p>
                  <p className="border-primary mt-2 border-l-2 pl-3">
                    <span className="sr-only">In realtà: </span>
                    <span aria-hidden="true" className="font-semibold">
                      In realtà:{' '}
                    </span>
                    {item.reality}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            id="now"
            title="Cosa puoi fare fin da ora"
            lead="Cose concrete che aiutano. Nessuna è obbligatoria e nessuno viene escluso per non averle fatte."
          >
            <ul className="space-y-5">
              {profile.whatYouCanDoNow.map((item) => (
                <li key={item.action} className="max-w-prose">
                  <h3 className="font-semibold">{item.action}</h3>
                  {item.whenApplicable && (
                    <p className="text-ink-muted mt-0.5 text-sm">
                      {item.whenApplicable}
                    </p>
                  )}
                  <p className="mt-1">{item.why}</p>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="more" title="Altro su questa professione">
            <Disclosure summary="A chi può piacere questo lavoro, e a chi no">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold">Potrebbe fare per te se</h4>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {career.suitability.suitsYouIf.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Potrebbe non fare per te se</h4>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {career.suitability.mayNotSuitYouIf.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Disclosure>

            <Disclosure
              summary="Le capacità che contano"
              hint={`${career.skills.length} capacità`}
            >
              <ul className="space-y-3">
                {career.skills.map((skill) => (
                  <li key={skill.name} className="max-w-prose">
                    <span className="font-semibold">{skill.name}</span>{' '}
                    <Badge>
                      {LEVEL_LABELS[skill.importance] ?? skill.importance}
                    </Badge>
                    <p className="text-ink-muted mt-0.5">{skill.why}</p>
                  </li>
                ))}
              </ul>
            </Disclosure>

            {profile.outlook && (
              <Disclosure summary="Come sono le prospettive">
                <ClaimValue
                  claim={profile.outlook}
                  sources={career.sources}
                  label="le prospettive di questa professione"
                >
                  {(value) => <p className="max-w-prose">{value}</p>}
                </ClaimValue>
              </Disclosure>
            )}

            <Disclosure
              summary="Professioni simili"
              hint={`${career.relatedCareers.length} professioni`}
            >
              <ul className="space-y-4">
                {career.relatedCareers.map((related) => {
                  const linkable =
                    related.slug && relatedSlugs.has(related.slug);
                  return (
                    <li key={related.name} className="max-w-prose">
                      <h4 className="font-semibold">
                        {linkable ? (
                          <Link
                            href={`/student/careers/${related.slug}`}
                            className="text-primary underline underline-offset-4"
                          >
                            {related.name}
                          </Link>
                        ) : (
                          related.name
                        )}
                      </h4>
                      <p className="text-ink-muted mt-0.5">
                        {related.howItDiffers}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Disclosure>
          </Section>

          <Section
            id="sources"
            title="Fonti"
            lead="Da dove vengono le informazioni di questa pagina e quando le abbiamo controllate l’ultima volta."
          >
            <SourceList career={career} />
          </Section>

          <footer className="border-border mt-12 border-t pt-6">
            <p className="text-ink-muted text-sm">
              Questa pagina riguarda l’{SITE.country.name}. In altri paesi
              requisiti, stipendi e livello di competizione sono diversi.
            </p>
            <p className="mt-4">
              <Link
                href="/student/careers"
                className="text-primary underline underline-offset-4"
              >
                Torna a tutte le professioni
              </Link>
            </p>
          </footer>
        </div>

        <aside
          className="career-detail-aside"
          aria-labelledby="quick-facts-heading"
        >
          <div className="career-detail-facts">
            <p className="page-kicker">In sintesi</p>
            <h2
              id="quick-facts-heading"
              className="mt-2 text-2xl font-semibold"
            >
              A colpo d’occhio
            </h2>
            <div className="mt-4">
              <QuickFacts profile={profile} />
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------

function Header({
  career,
  profile,
  minutes,
}: {
  career: CareerProfile;
  profile: CountryProfile;
  minutes: number;
}) {
  return (
    <header>
      <p className="text-ink-muted text-sm">
        <Link
          href="/student/careers"
          className="hover:text-ink underline-offset-4 hover:underline"
        >
          Professioni
        </Link>{' '}
        <span aria-hidden="true">/</span>{' '}
        {CATEGORY_LABELS[career.category] ?? career.category}
      </p>

      <h1 className="editorial-title mt-2">{career.canonicalName}</h1>
      <p className="text-ink-muted mt-3 max-w-prose text-lg">
        {career.oneSentence}
      </p>

      <p className="text-ink-muted mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span>{SITE.country.name}</span>
        <span aria-hidden="true">·</span>
        <span>Aggiornata il {formatDate(profile.lastReviewedAt)}</span>
        <span aria-hidden="true">·</span>
        <span>{minutes} minuti di lettura circa</span>
      </p>
    </header>
  );
}

/**
 * §6.3 transparent uncertainty, made unmissable.
 *
 * Placed above the quick facts rather than at the bottom of the page: a reader
 * needs to know how much to trust a number *before* they read it, not after.
 */
function EvidenceNotice({
  career,
  profile,
}: {
  career: CareerProfile;
  profile: CountryProfile;
}) {
  const level = evidenceLevel(profile);
  if (level === 'verified' && career.status === 'published') return null;

  return (
    <aside
      aria-label="Quanto è affidabile questa pagina"
      className="border-evidence-draft/40 bg-evidence-draft-soft rounded-card mt-6 border-l-4 p-4"
    >
      <p className="font-semibold">
        Questa pagina è una bozza di lavoro, non una guida verificata.
      </p>
      <p className="text-ink-muted mt-2 max-w-prose text-sm">
        La descrizione del lavoro, il percorso per arrivarci e i pro e contro
        sono scritti a mano e danno un quadro corretto della professione. I
        numeri precisi — stipendi, tempi, quanto è competitiva — non sono ancora
        stati confermati su fonti ufficiali e alcuni mancano del tutto. Tutto
        ciò che non è verificato è segnalato dove compare.
      </p>
    </aside>
  );
}

function SalaryDetail({
  salary,
}: {
  salary: NonNullable<
    Extract<CountryProfile['salary'], { value: unknown }>
  >['value'];
}) {
  const money = (n: number) =>
    new Intl.NumberFormat(SITE.intlLocale, {
      style: 'currency',
      currency: salary.currency,
      maximumFractionDigits: 0,
    }).format(n);

  const bands = [
    { label: 'All’inizio', band: salary.entry },
    { label: 'Con esperienza', band: salary.experienced },
    { label: 'Ai livelli alti', band: salary.senior },
  ].filter(
    (row): row is { label: string; band: { min: number; max: number } } =>
      Boolean(row.band),
  );

  const basisLabel = salary.basis.startsWith('gross')
    ? 'al lordo delle tasse'
    : 'al netto delle tasse';
  const periodLabel = salary.basis.endsWith('annual') ? 'all’anno' : 'al mese';

  return (
    <div className="max-w-prose">
      <dl className="border-border rounded-card border px-4">
        {bands.map((row) => (
          <div
            key={row.label}
            className="border-border flex flex-wrap justify-between gap-2 border-b py-3 last:border-b-0"
          >
            <dt className="text-ink-muted">{row.label}</dt>
            <dd className="font-medium">
              {money(row.band.min)}–{money(row.band.max)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-ink-muted mt-2 text-sm">
        Le cifre sono {basisLabel}, {periodLabel}.
      </p>

      <h3 className="mt-5 font-semibold">Cosa fa cambiare queste cifre</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {salary.factorsAffectingPay.map((factor) => (
          <li key={factor}>{factor}</li>
        ))}
      </ul>
    </div>
  );
}

function TradeoffColumn({
  heading,
  items,
  tone,
}: {
  heading: string;
  items: { title: string; detail: string }[];
  tone: 'verified' | 'draft';
}) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">
        <Badge tone={tone}>{heading}</Badge>
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.title}>
            <details className="border-border rounded-card group border px-3 py-2">
              <summary className="flex items-start gap-2 font-medium">
                <span
                  aria-hidden="true"
                  className="text-ink-muted mt-0.5 inline-block text-xs transition-transform group-open:rotate-90"
                >
                  ▸
                </span>
                <span>{item.title}</span>
              </summary>
              <p className="text-ink-muted mt-2 pl-5">{item.detail}</p>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
