import Link from 'next/link';
import { SITE } from '@/lib/site';

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/methodology', label: 'How we research' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/sources', label: 'Sources' },
];

export function SiteFooter() {
  return (
    <footer className="border-rule bg-paper-sunk mt-16 border-t">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm">
        <nav aria-label="Footer">
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
          {SITE.name} is a free, independent guide. It does not require an
          account, does not use advertising, and does not sell data. Career
          information currently covers {SITE.country.name} only.
        </p>
        <p className="text-ink-muted mt-3">
          Information here is a starting point, not advice about your particular
          situation. Always check the official source before making a decision.
        </p>
      </div>
    </footer>
  );
}
