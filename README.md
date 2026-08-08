# Ticker — Crypto Tracker

A real-time cryptocurrency dashboard built with React and Vite, powered by the CoinGecko API. Browse live prices, track 24h movers on a scrolling ticker tape, and drill into any coin for a 7-day price chart and market stats.

## Features

- **Live market data** for the top 100 coins by market cap, auto-refreshing every 30 seconds
- **Ticker tape** highlighting the day's biggest movers by absolute 24h change
- **Search** by coin name or symbol
- **Sort** by rank, name, price, 24h change, or market cap
- **Grid and list views**, each with inline 7-day sparklines
- **Coin detail page** with a 7-day price chart, 24h high/low, market cap, volume, and supply stats
- **News feed** on the homepage (market-wide) and coin detail page (filtered to that coin), via cryptocurrency.cv
- **Client-side caching** to reduce redundant API calls (30s for market data, 60s for coin detail, chart, and news data)

## Tech Stack

| Layer      | Tool                                      |
| ---------- | ------------------------------------------ |
| Framework  | [React](https://react.dev)                 |
| Build tool | [Vite](https://vite.dev)                   |
| Routing    | [React Router](https://reactrouter.com)    |
| Charts     | [Recharts](https://recharts.org)           |
| Market data | [CoinGecko API](https://www.coingecko.com/en/api) |
| News       | [cryptocurrency.cv](https://cryptocurrency.cv) (free, no API key) |

## Getting Started

### Prerequisites

- Node.js 18 or later
- A [CoinGecko API key](https://www.coingecko.com/en/api/pricing) (the free Demo tier works fine)

### Installation

```bash
git clone <your-repo-url>
cd <your-repo-name>
npm install
```

### Environment variables

This project needs one free API key, for market data (CoinGecko). The news feed uses [cryptocurrency.cv](https://cryptocurrency.cv), which requires no key.

Sign up at the [CoinGecko API pricing page](https://www.coingecko.com/en/api/pricing) and grab your Demo API key from the developer dashboard.

Copy the example file and fill in your key:

```bash
cp .env.example .env
```

```bash
VITE_COINGECKO_API_KEY=your_coingecko_api_key_here
```

`.env` is already covered by `.gitignore`, so your key won't be committed. Note that Vite inlines `VITE_*` variables into the client bundle at build time — fine for a free-tier key with generous rate limits, but don't use this pattern for a key tied to billing.

### Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/
│   ├── coinGecko.js       # Market data client + response caching
│   └── cryptoNews.js      # News client + response caching
├── components/
│   ├── CryptoCard.jsx     # Grid/list card with sparkline
│   └── NewsPanel.jsx      # News feed (used on both pages)
├── pages/
│   ├── Home.jsx           # Market list, search, sort, ticker tape, news
│   └── CoinDetail.jsx     # Single-coin detail view with chart and news
├── utils/
│   └── formatter.js       # Price, market cap, % change, and time formatting
└── index.css              # Design tokens and component styles
```

## Data Sources

- **Market data, coin details, and price history** — [CoinGecko API v3](https://docs.coingecko.com/reference/introduction). Rate limits apply on the free Demo tier — the built-in caching layer is tuned to stay within them under normal use.
- **News** — [cryptocurrency.cv](https://cryptocurrency.cv), a free, keyless, open-source news aggregator. The homepage shows the general market feed; the coin detail page filters to that coin's ticker. It's a smaller independent project rather than an established provider, so the news section is built to fail silently (it simply doesn't render) if the API is ever unavailable.

## License

MIT