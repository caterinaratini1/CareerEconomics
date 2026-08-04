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
import { Badge, Disclosure, Prose, Section } from '@/components/ui/primitives';
import { evidenceLevel } from '@/lib/content/publication';
import { estimateReading } from '@/lib/content/reading-time';
import {
  DEFAULT_COUNTRY,
  careerRepository,
  profileForCountry,
} from '@/lib/content/repository';
import type { CareerProfile, CountryProfile } from '@/lib/content/schema';
import { CATEGORY_LABELS, LEVEL_LABELS, SITE } from '@/lib/site';

/**
 * The career page — §10's template, rendered from structured content.
 *
 * The section order follows the doc exactly, with one structural change: the
 * secondary sections sit inside native `<details>` so the core reading path
 * stays under the ten-minute budget in §4. The partition is enforced by
 * lib/content/reading-time.ts, so page and budget cannot drift apart silently.
 *
 * This is a server component with no client bundle. §19 asks for limited
 * JavaScript on a basic phone; a page that is entirely text has no reason to
 * ship any.
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
  if (!career) return { title: 'Career not found' };

  const isDraft = career.status !== 'published';
  return {
    title: `${career.canonicalName} in ${SITE.country.name}`,
    description: career.oneSentence,
    // Draft pages must never be indexed, whatever the site-wide default is.
    ...(isDraft ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical: `/careers/${career.slug}` },
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

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Header career={career} profile={profile} minutes={reading.coreMinutes} />

      <EvidenceNotice career={career} profile={profile} />

      <div className="mt-8">
        <QuickFacts profile={profile} />
      </div>

      <Section id="what" title="What does this person actually do?">
        <Prose>
          <p>{career.plainLanguageSummary}</p>
          <p>{career.whatTheyDo.overview}</p>
          <h3 className="pt-2 font-semibold">For example</h3>
          <ul className="list-disc space-y-2 pl-5">
            {career.whatTheyDo.concreteExamples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </Prose>
      </Section>

      <Section id="day" title="What does a typical day look like?">
        <Prose>
          <p>{career.typicalDay.overview}</p>
          <h3 className="pt-2 font-semibold">Common tasks</h3>
          <ul className="list-disc space-y-1 pl-5">
            {career.typicalDay.commonTasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
          <h3 className="pt-2 font-semibold">How much this varies</h3>
          <p>{career.typicalDay.howMuchItVaries}</p>
        </Prose>
      </Section>

      <Section
        id="how"
        title="How do you become one?"
        lead={`The usual route in ${SITE.country.name}. Each step is marked with how compulsory it really is.`}
      >
        <PathwaySteps profile={profile} />

        <Disclosure
          summary="Routes in, and which ones are actually required"
          hint={`${profile.educationRoutes.length} routes`}
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

      <Section id="requirements" title="Education and legal requirements">
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold">Qualifications</h3>
            <ClaimValue
              claim={profile.educationSummary}
              sources={career.sources}
              label="the qualifications needed"
            >
              {(value) => <p className="max-w-prose">{value}</p>}
            </ClaimValue>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Licensing and legal rules</h3>
            <ClaimValue
              claim={profile.regulation}
              sources={career.sources}
              label="the legal rules for this career"
            >
              {(value) => <p className="max-w-prose">{value}</p>}
            </ClaimValue>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">How long it takes</h3>
            <ClaimValue
              claim={profile.timeToEnter}
              sources={career.sources}
              label="how long this takes"
            >
              {(value) => (
                <div className="max-w-prose">
                  <p className="font-medium">
                    {value.minYears === value.maxYears
                      ? `About ${value.minYears} years`
                      : `About ${value.minYears}–${value.maxYears} years`}{' '}
                    from the end of school
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
        title="What does it pay?"
        lead="Pay is shown as a range, because it depends on where you work, who you work for, and how long you have been doing it."
      >
        <ClaimValue
          claim={profile.salary}
          sources={career.sources}
          label="pay for this career"
        >
          {(salary) => <SalaryDetail salary={salary} />}
        </ClaimValue>
      </Section>

      <Section id="competition" title="How competitive is it?">
        <ClaimValue
          claim={profile.competition}
          sources={career.sources}
          label="how competitive this career is"
        >
          {(value) => (
            <div className="max-w-prose">
              <p className="font-medium">
                Competition: {LEVEL_LABELS[value.level] ?? value.level}
              </p>
              <p className="mt-2">{value.whatThisMeans}</p>
            </div>
          )}
        </ClaimValue>
      </Section>

      <Section
        id="tradeoffs"
        title="Advantages and disadvantages"
        lead="The headlines are below. Open any one for the detail."
      >
        <div className="grid gap-8 md:grid-cols-2">
          <TradeoffColumn
            heading="Advantages"
            items={career.advantages}
            tone="verified"
          />
          <TradeoffColumn
            heading="Disadvantages"
            items={career.disadvantages}
            tone="draft"
          />
        </div>
      </Section>

      <Section
        id="misconceptions"
        title="Common misconceptions"
        lead="Things students often believe about this career that are not quite right."
      >
        <ul className="space-y-6">
          {career.misconceptions.map((item) => (
            <li key={item.belief} className="max-w-prose">
              <p className="text-ink-muted">
                <span className="sr-only">Common belief: </span>
                <span aria-hidden="true" className="font-semibold">
                  Belief:{' '}
                </span>
                {item.belief}
              </p>
              <p className="border-accent mt-2 border-l-2 pl-3">
                <span className="sr-only">In reality: </span>
                <span aria-hidden="true" className="font-semibold">
                  Actually:{' '}
                </span>
                {item.reality}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="now"
        title="What can I do now?"
        lead="Practical things that help. None of these is compulsory, and nobody is turned away for not having done them."
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

      <Section id="more" title="More about this career">
        <Disclosure summary="Who this career suits, and who it may not">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold">It may suit you if</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {career.suitability.suitsYouIf.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">It may not suit you if</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {career.suitability.mayNotSuitYouIf.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Disclosure>

        <Disclosure
          summary="Skills that matter"
          hint={`${career.skills.length} skills`}
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
          <Disclosure summary="What the future looks like">
            <ClaimValue
              claim={profile.outlook}
              sources={career.sources}
              label="the outlook for this career"
            >
              {(value) => <p className="max-w-prose">{value}</p>}
            </ClaimValue>
          </Disclosure>
        )}

        <Disclosure
          summary="Related careers"
          hint={`${career.relatedCareers.length} careers`}
        >
          <ul className="space-y-4">
            {career.relatedCareers.map((related) => {
              const linkable = related.slug && relatedSlugs.has(related.slug);
              return (
                <li key={related.name} className="max-w-prose">
                  <h4 className="font-semibold">
                    {linkable ? (
                      <Link
                        href={`/careers/${related.slug}`}
                        className="text-accent underline underline-offset-4"
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
        title="Sources"
        lead="Where the facts on this page come from, and when we last checked them."
      >
        <SourceList career={career} />
      </Section>

      <footer className="border-rule mt-12 border-t pt-6">
        <p className="text-ink-muted text-sm">
          This page covers {SITE.country.name}. Requirements, pay and
          competition differ in other countries.
        </p>
        <p className="mt-4">
          <Link
            href="/careers"
            className="text-accent underline underline-offset-4"
          >
            Back to all careers
          </Link>
        </p>
      </footer>
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
          href="/careers"
          className="hover:text-ink underline-offset-4 hover:underline"
        >
          Careers
        </Link>{' '}
        <span aria-hidden="true">/</span>{' '}
        {CATEGORY_LABELS[career.category] ?? career.category}
      </p>

      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        {career.canonicalName}
      </h1>
      <p className="text-ink-muted mt-3 max-w-prose text-lg">
        {career.oneSentence}
      </p>

      <p className="text-ink-muted mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span>{SITE.country.name}</span>
        <span aria-hidden="true">·</span>
        <span>Last reviewed {formatDate(profile.lastReviewedAt)}</span>
        <span aria-hidden="true">·</span>
        <span>About {minutes} minutes to read</span>
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
      aria-label="How reliable this page is"
      className="border-evidence-draft/40 bg-evidence-draft-soft mt-6 rounded border-l-4 p-4"
    >
      <p className="font-semibold">
        This page is a working draft, not a checked guide.
      </p>
      <p className="text-ink-muted mt-2 max-w-prose text-sm">
        The description of the work, the route in and the trade-offs are written
        by hand and are a fair picture of the career. The specific numbers —
        pay, how long it takes, how competitive it is — have not yet been
        confirmed against official sources, and some are missing entirely.
        Anything unchecked is marked where it appears.
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
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: salary.currency,
      maximumFractionDigits: 0,
    }).format(n);

  const bands = [
    { label: 'Starting out', band: salary.entry },
    { label: 'Experienced', band: salary.experienced },
    { label: 'Senior', band: salary.senior },
  ].filter(
    (row): row is { label: string; band: { min: number; max: number } } =>
      Boolean(row.band),
  );

  const basisLabel = salary.basis.startsWith('gross')
    ? 'before tax'
    : 'after tax';
  const periodLabel = salary.basis.endsWith('annual') ? 'a year' : 'a month';

  return (
    <div className="max-w-prose">
      <dl className="border-rule rounded border px-4">
        {bands.map((row) => (
          <div
            key={row.label}
            className="border-rule flex flex-wrap justify-between gap-2 border-b py-3 last:border-b-0"
          >
            <dt className="text-ink-muted">{row.label}</dt>
            <dd className="font-medium">
              {money(row.band.min)}–{money(row.band.max)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-ink-muted mt-2 text-sm">
        Figures are {basisLabel}, {periodLabel}.
      </p>

      <h3 className="mt-5 font-semibold">What moves these numbers</h3>
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
            <details className="border-rule group rounded border px-3 py-2">
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
