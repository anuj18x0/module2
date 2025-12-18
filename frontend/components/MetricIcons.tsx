// SVG Icons for City Comparison Metrics

export const ActiveListingsIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="8" width="36" height="32" rx="2" fill="#3B82F6" opacity="0.1"/>
    <path d="M12 14h24M12 20h24M12 26h24M12 32h16" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="36" cy="12" r="6" fill="#EF4444"/>
    <text x="36" y="15" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">NEW</text>
  </svg>
);

export const TotalSalesIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 38L18 28L26 32L40 18" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="18" cy="28" r="3" fill="#10B981"/>
    <circle cx="26" cy="32" r="3" fill="#10B981"/>
    <circle cx="40" cy="18" r="3" fill="#10B981"/>
    <path d="M34 18h6v6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BenchmarkPriceIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="16" width="28" height="24" rx="2" fill="#8B5CF6" opacity="0.1"/>
    <path d="M24 8L38 16V40H10V16L24 8Z" fill="#8B5CF6" opacity="0.2"/>
    <path d="M24 8L38 16M24 8L10 16M24 8V16" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="18" y="24" width="5" height="8" fill="#8B5CF6" opacity="0.3"/>
    <rect x="25" y="28" width="5" height="4" fill="#8B5CF6" opacity="0.3"/>
    <text x="24" y="38" fontSize="12" fill="#8B5CF6" textAnchor="middle" fontWeight="bold">$$$</text>
  </svg>
);

export const ChangeIcon = ({ isPositive }: { isPositive: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    {isPositive ? (
      <>
        <circle cx="16" cy="16" r="14" fill="#10B981" opacity="0.1"/>
        <path d="M16 10V22M16 10L12 14M16 10L20 14" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ) : (
      <>
        <circle cx="16" cy="16" r="14" fill="#EF4444" opacity="0.1"/>
        <path d="M16 22V10M16 22L12 18M16 22L20 18" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    )}
  </svg>
);

export const PropertyTypeIcon = ({ type }: { type: 'detached' | 'townhouse' | 'condo' }) => {
  if (type === 'detached') {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L34 16V34H6V16L20 6Z" fill="#3B82F6" opacity="0.1"/>
        <path d="M20 6L34 16M20 6L6 16M20 6V16" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="14" y="22" width="6" height="8" fill="#3B82F6" opacity="0.3"/>
        <rect x="22" y="18" width="4" height="4" fill="#3B82F6" opacity="0.3"/>
      </svg>
    );
  } else if (type === 'townhouse') {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="14" width="10" height="20" fill="#8B5CF6" opacity="0.1"/>
        <rect x="15" y="10" width="10" height="24" fill="#8B5CF6" opacity="0.1"/>
        <rect x="24" y="14" width="10" height="20" fill="#8B5CF6" opacity="0.1"/>
        <path d="M6 14L11 10L16 14M15 10L20 6L25 10M24 14L29 10L34 14" stroke="#8B5CF6" strokeWidth="1.5"/>
        <rect x="8" y="26" width="3" height="4" fill="#8B5CF6" opacity="0.3"/>
        <rect x="17" y="22" width="3" height="6" fill="#8B5CF6" opacity="0.3"/>
        <rect x="26" y="26" width="3" height="4" fill="#8B5CF6" opacity="0.3"/>
      </svg>
    );
  } else {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="6" width="24" height="28" rx="1" fill="#EC4899" opacity="0.1"/>
        <path d="M8 6h24v28H8V6z" stroke="#EC4899" strokeWidth="2"/>
        <line x1="8" y1="12" x2="32" y2="12" stroke="#EC4899" strokeWidth="1" opacity="0.3"/>
        <line x1="8" y1="18" x2="32" y2="18" stroke="#EC4899" strokeWidth="1" opacity="0.3"/>
        <line x1="8" y1="24" x2="32" y2="24" stroke="#EC4899" strokeWidth="1" opacity="0.3"/>
        <line x1="8" y1="30" x2="32" y2="30" stroke="#EC4899" strokeWidth="1" opacity="0.3"/>
        <rect x="12" y="8" width="3" height="3" fill="#EC4899" opacity="0.4"/>
        <rect x="18" y="8" width="3" height="3" fill="#EC4899" opacity="0.4"/>
        <rect x="25" y="8" width="3" height="3" fill="#EC4899" opacity="0.4"/>
      </svg>
    );
  }
};

export const ComparisonBadge = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="url(#gradient1)"/>
    <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="gradient1" x1="0" y1="0" x2="64" y2="64">
        <stop offset="0%" stopColor="#3B82F6"/>
        <stop offset="100%" stopColor="#8B5CF6"/>
      </linearGradient>
    </defs>
  </svg>
);
