import type { MetadataRoute } from 'next';
import {
  careerRepository,
  isPreviewMode,
  loadAllCareers,
} from '@/lib/content/repository';
import { SITE } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, '');

  const staticRoutes = [
    '',
    '/careers',
    '/about',
    '/methodology',
    '/privacy',
    '/sources',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.6,
  }));

  // Drafts are visible in preview mode but must never enter the sitemap: the
  // point of preview is human review, not discovery by a search engine.
  const published = loadAllCareers().filter((c) => c.status === 'published');
  const listed = isPreviewMode()
    ? published
    : await careerRepository
        .listSlugs()
        .then((slugs) => published.filter((c) => slugs.includes(c.slug)));

  const careerRoutes = listed.map((career) => ({
    url: `${base}/careers/${career.slug}`,
    lastModified: new Date(`${career.editorial.lastReviewedAt}T00:00:00Z`),
    changeFrequency: 'yearly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...careerRoutes];
}
