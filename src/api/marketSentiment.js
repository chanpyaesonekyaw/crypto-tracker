import { NEWS_ROOT_URL } from "./cryptoNews";

const SENTIMENT_CACHE_TTL_MS = 5 * 60_000;
const FEAR_GREED_CACHE_TTL_MS = 5 * 60_000;

const sentimentCache = new Map();
let fearGreedCache = { data: null, timestamp: 0 };

/**
 * Fetch the market-wide Fear & Greed Index from cryptocurrency.cv
 * (GET /api/fear-greed). Resolves to null — instead of throwing — on
 * any failure, so callers can just hide the widget rather than show
 * a broken UI.
 */
export const fetchFearGreedIndex = async () => {
    const now = Date.now();

    if (fearGreedCache.data && now - fearGreedCache.timestamp < FEAR_GREED_CACHE_TTL_MS) {
        return fearGreedCache.data;
    }

    try {
        const response = await fetch(`${NEWS_ROOT_URL}/api/fear-greed?days=7`);
        if (!response.ok) return null;

        const data = await response.json();
        if (typeof data.value !== "number") return null;

        const normalized = {
            value: data.value,
            classification: data.classification || null,
        };

        fearGreedCache = { data: normalized, timestamp: now };
        return normalized;
    } catch (err) {
        console.error("Error fetching Fear & Greed index: ", err);
        return null;
    }
};

/**
 * Fetch AI-analyzed news sentiment for one asset ticker (e.g. "BTC")
 * from cryptocurrency.cv (GET /api/sentiment?asset=...). Resolves to
 * null on failure so the caller can hide the badge.
 */
export const fetchCoinSentiment = async (symbol) => {
    if (!symbol) return null;

    const ticker = symbol.toUpperCase();
    const now = Date.now();
    const cached = sentimentCache.get(ticker);

    if (cached && now - cached.timestamp < SENTIMENT_CACHE_TTL_MS) {
        return cached.data;
    }

    try {
        const response = await fetch(
            `${NEWS_ROOT_URL}/api/sentiment?asset=${encodeURIComponent(ticker)}&limit=20`
        );
        if (!response.ok) return null;

        const data = await response.json();
        const market = data.market;
        if (!market || !market.overall) return null;

        const normalized = {
            label: market.overall,
            score: market.score ?? null,
            confidence: market.confidence ?? null,
            breakdown: market.breakdown ?? null,
        };

        sentimentCache.set(ticker, { data: normalized, timestamp: now });
        return normalized;
    } catch (err) {
        console.error("Error fetching coin sentiment: ", err);
        return null;
    }
};