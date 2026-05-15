# MacroMonitor

**Live:** https://a-pamimo.github.io/MacroMonitor/

A real-time macroeconomic dashboard for the US and Canada. Pulls live indicators — inflation, employment, GDP, yield curves, policy rates — from FRED and surfaces them in a single readable interface.

## Why

Official economic data in Canada is published with a 3–6 month lag. By the time the headline numbers land, the picture has already moved. MacroMonitor pulls from live sources so the dashboard reflects the most recent observations available, not last quarter's snapshot.

## What's in it

- **Dual-region view** — toggle between US and Canadian indicators
- **US indicators** — yield curve (10Y–2Y), CPI YoY, unemployment, GDP growth, Fed funds rate, retail sales, housing starts
- **Canada indicators** — 10Y bond yield, CPI YoY, unemployment, BoC policy rate
- **Recession signal** — visual warning when the US 10Y–2Y curve inverts
- **AI Macro Analyst** — Gemini-generated executive summary of the current cycle
- **Macro Dictionary** — plain-language explanations of each indicator

## Stack

- Vite + React 19 + TypeScript
- Recharts for visualization
- FRED API for economic series, proxied via corsproxy.io (FRED doesn't send CORS headers)
- Google Gemini for the AI analyst panel
- GitHub Actions → GitHub Pages for deployment

## Run locally

Prerequisites: Node.js 18+

```bash
npm install
```

Create a `.env.local` with your Gemini key (optional — the dashboard works without it, but the AI Analyst panel won't):

```
GEMINI_API_KEY=your_key_here
```

Then:

```bash
npm run dev
```

The app runs on http://localhost:3000.

## Build

```bash
npm run build
npm run preview
```

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. The `GEMINI_API_KEY` repository secret is injected at build time.

## Known limitations

- Canada is currently shown with 4 indicators instead of 7 — FRED has deprecated the OECD-MEI series previously used for Canadian GDP, retail sales, and housing starts. The Statistics Canada API is the next step for full parity.
- API requests go through a public CORS proxy (FRED doesn't enable CORS). For production reliability this should be replaced with a self-hosted proxy (e.g. a Cloudflare Worker).
