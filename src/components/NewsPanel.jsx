import { useEffect, useState } from "react";
import { fetchNews } from "../api/cryptoNews";
import { formatTimeAgo } from "../utils/formatter";

export const NewsPanel = ({ currency, title = "Latest News", limit = 6 }) => {
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState("loading"); // loading | ready | empty | error

    useEffect(() => {
        let cancelled = false;

        const loadNews = async () => {
            setStatus("loading");
            try {
                const data = await fetchNews({ currency, limit });
                if (cancelled) return;
                setPosts(data);
                setStatus(data.length ? "ready" : "empty");
            } catch (err) {
                console.error("Error fetching news: ", err);
                if (!cancelled) setStatus("error");
            }
        };

        loadNews();
        return () => {
            cancelled = true;
        };
    }, [currency, limit]);

    if (status === "error") return null;

    return (
        <div className="news-section">
            <h3>{title}</h3>

            {status === "loading" && (
                <div className="news-loading">
                    <div className="spinner" />
                </div>
            )}

            {status === "empty" && (
                <p className="news-empty">No recent news{currency ? ` for ${currency}` : ""}.</p>
            )}

            {status === "ready" && (
                <div className="news-list">
                    {posts.map((post) => (
                        <a
                            key={post.id}
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="news-item"
                        >
                            <p className="news-title">{post.title}</p>
                            <div className="news-meta">
                                <span className="news-source">{post.source}</span>
                                <span className="news-time">
                                    {formatTimeAgo(post.publishedAt)}
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            <p className="news-attribution">News via cryptocurrency.cv</p>
        </div>
    );
};