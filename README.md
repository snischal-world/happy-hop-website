# Happy Hop Holidays website

A simple static website: plain HTML with the CSS inside each page. No build tools, no installs.

| File | What it is |
|---|---|
| `index.html` | Homepage: destinations, half-price offer, lead form, SEO tags |
| `landing-page-template.html` | Copy this to make a campaign landing page (same lead form) |
| `thanks.html` | Page shown after someone sends the form |
| `netlify.toml` | Netlify build settings, security headers and redirects |
| `sitemap.xml`, `robots.txt` | Help Google find the right pages |

## 1. Edit the site on your computer

1. Install a free editor such as VS Code and open this folder.
2. Edit the text inside `index.html` (headings, prices in the destination cards, the offer banner).
3. To preview, double-click `index.html`, or in a terminal in this folder run `python -m http.server 8000` and open http://localhost:8000.
4. Replace `https://example.com` with your real domain everywhere (VS Code: Edit > Replace in Files). Do the same in `sitemap.xml` and `robots.txt`.
5. Add a 1200 x 630 picture called `og-image.jpg` to this folder. It is the image shown when the site is shared on Facebook, WhatsApp and LinkedIn.

You can ask an AI assistant to make changes. Tell it: "Only edit the HTML text. Do not add any passwords, API keys or customer details to the files."

## 2. Make a campaign landing page

1. Copy `landing-page-template.html` and rename the copy, for example `bali-offer.html` (use lowercase and hyphens).
2. Replace the words in the three areas marked `EDIT 1`, `EDIT 2` and `EDIT 3`.
3. Search the file for `CAMPAIGN-NAME` and replace it with a short label such as `bali-oct-facebook`. This label arrives with every lead so you know which campaign it came from.
4. Change the `<title>` and the description in the `<head>`.
5. Paid-ad pages keep `<meta name="robots" content="noindex">` so they stay out of Google. Delete that line only if you want the page to appear in search, and then add it to `sitemap.xml`.
6. Add UTM tags to your ad links, for example `https://your-domain.com/bali-offer.html?utm_source=facebook&utm_medium=paid&utm_campaign=bali-oct`. They are saved with each lead automatically.

## 3. Where form answers go, and how to test them

The form uses **Netlify Forms**. There is nothing to connect and no key to paste.

- Each submission is stored privately in your Netlify account: **Site > Forms > lead**. You can download all leads as a CSV for your spreadsheet or CRM.
- To get an email for every lead: **Site configuration > Notifications > Form submission notifications > Add notification > Email**, and enter `happyhopholidays@gmail.com`.
- Spam is blocked by a hidden "honeypot" field plus Netlify's own spam filter. Check **Forms > Spam** now and then.
- Fields saved: name, email, travel interest, other destination, approximate dates, number of travellers, consent (and the exact wording agreed to), the campaign name, the page address and any UTM tags.

**The form cannot send anything from your computer.** Test it online:
1. Deploy the site (section 4).
2. Open the live Netlify address, fill in the form with a test name and your own email, tick the consent box and press the button. You should land on the thank-you page.
3. In Netlify open **Forms > lead**. Your test appears within a minute. Open it and check every field.
4. Delete the test entry (Delete submission) so it does not mix with real leads.
5. A landing page copy must be deployed once before its form is recognised. Test it the same way.

## 4. Put it on GitHub and publish with Netlify

1. Create a free account at github.com and a new **private** repository called `happy-hop-website`.
2. In a terminal in this folder:
   ```
   git init
   git add .
   git commit -m "First version"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/happy-hop-website.git
   git push -u origin main
   ```
3. Create a free account at netlify.com, then **Add new project > Import an existing project > GitHub**, and choose the repository.
4. Leave the build settings alone: Netlify reads `netlify.toml`. Press **Deploy**.
5. After every change, run `git add .`, `git commit -m "What changed"` and `git push`. Netlify republishes in about a minute. Every branch and pull request also gets its own private preview link.
6. Add your own domain under **Domain management > Add a domain**. Netlify shows the DNS records to enter at your domain provider and then provides the HTTPS certificate for free.

## Before you collect real leads

- Publish a **privacy policy** and **terms** page and link them from the footer and next to the consent tick box. The forms ask for personal details and permission to contact people.
- Your name, email and phone number are already in the footer. Do not put customer details, passwords or API keys in any file in this repository.
- Prices on the page are estimates. Keep the wording "confirmed in your written quote" and the detailed price conditions in your terms.

## Costs (check each site for current prices)

GitHub free plan: $0. Netlify free plan: $0 (it includes a monthly allowance of credits; Netlify's April 2026 notes say form submissions are free on credit plans, and the site pauses if the allowance runs out). A domain: roughly AUD 15 to 30 per year. No other accounts or API keys are needed for this version.
