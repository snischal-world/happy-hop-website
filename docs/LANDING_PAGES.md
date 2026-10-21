# Campaign landing pages

Each landing page is one small file in `content/landing/`. The file name becomes the address: `bali-honeymoon.json` is published at `/lp/bali-honeymoon/`.

## Make a new page (about 10 minutes)

1. Copy a file that is close to what you need:
   - `half-price-offer.json` : a promotion with prices for several destinations (layout `offer`)
   - `bali-escape.json` : one destination with a sample itinerary (layout `destination`)
   - `corporate-events.json` : weddings, corporate or group events (layout `event`)
2. Rename the copy. Use lowercase and hyphens.
3. Change the words. The important fields:

| Field | What it does |
|---|---|
| `slug` | Must match the file name without `.json` |
| `status` | `draft` = not published, `published` = live |
| `indexable` | `false` keeps the page out of Google and the sitemap (normal for paid-ad pages). `true` lists it |
| `campaign` | A short label saved with every lead, e.g. `bali-honeymoon-oct-facebook` |
| `seo.title`, `seo.description` | Browser tab and Google text. Title about 55 characters, description 120 to 155 |
| `seo.image` | Optional social-share image (1200 x 630) |
| `hero` | `eyebrow`, `headline`, `headline_emphasis` (the words shown in colour), `subhead`, `bullets`, `image`, `cta`, `nav_cta` (short button text for the header) |
| `form` | `heading`, `intro`, `button`, `interest_default` (pre-selects a destination), `require_dates` (`true` makes dates compulsory) |
| `destinations` | List of destination slugs to show with prices (offer layout) |
| `faqs` | List of FAQ ids from `content/faqs.json` |
| `closing` | The final call-to-action band |

4. Preview: `npm run dev`, open `http://localhost:8888/lp/your-slug/`. Drafts are visible locally.
5. Run `npm test`. When happy, set `"status": "published"`, then `git add .`, `git commit`, `git push`.
6. After the first deploy, send one test lead through the page (see README section 3).

## Tracking campaigns

Add UTM tags to your ad links: `https://your-domain/lp/bali-honeymoon/?utm_source=facebook&utm_medium=paid&utm_campaign=bali-oct`. The form saves `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` and `utm_term` with each lead, and always saves `campaign` and `landing_page`.

After sending, visitors go to `/thanks/`. Use that address as the "conversion page" in Facebook, Google or other ad tools.

## Add a new layout

Open `src/layouts/landing.mjs`, copy one layout function, change the sections and add it to the `layouts` list at the bottom. A content file then uses it with `"layout": "your-name"`. Ask an AI assistant to do this.

## Rules of thumb

- One goal per page: get the form filled in.
- Keep the half-price wording identical to `content/site.json` (the build inserts it for you).
- Do not promise anything the terms do not support. Prices are estimates.
