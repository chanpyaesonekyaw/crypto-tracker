import { useNavigate, useParams } from "react-router-dom";
import { fetchChartData, fetchCoinData } from "../api/coinGecko";
import { useEffect, useState } from "react";
import { formatMarketCap, formatPrice, formatChange, formatDate, stripHtml } from "../utils/formatter";
import { NewsPanel } from "../components/NewsPanel";
import {
    CartesianGrid,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Line,
    Tooltip,
} from "recharts";

const DESCRIPTION_PREVIEW_LENGTH = 320;

export const CoinDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [coin, setCoin] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [descExpanded, setDescExpanded] = useState(false);

    useEffect(() => {
        loadCoinData();
        loadChartData();
    }, [id]);

    const loadCoinData = async () => {
        try {
            const data = await fetchCoinData(id);
            setCoin(data);
        } catch (err) {
            console.error("Error fetching crypto: ", err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadChartData = async () => {
        try {
            const data = await fetchChartData(id);

            const dailyPriceMap = new Map();

            data.prices.forEach((price) => {
                const timestamp = price[0];
                const date = new Date(timestamp);
                const dateKey = date.toISOString().slice(0, 10);

                if (!dailyPriceMap.has(dateKey)) {
                    dailyPriceMap.set(dateKey, {
                        time: date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            timeZone: "UTC",
                        }),
                        price: Number(price[1]).toFixed(2),
                    });
                }
            });

            const formattedData = Array.from(dailyPriceMap.values());

            setChartData(formattedData);
        } catch (err) {
            console.error("Error fetching crypto: ", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="app">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading coin data...</p>
                </div>
            </div>
        );
    }

    if (!coin) {
        return (
            <div className="app">
                <div className="no-results">
                    <p>Coin not found</p>
                    <button className="back-button" onClick={() => navigate("/")}>
                        ← Back to List
                    </button>
                </div>
            </div>
        );
    }

    const marketData = coin.market_data;
    const priceChange = marketData.price_change_percentage_24h || 0;
    const isPositive = priceChange >= 0;

    const periodChanges = [
        { label: "24h", value: marketData.price_change_percentage_24h },
        { label: "7d", value: marketData.price_change_percentage_7d },
        { label: "30d", value: marketData.price_change_percentage_30d },
        { label: "1y", value: marketData.price_change_percentage_1y },
    ];

    const athPrice = marketData.ath?.usd;
    const atlPrice = marketData.atl?.usd;
    const currentPrice = marketData.current_price.usd;
    const rangePercent =
        athPrice && atlPrice !== undefined && athPrice > atlPrice
            ? Math.min(100, Math.max(0, ((currentPrice - atlPrice) / (athPrice - atlPrice)) * 100))
            : null;

    const description = stripHtml(coin.description?.en).trim();
    const showReadMore = description.length > DESCRIPTION_PREVIEW_LENGTH;
    const descriptionText =
        showReadMore && !descExpanded
            ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}…`
            : description;

    const explorerLink = coin.links?.blockchain_site?.find(Boolean);

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <div className="logo-section">
                        <h1>Ticker</h1>
                        <p>Live cryptocurrency prices &amp; market data</p>
                    </div>

                    <button onClick={() => navigate("/")} className="back-button">
                        ← Back to List
                    </button>
                </div>
            </header>

            <div className="coin-detail">
                <div className="coin-header">
                    <div className="coin-title">
                        <img src={coin.image.large} alt={coin.name} />
                        <div>
                            <h1>{coin.name}</h1>
                            <p className="symbol">{coin.symbol.toUpperCase()}</p>
                        </div>
                    </div>
                    <span className="rank">Rank #{marketData.market_cap_rank}</span>
                </div>

                <div className="coin-price-section">
                    <div className="current-price">
                        <h2>{formatPrice(currentPrice)}</h2>
                        <span
                            className={`change-badge ${isPositive ? "positive" : "negative"}`}
                        >
                            {isPositive ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)}%
                        </span>
                    </div>

                    <div className="period-changes">
                        {periodChanges.map(({ label, value }) => (
                            <div key={label} className="period-chip">
                                <span className="period-label">{label}</span>
                                <span
                                    className={
                                        value === null || value === undefined
                                            ? ""
                                            : value >= 0
                                                ? "positive"
                                                : "negative"
                                    }
                                >
                                    {formatChange(value)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="price-ranges">
                        <div className="price-range">
                            <span className="range-label">24h High</span>
                            <span className="range-value">
                                {formatPrice(marketData.high_24h.usd)}
                            </span>
                        </div>
                        <div className="price-range">
                            <span className="range-label">24h Low</span>
                            <span className="range-value">
                                {formatPrice(marketData.low_24h.usd)}
                            </span>
                        </div>
                    </div>

                    {rangePercent !== null && (
                        <div className="ath-atl-bar">
                            <div className="range-track">
                                <div className="range-marker" style={{ left: `${rangePercent}%` }} />
                            </div>
                            <div className="range-endpoints">
                                <span>ATL {formatPrice(atlPrice)}</span>
                                <span>ATH {formatPrice(athPrice)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {description && (
                    <div className="coin-about">
                        <h3>About {coin.name}</h3>
                        <p className="coin-description">{descriptionText}</p>
                        {showReadMore && (
                            <button
                                className="read-more-btn"
                                onClick={() => setDescExpanded((v) => !v)}
                            >
                                {descExpanded ? "Show less" : "Read more"}
                            </button>
                        )}

                        {(coin.links?.homepage?.[0] ||
                            coin.links?.twitter_screen_name ||
                            coin.links?.subreddit_url ||
                            explorerLink) && (
                                <div className="coin-links">
                                    {coin.links.homepage?.[0] && (
                                        <a
                                            href={coin.links.homepage[0]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="coin-link-pill"
                                        >
                                            Website
                                        </a>
                                    )}
                                    {coin.links.twitter_screen_name && (
                                        <a
                                            href={`https://twitter.com/${coin.links.twitter_screen_name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="coin-link-pill"
                                        >
                                            Twitter
                                        </a>
                                    )}
                                    {coin.links.subreddit_url && (
                                        <a
                                            href={coin.links.subreddit_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="coin-link-pill"
                                        >
                                            Reddit
                                        </a>
                                    )}
                                    {explorerLink && (
                                        <a
                                            href={explorerLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="coin-link-pill"
                                        >
                                            Explorer
                                        </a>
                                    )}
                                </div>
                            )}
                    </div>
                )}

                <div className="chart-section">
                    <h3>Price Chart · 7 Days</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255, 255, 255, 0.06)"
                            />

                            <XAxis
                                dataKey="time"
                                stroke="#5B6474"
                                style={{ fontSize: "12px", fontFamily: "IBM Plex Mono, monospace" }}
                            />
                            <YAxis
                                stroke="#5B6474"
                                style={{ fontSize: "12px", fontFamily: "IBM Plex Mono, monospace" }}
                                domain={["auto", "auto"]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#12161F",
                                    border: "1px solid #232935",
                                    borderRadius: "6px",
                                    color: "#EDEFF3",
                                    fontFamily: "IBM Plex Mono, monospace",
                                    fontSize: "13px",
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke="#E8A33D"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">Market Cap</span>
                        <span className="stat-value">
                            ${formatMarketCap(marketData.market_cap.usd)}
                        </span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-label">Fully Diluted Valuation</span>
                        <span className="stat-value">
                            {marketData.fully_diluted_valuation?.usd
                                ? `$${formatMarketCap(marketData.fully_diluted_valuation.usd)}`
                                : "N/A"}
                        </span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-label">Volume (24h)</span>
                        <span className="stat-value">
                            ${formatMarketCap(marketData.total_volume.usd)}
                        </span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-label">Circulating Supply</span>
                        <span className="stat-value">
                            {marketData.circulating_supply?.toLocaleString() || "N/A"}{" "}
                            {coin.symbol.toUpperCase()}
                        </span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-label">Total Supply</span>
                        <span className="stat-value">
                            {marketData.total_supply?.toLocaleString() || "N/A"}
                        </span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-label">Max Supply</span>
                        <span className="stat-value">
                            {marketData.max_supply?.toLocaleString() || "∞"}
                        </span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-label">All-Time High</span>
                        <span className="stat-value">
                            {formatPrice(athPrice)}{" "}
                            <span
                                className={
                                    marketData.ath_change_percentage?.usd >= 0
                                        ? "positive"
                                        : "negative"
                                }
                            >
                                {formatChange(marketData.ath_change_percentage?.usd)}
                            </span>
                        </span>
                        <span className="stat-subvalue">
                            {formatDate(marketData.ath_date?.usd)}
                        </span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-label">All-Time Low</span>
                        <span className="stat-value">
                            {formatPrice(atlPrice)}{" "}
                            <span
                                className={
                                    marketData.atl_change_percentage?.usd >= 0
                                        ? "positive"
                                        : "negative"
                                }
                            >
                                {formatChange(marketData.atl_change_percentage?.usd)}
                            </span>
                        </span>
                        <span className="stat-subvalue">
                            {formatDate(marketData.atl_date?.usd)}
                        </span>
                    </div>
                </div>

                <div className="news-wrapper">
                    <NewsPanel
                        currency={coin.symbol}
                        title={`${coin.name} News`}
                        limit={6}
                    />
                </div>
            </div>
            <footer className="footer">
                <p>Data provided by CoinGecko &middot; Refreshes every 30 seconds</p>
            </footer>
        </div>
    );
};