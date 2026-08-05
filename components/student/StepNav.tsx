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
    <ol className="student-step-nav border-border flex overflow-x-auto border-b text-sm">
      {STEPS.map((step) => {
        const isCurrent = step.key === current;
        return (
          <li key={step.key} className="shrink-0">
            <Link
              href={step.href}
              aria-current={isCurrent ? 'step' : undefined}
              className={
                isCurrent
                  ? 'border-primary text-primary -mb-px block border-b-2 px-4 py-3 font-semibold'
                  : 'text-ink-muted hover:text-ink block border-b-2 border-transparent px-4 py-3 font-medium'
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
