import type { Metadata } from 'next';
import Link from 'next/link';
import { Prose } from '@/components/ui/primitives';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'What Career Economics Lab is for, who it is for, and what it deliberately does not do.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">About {SITE.name}</h1>

      <Prose>
        <p className="text-ink-muted mt-4 text-lg">
          Good career information is unevenly distributed. Some students can ask
          a parent, a family friend or an alumni network what a job is really
          like, what it pays, and how people actually get in. Most cannot. This
          site exists to put that information in the same place for everyone.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">What it does</h2>
        <p>
          You type in a career. You get a page that explains, in plain language,
          what the work actually involves, what a typical day looks like, how
          people get in, what it pays, how competitive it is, what the downsides
          are, and what you could do now — with the source behind each important
          claim so you can check it yourself.
        </p>
        <p>
          Every page should take under ten minutes to read. If it takes longer
          than that to understand a career, we have written it badly.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">Who it is for</h2>
        <p>
          Students aged roughly 14 to 19, and the teachers, career advisers and
          parents helping them. It is designed to work on a cheap phone, on a
          slow connection, and on a school computer, because those are the
          conditions it will actually be used in.
        </p>

        <h2 className="pt-6 text-2xl font-semibold">
          What it deliberately does not do
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>No accounts. You never have to sign up or give us your name.</li>
          <li>No personality tests telling you what you should be.</li>
          <li>No advertising, and no selling of data.</li>
          <li>
            No motivational filler. Every career has downsides and we list them.
          </li>
          <li>
            No guarantees about getting in, getting hired, or getting paid.
          </li>
        </ul>

        <h2 className="pt-6 text-2xl font-semibold">Where it is up to</h2>
        <p>
          This is an early version. Career information currently covers{' '}
          {SITE.country.name} only, because entry routes for regulated
          professions are country-specific and doing one country properly is
          better than doing five badly. The number of careers is small and
          growing carefully — each one takes real research.
        </p>

        <p>
          <Link
            href="/methodology"
            className="text-accent underline underline-offset-4"
          >
            Read how we research and check careers
          </Link>
        </p>
      </Prose>
    </div>
  );
}
