import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SITE } from '@/lib/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
  },
  robots: {
    // Draft content is visible in preview mode; it must never be indexed.
    index: process.env['NEXT_PUBLIC_CONTENT_PREVIEW'] !== 'true',
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // §18 forbids disabling zoom: never set maximumScale or userScalable here.
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={SITE.locale}
      className={inter.variable}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-dvh flex-col">
        <a className="skip-link" href="#main">
          Vai al contenuto
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
