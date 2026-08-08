# Ticker — Crypto Tracker

A real-time cryptocurrency dashboard built with React and Vite, powered by the CoinGecko API. Browse live prices, track 24h movers on a scrolling ticker tape, and drill into any coin for a 7-day price chart and market stats.

## Features

- **Live market data** for the top 100 coins by market cap, auto-refreshing every 30 seconds
- **Ticker tape** highlighting the day's biggest movers by absolute 24h change
- **Search** by coin name or symbol
- **Sort** by rank, name, price, 24h change, or market cap
- **Grid and list views**, each with inline 7-day sparklines
- **Coin detail page** with a 7-day price chart, 24h high/low, market cap, volume, and supply stats
- **Client-side caching** to reduce redundant API calls (30s for market data, 60s for coin detail and chart data)

## Tech Stack

| Layer      | Tool                                      |
| ---------- | ------------------------------------------ |
| Framework  | [React](https://react.dev)                 |
| Build tool | [Vite](https://vite.dev)                   |
| Routing    | [React Router](https://reactrouter.com)    |
| Charts     | [Recharts](https://recharts.org)           |
| Data       | [CoinGecko API](https://www.coingecko.com/en/api) |

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

This project calls the CoinGecko API with a Demo API key. Create a `.env` file in the project root:

```bash
VITE_COINGECKO_API_KEY=your_api_key_here
```

> **Note:** The API key is currently hardcoded in `src/api/coinGecko.js`. Before deploying, move it to an environment variable (`import.meta.env.VITE_COINGECKO_API_KEY`) so it isn't committed to version control.

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
│   └── coinGecko.js      # API client + response caching
├── components/
│   └── CryptoCard.jsx    # Grid/list card with sparkline
├── pages/
│   ├── Home.jsx          # Market list, search, sort, ticker tape
│   └── CoinDetail.jsx    # Single-coin detail view with chart
├── utils/
│   └── formatter.js      # Price, market cap, and % change formatting
└── index.css             # Design tokens and component styles
```

## Data Source

Market data, coin details, and historical price charts are fetched from the [CoinGecko API v3](https://docs.coingecko.com/reference/introduction). Rate limits apply on the free Demo tier — the built-in caching layer is tuned to stay within them under normal use.

## License

MIT