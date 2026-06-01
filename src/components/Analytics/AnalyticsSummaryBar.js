import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LuCoins, LuMessageSquare, LuZap, LuArrowRight } from "react-icons/lu";
import { getUserAnalyticsAPI } from "../../apis/library/analyticsQueryFunctions";
import ROUTES from "../../router/routes";

/**
 * Compact horizontal analytics summary bar for the Library page.
 *
 * Shows total chats, token consumption, and estimated spend as minimal
 * pill chips, with a link through to the full analytics dashboard.
 * Designed to be lightweight — one Firestore read, no charts, ~40px tall.
 */
const AnalyticsSummaryBar = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getUserAnalyticsAPI()
      .then((result) => { if (!cancelled) setData(result); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const fmt = (n) => {
    if (!n) return "0";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-xs font-semibold text-[#555] dark:text-[#888] uppercase tracking-wide">
          Your Usage
        </span>

        {loading ? (
          // Skeleton pills
          <div className="flex gap-2">
            {[72, 96, 80].map((w, i) => (
              <span
                key={i}
                className="h-6 rounded-full bg-[#e8e8e8] dark:bg-[#2a2a2a] animate-pulse inline-block"
                style={{ width: w }}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <Pill icon={LuMessageSquare} label={`${data?.totalChats ?? 0} Chats`} />
            <Pill
              icon={LuZap}
              label={`${fmt(data?.totalTokens ?? 0)} Tokens`}
            />
            <Pill
              icon={LuCoins}
              label={`$${(data?.totalCostUsd ?? 0).toFixed(4)}`}
              accent
            />
          </div>
        )}
      </div>

      <Link
        to={ROUTES.ANALYTICS}
        className="flex items-center gap-1 text-xs font-medium text-[#555] dark:text-[#888]
          hover:text-black dark:hover:text-white transition-colors text-nowrap shrink-0"
      >
        Full Analytics
        <LuArrowRight className="text-sm" />
      </Link>
    </div>
  );
};

/**
 * Inline pill chip used inside AnalyticsSummaryBar.
 */
const Pill = ({ icon: Icon, label, accent = false }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
      accent
        ? "border-[#daa500]/40 bg-[#fffbef] dark:bg-[#1e1a0e] text-[#b8860b] dark:text-[#daa500]"
        : "border-[#E1E1E1] dark:border-[#2F2F2F] bg-[#f9f9f9] dark:bg-[#1a1a1a] text-[#444] dark:text-[#bbb]"
    }`}
  >
    <Icon className="flex-shrink-0" />
    {label}
  </span>
);

export default AnalyticsSummaryBar;
