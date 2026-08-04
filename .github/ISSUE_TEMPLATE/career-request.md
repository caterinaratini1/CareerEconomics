---
name: New career profile
about: Request or claim a career to research and write up
title: 'Career: '
labels: content
---

## Career

**Name:**
**Other names students might use (English and Italian):**
**Category:**

## Why this one

Who asked for it, or what makes it worth the research time.

## Sources found so far

Official sources for the regulated parts. See `docs/CONTENT_GUIDE.md` §1 for the
hierarchy — government, statistics, professional bodies first.

- [ ] Entry requirements / competition notice
- [ ] Legal or licensing rules
- [ ] Official pay data
- [ ] Places vs applicants, if published

## Open questions

Anything the sources do not settle. These become `editorial.openQuestions` in
the JSON and block publication until resolved.

## Checklist

- [ ] `content/careers/<slug>.json` written
- [ ] Registered in `lib/content/registry.ts`
- [ ] `npm run validate:content` clean
- [ ] Reviewed against `docs/CONTENT_GUIDE.md` §5
- [ ] Read by someone who knows the field
