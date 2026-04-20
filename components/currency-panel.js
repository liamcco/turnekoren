"use client";

import { useEffect, useState } from "react";

const sekFormatter = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 2,
});

const euroFormatter = new Intl.NumberFormat("fi-FI", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export function CurrencyPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRate() {
      try {
        const response = await fetch("/api/exchange", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load exchange rate.");
        }

        if (!cancelled) {
          setData(payload);
          setError("");
          setLoading(false);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load exchange rate.");
          setLoading(false);
        }
      }
    }

    loadRate();
    const intervalId = window.setInterval(loadRate, 1000 * 60 * 15);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return <section className="panel">Loading live exchange rate…</section>;
  }

  if (error) {
    return <section className="panel error-panel">{error}</section>;
  }

  const examples = [10, 25, 50, 100];

  return (
    <section className="stack-lg">
      <div className="hero-card">
        <span className="section-kicker">Live Rate</span>
        <h2>1 EUR = {sekFormatter.format(data.rate)}</h2>
        <p>{data.source} published this rate for {data.updatedAt}.</p>
      </div>

      <div className="split-grid">
        <div className="panel">
          <h3>EUR to SEK</h3>
          <div className="mini-list">
            {examples.map((amount) => (
              <div className="mini-list-row" key={amount}>
                <span>{euroFormatter.format(amount)}</span>
                <strong>{sekFormatter.format(amount * data.rate)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>SEK to EUR</h3>
          <div className="mini-list">
            {examples.map((amount) => (
              <div className="mini-list-row" key={`sek-${amount * 10}`}>
                <span>{sekFormatter.format(amount * 10)}</span>
                <strong>{euroFormatter.format((amount * 10) * data.inverse)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
