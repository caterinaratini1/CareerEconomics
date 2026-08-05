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
    <footer className="border-ink bg-ink mt-20 border-t text-white">
      <div className="app-shell grid gap-8 py-10 text-sm md:grid-cols-[1.25fr_.75fr]">
        <div>
          <p className="editorial-title text-xl">Career Economics Lab</p>
          <p className="mt-5 max-w-prose text-white/70">
            {SITE.name} è una guida gratuita e indipendente. Non richiede
            registrazione, non contiene pubblicità e non vende dati. Al momento
            le informazioni riguardano solo l’{SITE.country.name}.
          </p>
          <p className="mt-3 text-white/60">
            Quello che trovi qui è un punto di partenza, non un consiglio sulla
            tua situazione specifica. Prima di decidere, controlla sempre la
            fonte ufficiale.
          </p>
        </div>
        <div className="md:justify-self-end">
          <nav aria-label="Collegamenti in fondo alla pagina">
            <p className="mb-3 text-[10px] font-bold tracking-[.16em] text-white/50 uppercase">
              Informazioni
            </p>
            <ul className="space-y-2">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/75 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
