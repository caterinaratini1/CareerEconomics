## What this changes

## Content changes

If this touches `content/careers/`:

- [ ] `npm run validate:content` passes
- [ ] Every new factual claim is sourced, or honestly marked `unverified` /
      `not_researched` with a note saying what is still needed
- [ ] No figure originates from an AI model
- [ ] Pay is a range, with gross/net and period stated
- [ ] Mandatory and optional requirements are clearly separated
- [ ] Reviewed against `docs/CONTENT_GUIDE.md` §5

If this sets a career to `status: "published"`:

- [ ] Someone who knows the field has read it
- [ ] `editorial.openQuestions` is empty
- [ ] `reviewStatus` is `reviewed`

## Verification

- [ ] `npm run verify` passes locally
- [ ] Checked at 320px width
- [ ] Keyboard-navigable
