import Link from 'next/link';
import { isPreviewMode } from '@/lib/content/repository';
import { SITE } from '@/lib/site';

const NAV = [
  { href: '/careers', label: 'Tutte le professioni' },
  { href: '/methodology', label: 'Come lavoriamo' },
  { href: '/about', label: 'Chi siamo' },
];

export function SiteHeader() {
  return (
    <>
      {isPreviewMode() && <PreviewBanner />}
      <header className="border-rule border-b">
        <nav
          aria-label="Principale"
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4"
        >
          <Link
            href="/"
            className="text-ink mr-auto text-base font-semibold no-underline"
          >
            {SITE.name}
          </Link>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink-muted hover:text-ink underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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
