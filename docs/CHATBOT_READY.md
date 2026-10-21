# Getting ready for a chatbot (not included yet)

The first version has **no chatbot**. The content is arranged so one can be added safely later.

## What is already in place

1. **One source of truth.** Business facts are in `content/site.json`, destinations in `content/destinations/`, answers in `content/faqs.json`. The website and a chatbot read the same files, so they never disagree.
2. **An approval gate.** Every destination and FAQ has a `status`. Only `approved` items are published or passed to a chatbot. Draft text is never shown.
3. **`/knowledge.json`** is generated on every build. It contains approved public information only: business details, the offer, what packages include, the price note, approved destinations (with `from` prices and the "estimate" warning), approved FAQs, links to the policies, and how to hand over to a human. It is marked noindex so Google ignores it.
4. **A hand-over route.** The enquiry form, WhatsApp and email are listed in the file for the bot to offer.

## Approving destination content

Each destination file starts as `"status": "draft"`. The best-time, highlights and good-for notes are general travel knowledge written as a starting point. For each destination: check them against what you really offer, write the `overview`, add `faqs` (`question` and `answer`), then set `"status": "approved"` and fill in `review.approved_by` and `review.approved_on`. The site then also publishes a page for it at `/destinations/<slug>/`.

## Rules for the future chatbot

- Answer only from `/knowledge.json`. If the answer is not there, say so and offer the enquiry form or WhatsApp.
- Never quote a final price, availability or a hotel name. Quote "from" prices as estimates and say a written quote follows.
- Never give legal, visa or insurance advice beyond what the FAQs say.
- Collect leads only through the existing form (with consent), not inside the chat.
- Do not store chat transcripts with personal details in GitHub. Decide the retention period and update the privacy policy first.
- Review the bot's answers weekly for the first month.

## Choosing a tool later

Options range from a hosted chat widget that reads `/knowledge.json` to a small Netlify Function that calls an AI service. Any of these needs an API key kept as a **Netlify environment variable**, never in these files. See docs/ACCOUNTS_AND_COSTS.md.
