import type { Metadata } from 'next';
import { Prose } from '@/components/ui/primitives';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What data this site collects, which is almost none, explained in plain language.',
};

/**
 * §17 requires a privacy notice in plain language. It describes the site as it
 * is *today* — no analytics, no forms, no cookies — and must be updated in the
 * same change that introduces any of them, not afterwards.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>

      <Prose>
        <p className="text-ink-muted mt-4 text-lg">
          This site is used by young people, so it collects as little as
          possible. In plain language: we do not know who you are, and we are
          not trying to find out.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">What we do not collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>No account, so no name, email address or password</li>
          <li>No date of birth, school name, grades or family information</li>
          <li>No advertising or tracking cookies</li>
          <li>No precise location</li>
          <li>No selling or sharing of data with anyone</li>
        </ul>

        <h2 className="pt-6 text-2xl font-semibold">
          What happens when you use the site right now
        </h2>
        <p>
          At this stage the site is a set of static pages. Searching uses the
          address bar — your search term appears in the page URL, which is how
          you can share a result with someone — and it is not stored by us.
        </p>
        <p>
          Our hosting provider keeps standard server logs for a short period for
          security and reliability, as any website host does. We do not use
          those logs to build a profile of anyone.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          What will change, and when
        </h2>
        <p>
          We plan to add two things: a simple count of which pages get visited
          and which searches find nothing, so we know what to write next; and a
          feedback button so you can tell us a page was unclear. Both will work
          without an account and without identifying you. This page will be
          updated before either is switched on, not after.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">Links to other sites</h2>
        <p>
          Career pages link to official sources — ministries, statistics
          agencies, professional bodies. Those sites have their own privacy
          policies and we do not control them.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">Contact</h2>
        <p>
          If you have a question about privacy, or you want something removed,
          get in touch. Because we do not collect personal data, there is in
          normal use nothing of yours for us to hold or delete.
        </p>

        <p className="text-ink-muted pt-6 text-sm">
          {SITE.name} is based in {SITE.country.name}. Before any wider rollout
          to schools, this notice will be reviewed by someone qualified in
          Italian and EU data-protection law, particularly regarding minors.
        </p>
      </Prose>
    </div>
  );
}
