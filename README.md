# MacroMonitor

A real-time macroeconomic dashboard for the US and Canada. Pulls live indicators — inflation, employment, GDP, yield curves, policy rates, retail sales, housing — from FRED and surfaces them in a single readable interface.

## Why

Official economic data in Canada is published with a 3–6 month lag. By the time the headline numbers land, the picture has already moved. MacroMonitor pulls from live sources so the dashboard reflects the most recent observations available, not last quarter's snapshot.

## What's in it

- **Dual-region view** — toggle between US and Canadian indicators
- **Key metrics** — yield curve, CPI (YoY), unemployment, GDP growth, policy rate, retail sales, housing starts
- **Recession signal** — visual warning when the US 10Y–2Y curve inverts
- **AI Macro Analyst** — Gemini-generated executive summary of the current cycle
- **Macro Dictionary** — plain-language explanations of each indicator

## Stack

- Vite + React 19 + TypeScript
- Recharts for visualization
- FRED API for economic series (US series + OECD-mirrored Canadian series)
- Google Gemini for the AI analyst panel

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
