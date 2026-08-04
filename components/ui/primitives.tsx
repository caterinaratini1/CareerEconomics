import type { ReactNode } from 'react';

/** Small shared building blocks. Kept together — none is big enough to own a file. */

export function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="mt-12 scroll-mt-8">
      <h2
        id={`${id}-heading`}
        className="border-rule border-b pb-2 text-2xl font-semibold"
      >
        {title}
      </h2>
      {lead && <p className="text-ink-muted mt-3">{lead}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Native disclosure for secondary sections.
 *
 * `<details>` rather than a JS accordion: it is keyboard accessible and
 * screen-reader correct without a line of client code, it survives the
 * no-JavaScript check in §8, and browser find-in-page opens it automatically —
 * which a custom accordion silently breaks.
 */
export function Disclosure({
  summary,
  hint,
  children,
}: {
  summary: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <details className="border-rule group mt-4 rounded border">
      <summary className="hover:bg-paper-sunk flex items-center gap-3 px-4 py-3 font-medium">
        <span
          aria-hidden="true"
          className="text-ink-muted inline-block transition-transform group-open:rotate-90"
        >
          ▸
        </span>
        <span>{summary}</span>
        {hint && (
          <span className="text-ink-muted ml-auto text-sm font-normal">
            {hint}
          </span>
        )}
      </summary>
      <div className="border-rule border-t px-4 py-4">{children}</div>
    </details>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'verified' | 'draft' | 'missing';
}) {
  const tones = {
    neutral: 'bg-accent-soft text-accent',
    verified: 'bg-evidence-verified-soft text-evidence-verified',
    draft: 'bg-evidence-draft-soft text-evidence-draft',
    missing: 'bg-evidence-missing-soft text-evidence-missing',
  } as const;

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Definition-list row used by the quick-facts panel. */
export function Fact({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) {
  return (
    <div className="border-rule border-b py-3 last:border-b-0">
      <dt className="text-ink-muted text-sm">{term}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="max-w-prose space-y-4">{children}</div>;
}
