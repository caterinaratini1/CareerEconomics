import type { Claim } from '@/lib/content/claim';
import type { Source } from '@/lib/content/schema';

/**
 * Renders a claim in a way that makes its evidence state impossible to miss.
 *
 * This is the component that carries product principles 6.3 and 6.4. Three
 * states, three visibly different treatments:
 *
 *   verified       — the value, plus the sources it rests on
 *   unverified     — the value, plus an explicit "not checked yet" marker
 *   not_researched — no value at all, and an honest statement of the gap
 *
 * The `not_researched` case is the one that matters most. The tempting design
 * is to hide the section when there is no data. That silently converts "we do
 * not know" into "there is nothing to know", which is the exact failure §6.3
 * is written to prevent — a student who sees no salary section concludes the
 * question does not apply, rather than that we have not answered it.
 *
 * Colour is never the only signal: every state carries a text label, per §18.
 */

interface ClaimValueProps<T> {
  claim: Claim<T>;
  sources: Source[];
  /** Renders the value once we know it exists. */
  children: (value: T) => React.ReactNode;
  /** Used in the gap message, e.g. "salary information". */
  label: string;
}

export function ClaimValue<T>({
  claim,
  sources,
  children,
  label,
}: ClaimValueProps<T>) {
  if (claim.state === 'not_researched') {
    return (
      <div className="border-evidence-missing/30 bg-evidence-missing-soft rounded border border-dashed p-4">
        <p className="text-ink font-medium">
          We have not researched {label} yet.
        </p>
        <p className="text-ink-muted mt-1 text-sm">
          We would rather leave this blank than guess. Until we have an official
          source, this section stays empty on purpose.
        </p>
      </div>
    );
  }

  if (claim.state === 'unverified') {
    return (
      <div className="border-evidence-draft/40 bg-evidence-draft-soft rounded border-l-4 p-4">
        <p className="text-evidence-draft mb-2 text-xs font-semibold tracking-wide uppercase">
          Draft — not yet checked against a source
        </p>
        <div className="text-ink">{children(claim.value)}</div>
        <p className="text-ink-muted mt-3 text-sm">
          Treat this as a working note rather than a fact. What is still needed:{' '}
          {claim.note}
        </p>
      </div>
    );
  }

  const cited = claim.sourceIds
    .map((id) => sources.find((s) => s.id === id))
    .filter((s): s is Source => s !== undefined);

  return (
    <div>
      <div className="text-ink">{children(claim.value)}</div>
      {claim.caveat && (
        <p className="text-ink-muted mt-2 text-sm italic">{claim.caveat}</p>
      )}
      <SourceCitations sources={cited} verifiedAt={claim.verifiedAt} />
    </div>
  );
}

function SourceCitations({
  sources,
  verifiedAt,
}: {
  sources: Source[];
  verifiedAt: string;
}) {
  if (sources.length === 0) return null;
  return (
    <p className="text-ink-muted mt-3 text-sm">
      <span className="text-evidence-verified font-medium">Source: </span>
      {sources.map((source, index) => (
        <span key={source.id}>
          {index > 0 && '; '}
          <a
            href={source.url}
            className="text-accent underline underline-offset-2"
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            {source.publisher}
          </a>
        </span>
      ))}
      . Checked {formatDate(verifiedAt)}.
    </p>
  );
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
