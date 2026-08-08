import { Link } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { formatPrice, formatMarketCap, formatChange } from "../utils/formatter";

export const CryptoCard = ({ crypto, viewMode = "grid" }) => {
    const isPositive = crypto.price_change_percentage_24h >= 0;
    const sparkline = crypto.sparkline_in_7d?.price;
    const sparklineData = sparkline
        ? sparkline
            .filter((_, i) => i % 4 === 0)
            .map((price, i) => ({ i, price }))
        : [];

    return (
        <Link to={`/coin/${crypto.id}`} className="crypto-card-link">
            <div className="crypto-card" data-view={viewMode}>
                <div className="crypto-info">
                    <span className="rank">{crypto.market_cap_rank}</span>
                    <img src={crypto.image} alt={crypto.name} />
                    <div className="crypto-name">
                        <h3>{crypto.name}</h3>
                        <p className="symbol">{crypto.symbol.toUpperCase()}</p>
                    </div>
                </div>

                <div className="crypto-price">
                    <p className="price">{formatPrice(crypto.current_price)}</p>
                    <p className={`change ${isPositive ? "positive" : "negative"}`}>
                        <span className="change-arrow">{isPositive ? "▲" : "▼"}</span>
                        {formatChange(crypto.price_change_percentage_24h)}
                    </p>
                </div>

                {sparklineData.length > 0 && (
                    <div className="sparkline">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparklineData}>
                                <YAxis domain={["dataMin", "dataMax"]} hide />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke={isPositive ? "var(--positive)" : "var(--negative)"}
                                    strokeWidth={1.5}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="crypto-stats">
                    <div className="stat">
                        <span className="stat-label">Mkt Cap</span>
                        <span className="stat-value">
                            ${formatMarketCap(crypto.market_cap)}
                        </span>
                    </div>

                    <div className="stat">
                        <span className="stat-label">Volume</span>
                        <span className="stat-value">
                            ${formatMarketCap(crypto.total_volume)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};