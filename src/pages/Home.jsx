import { useEffect, useMemo, useState } from "react";
import { fetchCryptos } from "../api/coinGecko";
import { CryptoCard } from "../components/CryptoCard";
import { formatChange } from "../utils/formatter";

export const Home = () => {
    const [cryptoList, setCryptoList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState("grid");
    const [sortBy, setSortBy] = useState("market_cap_rank");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchCryptoData();

        let interval = null;

        const startPolling = () => {
            if (interval) return;
            interval = setInterval(fetchCryptoData, 30_000);
        };

        const stopPolling = () => {
            clearInterval(interval);
            interval = null;
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                // Tab just became active again — refresh immediately rather
                // than waiting up to 30s for the next tick, then resume polling.
                fetchCryptoData();
                startPolling();
            } else {
                stopPolling();
            }
        };

        startPolling();
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            stopPolling();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        filterAndSort();
    }, [sortBy, cryptoList, searchQuery]);

    const fetchCryptoData = async () => {
        try {
            const data = await fetchCryptos();
            setCryptoList(data);
        } catch (err) {
            console.error("Error fetching crypto: ", err);
        } finally {
            setIsLoading(false);
        }
    };

    const filterAndSort = () => {
        let filtered = cryptoList.filter(
            (crypto) =>
                crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "price":
                    return a.current_price - b.current_price;
                case "price_desc":
                    return b.current_price - a.current_price;
                case "change":
                    return a.price_change_percentage_24h - b.price_change_percentage_24h;
                case "market_cap":
                    return a.market_cap - b.market_cap;
                default:
                    return a.market_cap_rank - b.market_cap_rank;
            }
        });

        setFilteredList(filtered);
    };

    const topMovers = useMemo(() => {
        return [...cryptoList]
            .filter((c) => c.price_change_percentage_24h !== null)
            .sort(
                (a, b) =>
                    Math.abs(b.price_change_percentage_24h) -
                    Math.abs(a.price_change_percentage_24h)
            )
            .slice(0, 16);
    }, [cryptoList]);

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <div className="logo-section">
                        <h1>Ticker</h1>
                        <p>Live cryptocurrency prices &amp; market data</p>
                    </div>
                    <div className="search-section">
                        <input
                            type="text"
                            placeholder="Search by name or symbol"
                            className="search-input"
                            onChange={(e) => setSearchQuery(e.target.value)}
                            value={searchQuery}
                        />
                    </div>
                </div>
            </header>

            {!isLoading && topMovers.length > 0 && (
                <div className="ticker-tape">
                    <div className="ticker-track">
                        {[...topMovers, ...topMovers].map((crypto, i) => (
                            <span className="ticker-item" key={`${crypto.id}-${i}`}>
                                <span className="ticker-symbol">
                                    {crypto.symbol.toUpperCase()}
                                </span>
                                <span
                                    className={
                                        crypto.price_change_percentage_24h >= 0
                                            ? "positive"
                                            : "negative"
                                    }
                                >
                                    {formatChange(crypto.price_change_percentage_24h)}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="controls">
                <div className="filter-group">
                    <label>Sort by</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="market_cap_rank">Rank</option>
                        <option value="name">Name</option>
                        <option value="price">Price (Low to High)</option>
                        <option value="price_desc">Price (High to Low)</option>
                        <option value="change">24h Change</option>
                        <option value="market_cap">Market Cap</option>
                    </select>
                </div>
                <div className="view-toggle">
                    <button
                        className={viewMode === "grid" ? "active" : ""}
                        onClick={() => setViewMode("grid")}
                    >
                        Grid
                    </button>
                    <button
                        className={viewMode === "list" ? "active" : ""}
                        onClick={() => setViewMode("list")}
                    >
                        List
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="loading">
                    <div className="spinner" />
                    <p>Loading market data…</p>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="no-results">
                    <p>No coins match "{searchQuery}"</p>
                </div>
            ) : (
                <>
                    {viewMode === "list" && (
                        <div className="list-header">
                            <span>Asset</span>
                            <span>Price</span>
                            <span className="hide-mobile">7d</span>
                            <span className="hide-mobile">Mkt Cap</span>
                            <span className="hide-mobile">Volume</span>
                        </div>
                    )}
                    <div className={`crypto-container ${viewMode}`}>
                        {filteredList.map((crypto) => (
                            <CryptoCard crypto={crypto} viewMode={viewMode} key={crypto.id} />
                        ))}
                    </div>
                </>
            )}

            <footer className="footer">
                <p>Data provided by CoinGecko &middot; Refreshes every 30 seconds</p>
            </footer>
        </div>
    );
};