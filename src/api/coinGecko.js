const BASE_URL = "https://api.coingecko.com/api/v3";
const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;
const MARKET_CACHE_TTL_MS = 30_000;
const DETAIL_CACHE_TTL_MS = 60_000;
const CHART_CACHE_TTL_MS = 60_000;

const marketCache = {
    data: null,
    timestamp: 0,
};

const coinDataCache = new Map();
const chartDataCache = new Map();

const buildCoinGeckoUrl = (path, params = {}) => {
    const url = new URL(`${BASE_URL}${path}`);

    url.searchParams.set("x_cg_api_key", API_KEY);

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