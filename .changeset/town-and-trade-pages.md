---
"web": minor
---

Town and trade pages for search engines (KES-136): a page for each of the 4 trades in each of the 8 councils, such as `/roofing-leads/bromley`, and `/planning-leads` listing them all, linked from the footer. Each shows the council's numbers for the trade from `GET /public/councils/:council`, a few examples as the free plan shows them, and a trial button whose ref (`seo-roofing-bromley`) shows in the funnel. The build writes each page's own HTML (title, description, canonical address) and makes `sitemap.xml` from the same lists, which the dev server serves too. `LeadCard` can leave the distance off.
