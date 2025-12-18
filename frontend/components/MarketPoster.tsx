'use client'

import React from 'react';

type Metric = {
  label: string;
  value: string;
  change: string;
  positive?: boolean;
};

type Props = {
  region: string;
  month: string;
  metrics: Metric[];
  benchmarkText: string[];
};

const styles: Record<string, React.CSSProperties> = {
  canvas: {
    width: "1080px",
    height: "1350px",
    position: "relative",
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#000",
    overflow: "hidden"
  },
  header: {
    background: "#000",
    color: "#fff",
    padding: "30px",
    textAlign: "center"
  },
  redLine: {
    width: "80px",
    height: "3px",
    background: "#dc2626",
    margin: "10px auto"
  },
  background: {
    position: "absolute",
    top: 120,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.6
  },
  card: {
    position: "absolute",
    top: 220,
    left: "50%",
    transform: "translateX(-50%)",
    width: "780px",
    background: "#fff",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
  },
  month: {
    fontSize: "18px",
    color: "#666",
    marginBottom: "10px"
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#000",
    marginBottom: "20px"
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
    marginTop: "30px"
  },
  metric: {
    padding: "20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "12px",
    textAlign: "center"
  },
  metricLabel: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "8px"
  },
  metricValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#000",
    marginBottom: "8px"
  },
  benchmark: {
    position: "absolute",
    bottom: 220,
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    padding: "30px",
    width: "100%"
  },
  footer: {
    position: "absolute",
    bottom: 0,
    background: "#fff",
    width: "100%",
    padding: "20px",
    textAlign: "center"
  }
};


export default function MarketPoster({
  region,
  month,
  metrics,
  benchmarkText
}: Props) {
  return (
    <div style={styles.canvas}>
      {/* Header */}
      <div style={styles.header}>
        <h1>{region}</h1>
        <div style={styles.redLine} />
        <h2>REAL ESTATE MARKET UPDATE</h2>
      </div>

      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
        style={styles.background}
      />

      {/* Main Card */}
      <div style={styles.card}>
        <p style={styles.month}>{month}</p>
        <h3 style={styles.title}>Market Report</h3>

        <div style={styles.metricsGrid}>
          {metrics.map((m) => (
            <div key={m.label} style={styles.metric}>
              <p style={styles.metricLabel}>{m.label}</p>
              <p style={styles.metricValue}>{m.value}</p>
              <p
                style={{
                  color: m.positive ? "#16a34a" : "#dc2626",
                  fontWeight: 600
                }}
              >
                {m.change}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark Narrative */}
      <div style={styles.benchmark}>
        {benchmarkText.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <h4>DUNCAN J. MOFFAT REAL ESTATE GROUP</h4>
        <p>Royal LePage Wolstencroft Realty</p>
      </div>
    </div>
  );
}
