import { useEffect, useState } from "react";
import { fetchFearGreedIndex } from "../api/marketSentiment";

const colorFor = (value) => {
    if (value >= 55) return "var(--positive)";
    if (value >= 45) return "var(--text-secondary)";
    return "var(--negative)";
};

export const FearGreedGauge = () => {
    const [index, setIndex] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetchFearGreedIndex().then((data) => {
            if (!cancelled) setIndex(data);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    if (!index) return null;

    const color = colorFor(index.value);
    const clamped = Math.min(100, Math.max(0, index.value));

    return (
        <div className="fng-gauge">
            <div className="fng-header">
                <span className="stat-label">Fear &amp; Greed</span>
                <span className="fng-value" style={{ color }}>
                    {index.value}
                </span>
            </div>
            <div className="fng-track">
                <div
                    className="fng-fill"
                    style={{ width: `${clamped}%`, background: color }}
                />
                <div className="fng-marker" style={{ left: `${clamped}%` }} />
            </div>
            {index.classification && (
                <p className="fng-label" style={{ color }}>
                    {index.classification}
                </p>
            )}
        </div>
    );
};