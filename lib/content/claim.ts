import { z } from 'zod';

/**
 * A Claim is the unit of factual integrity in this product.
 *
 * Product principle 6.4 ("sources must be visible") and 6.5 ("AI is not the
 * source of truth") are easy to state and easy to violate by accident: someone
 * drafts a plausible salary range, it reads fine in review, and it ships
 * without a source. A flat `salary_entry_min: number` column cannot prevent
 * that — the number and its evidence are separate fields, and nothing forces
 * them to travel together.
 *
 * So every fact that a student might act on is wrapped. A claim is one of:
 *
 *   `verified`       — has a value AND at least one source id AND a date
 *   `unverified`     — has a drafted value but no source yet; NEVER publishable
 *   `not_researched` — has no value at all; renders as an explicit gap
 *
 * Because `value` does not exist on the `not_researched` variant, TypeScript
 * refuses to let a component read a number that was never researched. The
 * discriminated union turns an editorial rule into a compile error.
 *
 * `unverified` exists so the content prototype (Phase 1) can be tested with
 * real students before every source is collected — but `assertPublishable`
 * rejects it, so a draft can never reach `published` status by omission.
 */

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isoDate = z
  .string()
  .regex(ISO_DATE, 'Must be an ISO date (YYYY-MM-DD)')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Must be a real date');

export const sourceIdSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'Source ids must be lowercase kebab-case, e.g. "maeci-concorso-2025"',
  );

/** Wraps any value schema in the three-state claim envelope. */
export function claim<T extends z.ZodTypeAny>(value: T) {
  return z.discriminatedUnion('state', [
    z.object({
      state: z.literal('verified'),
      value,
      /** Ids of entries in the career's `sources` array. At least one. */
      sourceIds: z.array(sourceIdSchema).min(1),
      verifiedAt: isoDate,
      /** Optional caveat shown to students alongside the value. */
      caveat: z.string().min(1).optional(),
    }),
    z.object({
      state: z.literal('unverified'),
      value,
      /** Why this is not yet verified and what evidence would settle it. */
      note: z.string().min(1),
    }),
    z.object({
      state: z.literal('not_researched'),
      /** What a researcher must collect, so the gap is actionable. */
      note: z.string().min(1),
    }),
  ]);
}

/**
 * The hand-written mirror of `claim()`'s inferred output type.
 *
 * `caveat` is written `string | undefined` rather than the shorter `caveat?:
 * string` on purpose: under `exactOptionalPropertyTypes` those are different
 * types, and Zod infers the former. Omitting `| undefined` makes every
 * `CountryProfile` claim fail to satisfy `Claim<T>` at the component boundary.
 */
export type Claim<T> =
  | {
      state: 'verified';
      value: T;
      sourceIds: string[];
      verifiedAt: string;
      caveat?: string | undefined;
    }
  | { state: 'unverified'; value: T; note: string }
  | { state: 'not_researched'; note: string };

/** Type guard letting components read `.value` only when it exists. */
export function hasValue<T>(c: Claim<T>): c is Extract<Claim<T>, { value: T }> {
  return c.state !== 'not_researched';
}

export function isVerified<T>(
  c: Claim<T>,
): c is Extract<Claim<T>, { state: 'verified' }> {
  return c.state === 'verified';
}

/** Convenience constructor for content authored in TypeScript (tests, seeds). */
export const notResearched = (note: string): Claim<never> => ({
  state: 'not_researched',
  note,
});

export { isoDate as isoDateSchema };
