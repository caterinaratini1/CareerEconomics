import diplomat from '@/content/careers/diplomat.json';
import doctor from '@/content/careers/doctor.json';
import softwareEngineer from '@/content/careers/software-engineer.json';

/**
 * The content registry.
 *
 * Career content is loaded through explicit static imports rather than by
 * scanning `content/careers/` with `node:fs`. The directory scan is more
 * convenient for the author and worse everywhere else: it defeats bundling,
 * needs file-tracing configuration to survive deployment to a serverless host,
 * and turns a missing file into a runtime 404 instead of a build failure.
 *
 * The cost is one line per career, which `npm run validate:content` checks
 * against the directory listing so a file can never be silently orphaned.
 *
 * Records are typed `unknown` on purpose. TypeScript infers a structural type
 * from the JSON that looks close enough to `CareerProfile` to be dangerous —
 * it would happily accept `"state": "verifed"` as a string literal mismatch
 * only if the shapes lined up exactly, and silently widen otherwise. Zod is
 * the only thing that gets to say whether a record is valid.
 */
export const CAREER_RECORDS: unknown[] = [diplomat, doctor, softwareEngineer];

/** Kept in sync with the imports above by `npm run validate:content`. */
export const CAREER_FILES = [
  'diplomat.json',
  'doctor.json',
  'software-engineer.json',
] as const;
