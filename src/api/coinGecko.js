const BASE_URL = import.meta.env.VITE_COINGECKO_BASE_URL;
const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;
const MARKET_CACHE_TTL_MS = 30_000;
const DETAIL_CACHE_TTL_MS = 60_000;
const CHART_CACHE_TTL_MS = 60_000;
const GLOBAL_CACHE_TTL_MS = 60_000;
const TRENDING_CACHE_TTL_MS = 5 * 60_000;

const marketCache = {
    data: null,
    timestamp: 0,
};

const coinDataCache = new Map();
const chartDataCache = new Map();
const globalCache = { data: null, timestamp: 0 };
const trendingCache = { data: null, timestamp: 0 };

// CoinGecko uses a different query-param name depending on which host/plan
// you're on: Pro (pro-api.coingecko.com) wants x_cg_pro_api_key, Demo
// (api.coingecko.com) wants x_cg_demo_api_key. Sending the wrong one isn't
// rejected outright — CoinGecko just ignores it and treats the request as
// anonymous, which hits the much stricter public rate limit and can surface
// in the browser as a CORS error on the resulting 429/401 response.
const API_KEY_PARAM = BASE_URL?.includes("pro-api.coingecko.com")
    ? "x_cg_pro_api_key"
    : "x_cg_demo_api_key";

const buildCoinGeckoUrl = (path, params = {}) => {
    const url = new URL(`${BASE_URL}${path}`);

    url.searchParams.set(API_KEY_PARAM, API_KEY);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    return url.toString();
};

export const fetchCryptos = async () => {
    const now = Date.now();

    if (marketCache.data && now - marketCache.timestamp < MARKET_CACHE_TTL_MS) {
        return marketCache.data;
    }

    const response = await fetch(
        buildCoinGeckoUrl("/coins/markets", {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: "100",
            page: "1",
            sparkline: "true",
            price_change_percentage: "24h",
        })
    );

    if (!response.ok) {
        throw new Error("Failed to fetch cryptos");
    }

    const data = await response.json();
    marketCache.data = data;
    marketCache.timestamp = now;

    return data;
};

export const fetchCoinData = async (id) => {
    const now = Date.now();
    const cacheEntry = coinDataCache.get(id);

    if (cacheEntry && now - cacheEntry.timestamp < DETAIL_CACHE_TTL_MS) {
        return cacheEntry.data;
    }

    const response = await fetch(
        buildCoinGeckoUrl(`/coins/${id}`, {
            localization: "false",
            tickers: "false",
            market_data: "true",
            community_data: "false",
            developer_data: "false",
            sparkline: "false",
        })
    );
    if (!response.ok) {
        throw new Error("Failed to fetch coin data");
    }

    const data = await response.json();
    coinDataCache.set(id, {
        data,
        timestamp: now,
    });

    return data;
};

export const fetchChartData = async (id) => {
    const now = Date.now();
    const cacheEntry = chartDataCache.get(id);

    if (cacheEntry && now - cacheEntry.timestamp < CHART_CACHE_TTL_MS) {
        return cacheEntry.data;
    }

    const response = await fetch(
        buildCoinGeckoUrl(`/coins/${id}/market_chart`, {
            vs_currency: "usd",
            days: "7",
        })
    );
    if (!response.ok) {
        throw new Error("Failed to fetch chart data");
    }

    const data = await response.json();
    chartDataCache.set(id, {
        data,
        timestamp: now,
    });

    return data;
};

/**
 * Aggregate global market data — total market cap, 24h volume,
 * BTC/ETH dominance, and how many markets moved that number.
 * Powers the stats bar at the top of the Home page.
 */
export const fetchGlobalMarketData = async () => {
    const now = Date.now();

    if (globalCache.data && now - globalCache.timestamp < GLOBAL_CACHE_TTL_MS) {
        return globalCache.data;
    }

    const response = await fetch(buildCoinGeckoUrl("/global"));
    if (!response.ok) {
        throw new Error("Failed to fetch global market data");
    }

    const { data } = await response.json();
    globalCache.data = data;
    globalCache.timestamp = now;

    return data;
};

/**
 * Coins with the biggest search-volume spikes on CoinGecko right now.
 * Powers the "Trending" strip on the Home page.
 */
export const fetchTrendingCoins = async () => {
    const now = Date.now();

    if (trendingCache.data && now - trendingCache.timestamp < TRENDING_CACHE_TTL_MS) {
        return trendingCache.data;
    }

    const response = await fetch(buildCoinGeckoUrl("/search/trending"));
    if (!response.ok) {
        throw new Error("Failed to fetch trending coins");
    }

    const data = await response.json();
    const coins = (data.coins || []).map((entry) => entry.item);

    trendingCache.data = coins;
    trendingCache.timestamp = now;

    return coins;
};