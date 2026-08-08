export const formatPrice = (price) => {
    if (price < 0.01) return price.toFixed(8);
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
};

export const formatMarketCap = (marketCap) => {
    if (marketCap === null || marketCap === undefined) return "N/A";
    if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `${(marketCap / 1e6).toFixed(2)}M`;
    return marketCap.toLocaleString();
};

export const formatChange = (change) => {
    if (change === null || change === undefined || Number.isNaN(change)) return "N/A";
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
};

export const formatTimeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diffMs / 60_000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

// Short calendar date — used for ATH/ATL timestamps.
export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

// Strips HTML tags out of CoinGecko's rich-text coin descriptions.
export const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
};