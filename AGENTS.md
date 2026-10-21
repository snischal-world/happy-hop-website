# Instructions for AI assistants working on this site

Read README.md first. This is a dependency-free static site built by `node scripts/build.mjs` into `dist/` and published by Netlify.

## Rules
1. **Change content in `content/` first** (site.json, destinations/*.json, faqs.json, landing/*.json). Edit `src/pages/*.html` only for wording that is not in a content file.
2. **Never add secrets or customer data** (passwords, API keys, tokens, real enquiries, `.local-submissions/`) to any file. Forms are handled by Netlify Forms; no keys are needed.
3. **Do not invent facts.** Prices, inclusions, dates, hotel names and legal wording come from the owner. If unsure, ask, or mark the item `"status": "draft"`.
4. Prices on the site are **estimates**. Keep the wording "confirmed in your written quote" and the link to /terms/#s4 wherever prices appear.
5. Spelling: Australian English. Plain language, short sentences, no em dashes.
6. Brand: navy #002440, lime #96ff01 and aqua #12bfe9 (only as soft gradients), white page. Kangaroo illustrations only. The owner decides colour questions.
7. Keep every form: `data-netlify="true"`, a `form-name` hidden input, the `website` honeypot, a required `consent` checkbox. `npm test` enforces this.
8. Images need alt text and width and height. Give replaced images a new file name.
9. Run `npm test` before finishing and fix every error it reports.
10. New landing page: copy a file in `content/landing/`, change the words, set `status` to `draft`, preview with `npm run dev`. Do not edit templates unless asked.
