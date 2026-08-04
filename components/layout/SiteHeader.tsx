import Link from 'next/link';
import { isPreviewMode } from '@/lib/content/repository';
import { SITE } from '@/lib/site';

/**
 * Deliberately minimal: no marketing nav here. `/student/*` routes render
 * their own `StepNav` (components/student/StepNav.tsx) for in-flow
 * navigation, and the general-interest links (Chi siamo, Come lavoriamo,
 * Fonti, Privacy) live in `SiteFooter` only, so they don't compete with the
 * join screen or the student flow for attention.
 */
export function SiteHeader() {
  return (
    <>
      {isPreviewMode() && <PreviewBanner />}
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-4">
          <Link
            href="/"
            className="text-ink text-base font-semibold no-underline"
          >
            {SITE.name}
          </Link>
        </div>
      </header>
    </>
  );
}

/**
 * Shown whenever the site is rendering unpublished content.
 *
 * Deliberately not dismissible. Phase 1 puts draft pages in front of real
 * teachers and students to test the template, and the one thing that must not
 * happen is a reader mistaking a working draft for a checked fact. A banner
 * someone can close is a banner that is closed.
 */
function PreviewBanner() {
  return (
    <div
      role="status"
      className="bg-evidence-draft-soft text-ink border-evidence-draft/40 border-b px-4 py-2 text-center text-sm"
    >
      <strong className="font-semibold">Versione di prova.</strong> Questo sito
      sta mostrando bozze non ancora pubblicate. Le informazioni di queste
      pagine non sono state verificate su fonti ufficiali: non usarle per
      decidere.
    </div>
  );
}
