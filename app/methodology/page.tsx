import type { Metadata } from 'next';
import { Prose } from '@/components/ui/primitives';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'How we research careers',
  description:
    'Where our information comes from, how we check it, and what we do when ' +
    'we do not know something.',
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">
        How we research careers
      </h1>

      <Prose>
        <p className="text-ink-muted mt-4 text-lg">
          You should not have to take our word for anything. This page explains
          where our information comes from and how to tell how much to trust a
          given claim.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">Which sources we use</h2>
        <p>
          For facts that matter — pay, entry requirements, legal rules — we use
          official sources, in roughly this order of preference:
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Government ministries and official portals</li>
          <li>National statistical agencies</li>
          <li>Professional regulators and professional bodies</li>
          <li>Official university and examination authorities</li>
          <li>Public-sector careers services</li>
          <li>Reputable labour-market research</li>
          <li>
            Large salary datasets — used last, and only with their limitations
            stated on the page
          </li>
        </ol>
        <p>
          We do not use blogs, social media posts or content marketing for core
          facts. For a career whose entry rules are set by law, we cite the law
          or the official notice, not somebody&rsquo;s summary of it.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          How to tell what has been checked
        </h2>
        <p>
          Every important claim on a career page is in one of three states, and
          the page always tells you which:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Checked.</strong> The claim links to the source it came from
            and the date we last opened it.
          </li>
          <li>
            <strong>Unchecked draft.</strong> We have written something, but not
            yet confirmed it against a source. It is marked in place, and the
            page says what evidence is still needed.
          </li>
          <li>
            <strong>Not researched.</strong> We have not looked into it. The
            section stays on the page and says so, rather than disappearing —
            otherwise you could not tell the difference between a question with
            no answer and a question nobody asked.
          </li>
        </ul>
        <p>
          A career is only published once its pay, entry requirements, legal
          rules, timescale and competition are all in the first state, with at
          least two credible sources behind the page. This is checked
          automatically before anything goes live, not just by someone
          remembering.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">How we write about pay</h2>
        <p>
          We show ranges, never a single average. An average hides the thing you
          actually want to know, which is how wide the spread is and what moves
          you along it. We also always say whether a figure is before or after
          tax, and over what period, because in {SITE.country.name} those are
          reported inconsistently and the difference is large.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          How we write about competition
        </h2>
        <p>
          We avoid invented percentages. Where an official body publishes the
          number of places and the number of applicants, we show those. Where it
          does not, we explain what the competition is like in practice and say
          that the figures are not available.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          Where AI is and is not used
        </h2>
        <p>
          AI is not a source. It is not used to establish any fact on this site
          — no salary, no requirement, no probability comes from a language
          model. Career pages are written and reviewed by people working from
          the sources listed on each page.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          What we deliberately do not do
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            We do not tell you which career to choose. We describe careers; the
            decision is yours.
          </li>
          <li>
            We do not run personality or aptitude tests. There is no good
            evidence they predict what you will be good at.
          </li>
          <li>We do not guarantee admission, employment or earnings.</li>
          <li>
            We do not present optional activities as requirements. If something
            is genuinely optional, the page says so.
          </li>
        </ul>

        <h2 className="pt-6 text-2xl font-semibold">When something is wrong</h2>
        <p>
          Career rules change, and pages go stale. Every page carries the date
          it was last reviewed, and we re-check pages at least once a year. If
          you find something wrong, especially if you work in the field, we want
          to know.
        </p>
      </Prose>
    </div>
  );
}
