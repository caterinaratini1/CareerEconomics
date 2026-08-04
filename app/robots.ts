import type { MetadataRoute } from 'next';
import { isPreviewMode } from '@/lib/content/repository';
import { SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, '');

  // A preview deployment shows unpublished drafts. Disallowing everything is
  // the belt to the per-page `noindex` braces — a draft career page indexed as
  // fact is the worst failure this product can have.
  if (isPreviewMode()) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}/sitemap.xml`,
  };
}
