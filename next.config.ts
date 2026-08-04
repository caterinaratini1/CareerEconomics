import type { NextConfig } from 'next';

/**
 * Security headers. The MVP serves minors, so we lock the browser down by
 * default and open only what a page actually needs (see docs/DECISIONS.md).
 *
 * `unsafe-inline` for styles is required by Next's streaming style injection.
 * Scripts are allowed `unsafe-inline` only in development, where Next injects
 * the dev overlay and HMR runtime inline; production builds use nonce-free
 * external chunks plus a small inline bootstrap, which `strict-dynamic` on a
 * nonce would break without a custom middleware. Revisit when the AI assistant
 * (Phase 7) introduces client-side fetches.
 */
const isDev = process.env.NODE_ENV === 'development';

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Next writes AGENTS.md / CLAUDE.md into the repo root on dev start. This
  // project documents itself in README.md and docs/, so the generated files are
  // duplicated guidance that will drift.
  agentRules: false,

  // Career pages are pure content: no client bundle should ever be needed to
  // read one. Keeping this on surfaces accidental `use client` regressions in
  // the build output.
  experimental: {
    optimizePackageImports: ['zod'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
