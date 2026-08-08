import { useEffect, useState } from "react";
import { fetchCoinSentiment } from "../api/marketSentiment";

const toneFromLabel = (label = "") => {
    const lower = label.toLowerCase();
    if (lower.includes("bull")) return "positive";
    if (lower.includes("bear")) return "negative";
    return "neutral";
};

export const SentimentBadge = ({ symbol }) => {
    const [sentiment, setSentiment] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setSentiment(null);

        fetchCoinSentiment(symbol).then((data) => {
            if (!cancelled) setSentiment(data);
        });

        return () => {
            cancelled = true;
        };
    }, [symbol]);

    if (!sentiment) return null;

    return (
        <span
            className={`sentiment-badge ${toneFromLabel(sentiment.label)}`}
            title={
                sentiment.confidence
                    ? `News sentiment · ${Math.round(sentiment.confidence * 100)}% confidence`
                    : "News sentiment"
            }
        >
            {sentiment.label} sentiment
        </span>
    );
};