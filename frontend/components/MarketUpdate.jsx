import React from 'react';
import './MarketUpdate.css'; // Assuming you save the CSS below in this file

// SVG Icons (Inline for portability)
const HouseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-5 8 5v14"/><path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v11H9z"/></svg>
);
const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
);
const SignIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M12 4v16"/><path d="M4 10h4"/><path d="M16 10h4"/><path d="M4 14h4"/><path d="M16 14h4"/></svg>
);
const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
);

const MarketUpdate = ({ 
  locationTitle,
  reportDate,
  mainStats,
  agentWebsite,
  agentGroup,
  benchmarkStats
}) => {
  const statsToDisplay = mainStats || [];

  const benchmarkStatsDisplay = benchmarkStats || [];

  // Helper to determine color class
  const getChangeClass = (val) => val >= 0 ? 'text-green' : 'text-red';

  return (
    <div className="infographic-container">
      {/* HEADER */}
      <header className="main-header">
        <h1>{locationTitle}</h1>
        <div className="red-underline"></div>
        <h2>REAL ESTATE MARKET UPDATE</h2>
      </header>

      {/* HERO SECTION */}
      <div className="hero-section">
        <div className="hero-bg-image">
           {/* Replace with actual image URL */}
           <img 
             src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
             alt="Interior" 
             crossOrigin="anonymous"
           />
        </div>

        {/* FLOATING CARD */}
        <div className="stats-card">
            <div className="card-branding">
                <img 
                  src="/logo.png" 
                  alt="Realty Genie" 
                  className="brand-logo"
                  crossOrigin="anonymous"
                />
                <div className="brand-sub">AI-Powered Market Intelligence</div>
            </div>

            <h3 className="report-title">
                <span className="date">{reportDate}</span>
                <br />
                Market Report
            </h3>

            <table className="stats-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Current</th>
                        <th>Change</th>
                        <th>Prev Month</th>
                        <th>Prev Year</th>
                    </tr>
                </thead>
                <tbody>
                    {statsToDisplay.map((stat, index) => (
                        <tr key={index}>
                            <td className="metric-cell">
                                <div className="metric-name">{stat.label}</div>
                            </td>
                            <td className="current-cell">{stat.current}</td>
                            <td className="change-cell">
                                <span className={`pct-badge ${getChangeClass(stat.pctChange)}`}>
                                    {stat.pctChange > 0 ? '+' : ''}{stat.pctChange}%
                                </span>
                            </td>
                            <td className="prev-cell">{stat.prevMonth}</td>
                            <td className="prev-cell">{stat.prevYear}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="card-footer">
                ALL AREAS & PROPERTIES COMBINED
            </div>
            <div className="source-text">SOURCE: MLS® HOME PRICE INDEX MONTHLY STATISTICS PACKAGE</div>
        </div>
      </div>

      {/* DARK BENCHMARK SECTION */}
      <div className="benchmark-section">
        <h4>MLS® HPI Benchmark Price Activity</h4>
        <div className="benchmark-list">
            {benchmarkStatsDisplay.map((item, index) => (
                <div className="benchmark-item" key={index}>
                    <p>
                        <strong>{item.type}:</strong> At <span className="highlight-price">{item.price}</span>, the {item.desc}
                    </p>
                </div>
            ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="realty-genie-footer">
        <div className="footer-content">
            <div className="footer-brand">
                <h2>{agentGroup}</h2>
                <p className="footer-tagline">Empowering Real Estate Professionals with AI-Driven Insights</p>
            </div>
            <div className="footer-contact">
                <p>📧 info@realtygenie.co</p>
                <p>🌐 {agentWebsite}</p>
            </div>
            <div className="footer-disclaimer">
                <p>This report is auto-generated using AI analysis of official MLS® data. For realtor use only.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketUpdate;