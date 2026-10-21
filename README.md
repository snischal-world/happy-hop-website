# Happy Hop Holidays website

A fast, plain website that is easy to edit with an AI assistant and publishes itself when you save to GitHub.

- **No frameworks, no installs of libraries.** The only tool needed is Node.js (free).
- **Text and prices live in simple files** in the `content/` folder. You rarely touch HTML.
- **Lead forms** (home page and campaign landing pages) are handled by Netlify Forms. No API keys.
- **Nothing private is stored in this code.** Customer details live only in your Netlify account.

## What is in the folder

| Folder or file | What it is | Do you edit it? |
|---|---|---|
| `content/site.json` | Business details, offer wording, menu links, "launched" switch, domain | Yes, often |
| `content/destinations/*.json` | One file per destination: prices, taglines, best time, highlights | Yes |
| `content/faqs.json` | The FAQ answers used on the website and by a future chatbot | Yes |
| `content/landing/*.json` | One file per campaign landing page | Yes |
| `src/pages/*.html` | Home, privacy, terms, refer-a-friend, thank-you and 404 pages | Sometimes |
| `src/layouts/` | Page layouts and the shared lead form | Rarely (ask AI) |
| `src/assets/` | CSS, JavaScript, fonts and images | Images yes, code rarely |
| `public/` | Favicon, social-share image | Occasionally |
| `scripts/` | `build.mjs` (makes the site), `dev.mjs` (local preview), `check.mjs` (safety checks) | No |
| `netlify.toml` | Netlify build settings and security headers | No |
| `docs/` | Guides: landing pages, chatbot readiness, accounts and costs | Read |
| `design-source/` | Original logo artwork and the social image source | Keep |

## 1. Run it on your computer

1. Install **Node.js 20 or newer** (the "LTS" download at nodejs.org). Check it worked: open a terminal and run `node --version`.
2. Open a terminal **in this folder** (Windows: open the folder, click the address bar, type `cmd`, press Enter. Mac: right-click the folder, "New Terminal at Folder").
3. Run `npm run dev`.
4. Open **http://localhost:8888** in your browser. Leave the terminal open. Press `Ctrl+C` to stop.

The preview rebuilds by itself when you save a file; refresh the browser to see the change. The preview also shows **draft** pages and destinations, so you can review them before they go live.

Other commands: `npm run build` (makes the finished site in `dist/`), `npm run check` (runs the safety checks), `npm test` (both).

## 2. Edit content

Open the file in any text editor (VS Code is free). Keep the quote marks and commas as they are.

- **Change a price:** open `content/destinations/bali.json`, change `from_now` (the half-price figure) and `was` (the original). The home page cards and every landing page update.
- **Change the offer wording or end date:** `content/site.json`, the `offer` block.
- **Change phone, email, ABN or social links:** `content/site.json`.
- **Change FAQ answers:** `content/faqs.json` (`answer_html` can contain simple links).
- **Change page text** (headings, paragraphs): `src/pages/index.html` and the other files in that folder. The text between tags is the words people read.
- **Replace an image:** put the new file in `src/assets/img/` with a **new file name** (browsers remember old names for a week) and update the name where it is used.
- **Legal pages:** `src/pages/privacy.html` and `terms.html`. Have a lawyer review any change.

After editing, run `npm test`. It lists mistakes in plain language (broken links, missing alt text, a form missing its spam guard, a password pasted into a file).

### Working with an AI assistant

Give it this folder and say: "Read AGENTS.md first." That file tells it the rules (edit content files, never add secrets, run `npm test`). Good requests: "Make a new landing page for a Thailand honeymoon offer", "Change the Bali price to 450", "Add an FAQ about travel insurance".

## 3. Lead forms: where the answers go and how to test

There are two Netlify forms. Both ask for consent to be contacted and both have a hidden spam trap.

| Form name | Where | Fields |
|---|---|---|
| `enquiry` | Home page | who you are, name, email, phone, what you are planning (max 3), destination, other destination, travel month, adults, children and ages, message, referral code, consent |
| `lead` | Every landing page and destination page | name, email, travel interest, other destination, approximate dates, party size, consent, plus hidden `campaign`, `landing_page`, `page_url`, `utm_*` and the exact consent wording |

**Where submissions go:** into your Netlify account at **Project > Forms**. Open a form to read each lead, filter spam, and **Export CSV** for a spreadsheet or CRM. Nothing is stored in GitHub or in the website files.

**Get an email for each lead:** Netlify dashboard > your site > **Project configuration** (called Site configuration on older screens) **> Notifications > Form submission notifications > Add notification > Email notification**. Choose the form (do it once for `enquiry` and once for `lead`) and enter `happyhopholidays@gmail.com`.

**Test on your computer (no Netlify needed):**
1. Run `npm run dev` and open a landing page, for example http://localhost:8888/lp/half-price-offer/
2. Fill in the form and send it. You land on the thank-you page.
3. A copy of the submission is saved in the `.local-submissions/` folder, and the terminal prints it. Check the fields are what you expect, including `campaign`.
4. Try the spam trap: submissions with the hidden `website` field filled in are ignored.
5. Delete `.local-submissions/` when you are finished. It is never uploaded to GitHub.

**Test on the real site (needed once before launch, because Netlify only notices forms when it publishes the site):**
1. Publish to Netlify (section 4).
2. On the live Netlify address, send a test lead with your own email.
3. Within a minute it appears in **Forms**, and the email notification arrives. Open it and confirm every field.
4. Delete the test submission.
5. After you add a new landing page, send one test lead through it the same way.

**Spam:** the hidden field plus Netlify's built-in filter stop most bots. Check **Forms > Spam** now and then. If spam grows, turn on Netlify's reCAPTCHA option (see docs/ACCOUNTS_AND_COSTS.md).

## 4. Publish with GitHub and Netlify

1. Create a free GitHub account and a **private** repository (for example `happy-hop-holidays`).
2. In a terminal in this folder, run these once (replace the address with yours):
   ```
   git init
   git add .
   git commit -m "First version"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/happy-hop-holidays.git
   git push -u origin main
   ```
3. Create a free Netlify account. Choose **Add new project > Import an existing project > GitHub** and pick the repository.
4. The build settings come from `netlify.toml` (build command `node scripts/build.mjs`, publish folder `dist`, Node 20). Leave them as they are and press **Deploy**.
5. To change the site later: edit, run `npm test`, then `git add .`, `git commit -m "What I changed"` and `git push`. Netlify publishes within about a minute. If a build fails, the old site stays live.
6. Every branch and pull request also gets its own private preview link, which is handy for reviewing a new landing page before it goes live.

**Landing pages and drafts:** a landing page or destination marked `"status": "draft"` is **not** published. Set it to `"published"` (landing pages) or `"approved"` (destinations) when you are happy.

## 5. Go-live checklist

1. Buy your domain and add it in Netlify: **Domain management > Add a domain**. Follow Netlify's DNS steps. HTTPS is free and automatic.
2. In `content/site.json` set `"url"` to your domain (for example `"https://happyhopholidays.com.au"`) and `"launched"` to `true`. **Until `launched` is true, the site tells Google not to index it** (robots.txt and a noindex tag), which is what you want while testing.
3. Run `npm test`, then `git push`.
4. Open `https://your-domain/sitemap.xml` and `https://your-domain/robots.txt` to confirm they look right.
5. Create a free **Google Search Console** account, add your domain, and submit `sitemap.xml`.
6. Send test leads (section 3) and confirm the notification email.
7. Share the home page link in WhatsApp and Facebook to confirm the preview image and title appear.
8. Have the privacy policy, terms and the price and offer wording reviewed by a lawyer.

## 6. Built-in SEO, sharing and accessibility

| Item | Status |
|---|---|
| Unique title and description per page, canonical link | Built in (`npm test` warns if too long or short) |
| Social sharing (Open Graph and Twitter card) with a 1200 x 630 image | Built in (`public/og-default.jpg`); a landing page can use its own image |
| `sitemap.xml` and `robots.txt` | Generated on every build. Landing pages stay out of the sitemap unless `"indexable": true` |
| Structured data (TravelAgency, and TouristDestination on destination pages) | Built in |
| Favicon and phone home-screen icon | Built in |
| Mobile layout | Tested at 390 px and 1280 px wide with no sideways scrolling |
| Accessibility basics | Skip link, one H1 per page, labelled form fields, alt text on images, visible keyboard focus, tap targets 24 px or larger, respects reduced-motion settings |
| Speed | About 120 KB of code in total, images lazy-loaded with set sizes, long caching with automatic cache busting |

**Honest limits:** the checks above are automated tests plus my own browser checks. Before a big ad spend, also run Lighthouse (Chrome > DevTools > Lighthouse) and a free axe or WAVE scan on the live site. Mobile has no hamburger menu: small screens show the logo and the Enquire button only, which suits campaigns. Add a menu later if the site grows.

## 7. Landing pages, chatbot, accounts and costs

- Making campaign pages: **docs/LANDING_PAGES.md**
- Preparing for a future chatbot: **docs/CHATBOT_READY.md**
- Accounts, services, keys and costs: **docs/ACCOUNTS_AND_COSTS.md**

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm: command not found` | Install Node.js, then open a new terminal |
| Build fails with "Unknown token" or "does not exist" | The message names the file and the typo. Fix it and run `npm test` |
| Form works locally but nothing appears in Netlify | Forms are detected when the site is published. Check the form name under **Forms**, and that the deploy finished |
| New landing page not visible online | Its `status` must be `published`; push to GitHub; check the deploy log |
| Search engines still blocked after launch | `"launched": true` in `content/site.json`, and the deploy must be the production one |
| Changed an image but the old one shows | Give the new image a new file name |
