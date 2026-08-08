import { useEffect, useState } from "react";
import { fetchGlobalMarketData } from "../api/coinGecko";
import { formatMarketCap, formatChange } from "../utils/formatter";
import { FearGreedGauge } from "./FearGreedGauge";

export const MarketStatsBar = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        let cancelled = false;

        fetchGlobalMarketData()
            .then((data) => {
                if (cancelled) return;
                setStats({
                    marketCap: data.total_market_cap?.usd,
                    volume: data.total_volume?.usd,
                    btcDominance: data.market_cap_percentage?.btc,
                    ethDominance: data.market_cap_percentage?.eth,
                    marketCapChange: data.market_cap_change_percentage_24h_usd,
                    activeCryptos: data.active_cryptocurrencies,
                });
            })
            .catch((err) => console.error("Error fetching global market data: ", err));

        return () => {
            cancelled = true;
        };
    }, []);

    if (!stats) return null;

    const changeIsPositive = stats.marketCapChange >= 0;

    return (
        <div className="market-stats-bar">
            <div className="market-stat">
                <span className="stat-label">Market Cap</span>
                <span className="stat-value">
                    ${formatMarketCap(stats.marketCap)}{" "}
                    <span className={changeIsPositive ? "positive" : "negative"}>
                        {formatChange(stats.marketCapChange)}
                    </span>
                </span>
            </div>

            <div className="market-stat">
                <span className="stat-label">24h Volume</span>
                <span className="stat-value">${formatMarketCap(stats.volume)}</span>
            </div>

            <div className="market-stat">
                <span className="stat-label">BTC Dominance</span>
                <span className="stat-value">{stats.btcDominance?.toFixed(1)}%</span>
            </div>

            <div className="market-stat">
                <span className="stat-label">ETH Dominance</span>
                <span className="stat-value">{stats.ethDominance?.toFixed(1)}%</span>
            </div>

            <div className="market-stat">
                <span className="stat-label">Active Coins</span>
                <span className="stat-value">
                    {stats.activeCryptos?.toLocaleString()}
                </span>
            </div>

            <FearGreedGauge />
        </div>
    );
};