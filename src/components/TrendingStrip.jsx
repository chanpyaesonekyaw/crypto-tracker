import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTrendingCoins } from "../api/coinGecko";

export const TrendingStrip = () => {
    const [coins, setCoins] = useState([]);

    useEffect(() => {
        let cancelled = false;

        fetchTrendingCoins()
            .then((data) => {
                if (!cancelled) setCoins(data);
            })
            .catch((err) => console.error("Error fetching trending coins: ", err));

        return () => {
            cancelled = true;
        };
    }, []);

    if (coins.length === 0) return null;

    return (
        <div className="trending-strip">
            <span className="trending-label">🔥 Trending</span>
            <div className="trending-list">
                {coins.slice(0, 7).map((coin) => (
                    <Link to={`/coin/${coin.id}`} key={coin.id} className="trending-chip">
                        <img src={coin.small} alt={coin.name} />
                        <span>{coin.symbol?.toUpperCase()}</span>
                        {typeof coin.data?.price_change_percentage_24h?.usd === "number" && (
                            <span
                                className={
                                    coin.data.price_change_percentage_24h.usd >= 0
                                        ? "positive"
                                        : "negative"
                                }
                            >
                                {coin.data.price_change_percentage_24h.usd >= 0 ? "▲" : "▼"}
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
};