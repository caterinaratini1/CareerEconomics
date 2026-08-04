import Link from 'next/link';

const STEPS = [
  { key: 'explore', href: '/student/careers', label: 'Esplora' },
  { key: 'compare', href: '/student/compare', label: 'Confronta' },
  { key: 'reflect', href: '/student/reflection', label: 'Rifletti' },
] as const;

/**
 * Guide §7: "Student should always know what step they are on." A plain
 * server-rendered list rather than a route-aware layout, so each page states
 * its own step explicitly instead of the nav guessing it from the URL.
 */
export function StepNav({
  current,
}: {
  current: (typeof STEPS)[number]['key'];
}) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {STEPS.map((step, index) => {
        const isCurrent = step.key === current;
        return (
          <li key={step.key} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden="true" className="text-ink-muted">
                →
              </span>
            )}
            <Link
              href={step.href}
              aria-current={isCurrent ? 'step' : undefined}
              className={
                isCurrent
                  ? 'bg-primary-soft text-primary rounded-pill px-3 py-1 font-medium'
                  : 'text-ink-muted hover:text-ink px-3 py-1 underline-offset-4 hover:underline'
              }
            >
              {step.label}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
