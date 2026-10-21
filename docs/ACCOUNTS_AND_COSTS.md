# Accounts, assets, keys and costs

Prices change. Check each provider's pricing page before you commit. Figures below are what I could confirm in October 2026.

## Accounts you need

| Account | Needed for | Cost |
|---|---|---|
| **GitHub** (github.com) | Stores the website code. Use a **private** repository | Free |
| **Netlify** (netlify.com) | Builds, hosts and receives the form leads | Free plan to start (see below) |
| **Domain name** from a registrar (VentraIP, Namecheap, GoDaddy, Netlify and others) | Your web address, for example happyhopholidays.com.au | Roughly AUD 15 to 30 a year. A `.com.au` needs an Australian ABN, which you have |
| **Google Search Console** | Tells Google about your sitemap and shows search problems | Free |
| Gmail (existing) | Receives lead notification emails at happyhopholidays@gmail.com | Free |

## Optional later

| Service | Why | Cost |
|---|---|---|
| Zapier or Make | Copy each lead into Google Sheets or a CRM automatically (connect to the Netlify form) | Free tier, then paid |
| Privacy-friendly analytics (Plausible, Fathom) or Google Analytics 4 | See visits and campaign results. Add the script tag in `src/layouts` and mention it in the privacy policy | GA4 free; others roughly USD 9 a month and up |
| Netlify reCAPTCHA | Extra spam protection if bots get through | Free (Google reCAPTCHA) |
| Chatbot tool or AI service | A future assistant (see docs/CHATBOT_READY.md) | Varies; usage-based |
| A lawyer | Review of privacy policy, terms, price and offer wording | Quote needed |

## Netlify free plan: what to know before running ads

- The free plan gives **300 credits a month**. A production deploy costs 15 credits, bandwidth costs 20 credits per GB, and web requests a little more.
- Netlify's April 2026 notes say **form submissions are free and unlimited** on its credit plans. Confirm this on your account's **Usage** page.
- If credits run out the site is **paused until the next cycle**. This site is small (about 1.2 MB in total, much less per visit), so a few thousand visits a month is comfortable, but a paid advertising campaign could use far more. **Move to a paid Netlify plan before a big campaign**, and watch the Usage page.
- Each `git push` to main uses one production deploy (15 credits), so batch your edits.

## Assets and decisions to provide

| Item | Status |
|---|---|
| Logo: star and kangaroo face, Murillino font | Provided. Please confirm the font licence allows web use (a 2 KB subset is served) |
| Destination photos (6) | Confirm you own them or have a licence for web and ads |
| Kangaroo illustrations | Provided |
| Final from-prices, hotel level wording, offer end date | Confirmed on the current site. Re-confirm before each campaign |
| Referral amounts and referral terms | Still to be confirmed |
| Written approval of each destination's content | Needed to switch destination pages on |
| Customer reviews | Keep permission to show names and first-name initials |
| Facebook and Instagram addresses | Check `content/site.json` links open the right pages |
| Domain name and access to its DNS settings | Needed at go-live |
| Social-share image | Generated (`public/og-default.jpg`). Replace if you want a photo-based one |
| Lawyer review of privacy, terms and price disclaimers | Strongly recommended before launch |
| A decision on how long you keep leads, and who follows up | Needed for the privacy policy |

## API keys and secrets

**This version needs none.** Forms use Netlify Forms, which has no key.

If you add something that does need a secret later (a chatbot, a CRM, reCAPTCHA secret), put it in Netlify under **Project configuration > Environment variables**. Never in a file in this repository, and never in a chat with an AI assistant. `npm test` scans every file for common key patterns and fails if it finds one.

Public identifiers (an analytics ID, a reCAPTCHA *site* key) are safe in the code; secret keys are not.

## Privacy notes

- Leads and the exact consent wording are stored in Netlify. Decide a retention period and say it in the privacy policy.
- The site loads fonts from Google Fonts, which means visitors' browsers contact Google. You can self-host the fonts later if you prefer.
- The WhatsApp button opens `api.whatsapp.com`. Phone, email and ABN in the code are already public on your site.
