const BASE_URL = import.meta.env.VITE_CRYPTO_NEWS_BASE_URL;
const NEWS_CACHE_TTL_MS = 60_000;

const newsCache = new Map();

const buildCacheKey = (params) => JSON.stringify(params);

// Root origin of the news API (e.g. "https://cryptocurrency.cv"). Derived
// from BASE_URL's origin rather than trusting BASE_URL's full path — the
// docs' base URL is https://cryptocurrency.cv/api with individual
// endpoints (/api/news, /api/fear-greed, /api/sentiment, ...) hanging off
// of it, so every endpoint is built explicitly from this origin instead of
// assuming BASE_URL already points at the right one.
export const NEWS_ROOT_URL = (() => {
    try {
        return new URL(BASE_URL).origin;
    } catch {
        return BASE_URL;
    }
})();

const NEWS_ENDPOINT = `${NEWS_ROOT_URL}/api/news`;

// The API's exact field names aren't fully documented, so each post is
// normalized here rather than trusting one shape — keeps the UI stable
// even if a field is named slightly differently than expected.
const normalizePost = (post, index) => ({
    id: post.id || post.url || post.link || `${post.title}-${index}`,
    title: post.title,
    url: post.url || post.link,
    source:
        (typeof post.source === "string" ? post.source : post.source?.name) ||
        post.domain ||
        "Unknown",
    publishedAt:
        post.publishedAt || post.published_at || post.date || post.pubDate,
});

/**
 * Fetch news articles from cryptocurrency.cv (free, no API key required).
 * See https://cryptocurrency.cv/developers — GET /api/news.
 *
 * @param {Object} options
 * @param {string} [options.currency] - Coin name/symbol to search for (e.g. "Bitcoin", "BTC").
 *   The API has no ticker filter, so this is passed as a `search` query.
 * @param {string} [options.category] - One of: bitcoin, ethereum, defi, nft, altcoins, regulation, trading, mining, web3.
 * @param {string} [options.source] - Filter by source name, e.g. "coindesk".
 * @param {number} [options.limit] - Number of articles to return (server default 20, max 100).
 * @param {number} [options.offset] - Pagination offset (default 0).
 */
export const fetchNews = async ({
    currency,
    category,
    source,
    limit = 8,
    offset = 0,
} = {}) => {
    const cacheKey = buildCacheKey({ currency, category, source, limit, offset });
    const now = Date.now();
    const cached = newsCache.get(cacheKey);

    if (cached && now - cached.timestamp < NEWS_CACHE_TTL_MS) {
        return cached.data;
    }

    const url = new URL(NEWS_ENDPOINT);
    url.searchParams.set("limit", String(Math.min(limit, 100)));
    if (offset) url.searchParams.set("offset", String(offset));
    if (category) url.searchParams.set("category", category);
    if (source) url.searchParams.set("source", source);
    if (currency) url.searchParams.set("search", currency);

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error("Failed to fetch news");
    }

    const data = await response.json();
    const posts = (data.articles || []).map(normalizePost);

    newsCache.set(cacheKey, { data: posts, timestamp: now });

    return posts;
};

/**
 * Breaking news from the last 2 hours (GET /api/breaking).
 * @param {number} [limit] - Number of articles (server default 5).
 */
export const fetchBreakingNews = async (limit = 5) => {
    const url = new URL(`${NEWS_ROOT_URL}/api/breaking`);
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error("Failed to fetch breaking news");
    }

    const data = await response.json();
    return (data.articles || []).map(normalizePost);
};