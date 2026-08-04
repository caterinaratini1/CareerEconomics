import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

/**
 * Career pages now live under `/student/careers/*`, which requires a class
 * session (see app/student/layout.tsx) — an anonymous crawler would just be
 * redirected to the join screen. So, unlike the Phase 1 site, career pages
 * are no longer listed here: a sitemap entry a visitor cannot actually reach
 * would be misleading rather than useful. Once Phase B adds a public,
 * ungated career-preview surface, this is the file to extend.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, '');

  return ['', '/about', '/methodology', '/privacy', '/sources'].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.6,
  }));
}
