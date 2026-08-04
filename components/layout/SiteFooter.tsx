import Link from 'next/link';
import { SITE } from '@/lib/site';

const LINKS = [
  { href: '/about', label: 'Chi siamo' },
  { href: '/methodology', label: 'Come lavoriamo' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/sources', label: 'Fonti' },
];

export function SiteFooter() {
  return (
    <footer className="border-border bg-surface-muted mt-16 border-t">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm">
        <nav aria-label="Collegamenti in fondo alla pagina">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-ink-muted hover:text-ink underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-ink-muted mt-6 max-w-prose">
          {SITE.name} è una guida gratuita e indipendente. Non richiede
          registrazione, non contiene pubblicità e non vende dati. Al momento le
          informazioni riguardano solo l’{SITE.country.name}.
        </p>
        <p className="text-ink-muted mt-3">
          Quello che trovi qui è un punto di partenza, non un consiglio sulla
          tua situazione specifica. Prima di decidere, controlla sempre la fonte
          ufficiale.
        </p>
      </div>
    </footer>
  );
}
