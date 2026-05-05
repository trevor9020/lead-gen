# Lead Gen — Video Gap Detector

A lead generation dashboard for video production agencies. Finds local businesses with weak or absent video presence and generates branded audit report cards for cold outreach.

## What it does

- **Audit Tool** — paste a business name + city, get a video presence score (0–4) and a branded PDF report card
- **Map View** — draw a radius on Google Maps, see color-coded business pins by video score
- **Leads Table** — track contacted leads, reply status, and bulk generate audit cards

## The signal

Most lead gen tools filter by SEO metrics. This tool filters by **video absence** — no YouTube channel, no homepage video, no Instagram Reels, no TikTok. That gap is the pitch.

## Stack

- Next.js (App Router)
- Google Maps JS SDK + Places API
- YouTube Data API v3
- Playwright (website scraping + PDF generation)
- Tailwind CSS

## Phases

- **Phase 1** — Audit Card Tool (single business lookup + bulk CSV)
- **Phase 2** — Map Discovery Layer (radius/region search with color-coded pins)
