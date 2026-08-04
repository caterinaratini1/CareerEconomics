/**
 * Content validation — the CI gate for career content.
 *
 * Runs three layers of check:
 *   1. Registry parity  — every JSON file is imported, every import exists
 *   2. Schema           — every record satisfies careerProfileSchema
 *   3. Publication gate — every record marked `published` passes checkPublishable
 *
 * Layer 3 is the important one. It means a career cannot reach production with
 * an unsourced salary or an unreviewed profile even if a reviewer misses it,
 * because the build fails first.
 *
 * Exit codes: 0 = clean (warnings allowed), 1 = errors found.
 * Run with `--strict` to fail on warnings too.
 */

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { CAREER_FILES } from '../lib/content/registry';
import { checkPublishable } from '../lib/content/publication';
import {
  loadAllCareers,
  ContentValidationError,
} from '../lib/content/repository';
import {
  estimateReading,
  MAX_READING_MINUTES,
} from '../lib/content/reading-time';
import type { CareerProfile } from '../lib/content/schema';

const CONTENT_DIR = join(process.cwd(), 'content', 'careers');
const strict = process.argv.includes('--strict');

const errors: string[] = [];
const warnings: string[] = [];

const error = (msg: string) => errors.push(msg);
const warn = (msg: string) => warnings.push(msg);

// --- 1. Registry parity ----------------------------------------------------

function checkRegistryParity(): void {
  const onDisk = readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();
  const registered: string[] = [...CAREER_FILES].sort();

  for (const file of onDisk) {
    if (!registered.includes(file)) {
      error(
        `content/careers/${file} exists but is not imported in lib/content/registry.ts. ` +
          `It will not appear on the site.`,
      );
    }
  }
  for (const file of registered) {
    if (!onDisk.includes(file)) {
      error(
        `lib/content/registry.ts lists ${file}, but content/careers/${file} does not exist.`,
      );
    }
  }
}

// --- 2 & 3. Schema and publication gate ------------------------------------

function checkCareer(career: CareerProfile, allSlugs: Set<string>): void {
  const label = `${career.slug} (${career.status})`;

  // §4/§10: the ten-minute budget applies to the core reading path. Secondary
  // sections sit behind native disclosure and are not counted — see
  // lib/content/reading-time.ts for the partition and why it exists.
  const reading = estimateReading(career);
  if (reading.coreMinutes > MAX_READING_MINUTES) {
    error(
      `${label}: core reading path is ${reading.coreMinutes} minutes ` +
        `(${reading.coreWords} words), over the ${MAX_READING_MINUTES}-minute ` +
        `acceptance criterion. Trim it, or move a section behind disclosure ` +
        `and update SECONDARY_* in lib/content/reading-time.ts.`,
    );
  } else if (reading.fullMinutes > MAX_READING_MINUTES * 2) {
    warn(
      `${label}: core path is ${reading.coreMinutes} min but the full page is ` +
        `${reading.fullMinutes} min. Within budget, but worth a look.`,
    );
  }

  // Related careers pointing at slugs we do not have would render as dead
  // links, so the UI degrades them to plain text — but the author should know.
  for (const related of career.relatedCareers) {
    if (related.slug && !allSlugs.has(related.slug)) {
      warn(
        `${label}: relatedCareers "${related.name}" links to slug "${related.slug}", ` +
          `which does not exist yet. It will render as plain text until it does.`,
      );
    }
  }

  const issues = checkPublishable(career);
  const blockers = issues.filter((i) => i.severity === 'blocker');

  if (career.status === 'published') {
    for (const issue of blockers) {
      error(`${label}: ${issue.path} — ${issue.message}`);
    }
    for (const issue of issues.filter((i) => i.severity === 'warning')) {
      warn(`${label}: ${issue.path} — ${issue.message}`);
    }
  } else if (blockers.length > 0) {
    // Not an error: a draft is allowed to be incomplete. Reporting it anyway
    // turns "what is left to do?" into a command rather than a memory exercise.
    warn(
      `${label}: not publishable yet — ${blockers.length} blocker(s):\n` +
        blockers.map((i) => `        · ${i.path}: ${i.message}`).join('\n'),
    );
  }
}

// --- Run -------------------------------------------------------------------

function main(): void {
  checkRegistryParity();

  let careers: CareerProfile[] = [];
  try {
    careers = loadAllCareers();
  } catch (err) {
    if (err instanceof ContentValidationError) {
      error(err.message);
    } else {
      throw err;
    }
  }

  const slugs = new Set(careers.map((c) => c.slug));
  for (const career of careers) checkCareer(career, slugs);

  // --- Report --------------------------------------------------------------

  const publishable = careers.filter((c) => c.status === 'published').length;

  console.log(`\nChecked ${careers.length} career record(s).`);
  console.log(
    `  published: ${publishable}   ` +
      `other states: ${careers.length - publishable}`,
  );

  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`  ⚠ ${w}`);
  }

  if (errors.length > 0) {
    console.log(`\n${errors.length} error(s):`);
    for (const e of errors) console.log(`  ✗ ${e}`);
    console.log('');
    process.exit(1);
  }

  if (strict && warnings.length > 0) {
    console.log('\n--strict: failing because warnings are present.\n');
    process.exit(1);
  }

  console.log('\nContent validation passed.\n');
}

main();
