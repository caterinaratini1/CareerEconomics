import type { CountryProfile } from '@/lib/content/schema';
import { REQUIREMENT_EXPLANATIONS, REQUIREMENT_LABELS } from '@/lib/site';
import { Badge } from '@/components/ui/primitives';

/**
 * §10.5 — the numbered route in.
 *
 * Rendered as a real `<ol>` so the order is conveyed to assistive technology
 * rather than only visually, and so it survives with CSS disabled.
 *
 * Each step carries its requirement level as a labelled badge. §10.6 is
 * explicit that the mandatory/optional distinction must be clear, and the most
 * common way to fail that is to render every step identically — which teaches
 * a student that an optional summer course is as compulsory as a degree.
 */
export function PathwaySteps({ profile }: { profile: CountryProfile }) {
  return (
    <ol className="space-y-6">
      {profile.pathway.map((step) => (
        <li key={step.stepNumber} className="flex gap-4">
          <span
            aria-hidden="true"
            className="bg-primary-soft text-primary flex size-9 shrink-0 items-center justify-center rounded-full font-semibold"
          >
            {step.stepNumber}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-lg font-semibold">
                <span className="sr-only">Passo {step.stepNumber}: </span>
                {step.title}
              </h3>
              <RequirementBadge requirement={step.requirement} />
            </div>

            <p className="text-ink-muted mt-1 text-sm">
              {step.stage}
              {step.stageLabel && ` · ${step.stageLabel}`}
              {step.estimatedDuration && ` · ${step.estimatedDuration}`}
            </p>

            <p className="mt-2 max-w-prose">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function RequirementBadge({ requirement }: { requirement: string }) {
  const tone =
    requirement === 'legally-required'
      ? 'verified'
      : requirement === 'usually-expected'
        ? 'neutral'
        : 'missing';

  return (
    <span className="inline-flex items-baseline gap-2">
      <Badge tone={tone}>
        {REQUIREMENT_LABELS[requirement] ?? requirement}
      </Badge>
      <span className="text-ink-muted text-xs">
        {REQUIREMENT_EXPLANATIONS[requirement]}
      </span>
    </span>
  );
}
