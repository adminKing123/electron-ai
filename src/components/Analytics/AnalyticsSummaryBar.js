import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LuCoins, LuMessageSquare, LuZap, LuArrowRight } from "react-icons/lu";
import { getUserAnalyticsAPI } from "../../apis/library/analyticsQueryFunctions";
import ROUTES from "../../router/routes";
import SectionHeader from "../Common/SectionHeader";

/**
 * Single stat column inside the usage card.
 * `accent` applies the golden colour used for cost figures.
 */
const STAT_CARD =
  "flex flex-col gap-3 p-4 rounded-2xl border border-ink-150 dark:border-void-800 bg-white dark:bg-void-850";

const StatItem = ({ icon: Icon, label, value, accent = false }) => (
  <div className={STAT_CARD}>
    <div className="flex items-center justify-between">
      <span className="text-[12px] font-medium text-ink-500 dark:text-ink-500">
        {label}
      </span>
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          accent
            ? "bg-amber-500/10 text-[#b8860b] dark:bg-void-775 dark:text-ink-100"
            : "bg-brand-500/10 text-brand-600 dark:text-brand-400"
        }`}
      >
        <Icon className="w-4 h-4" />
      </span>
    </div>
    <p
      className={`text-[26px] font-bold tracking-tight leading-none tabular-nums ${
        accent ? "text-[#b8860b] dark:text-ink-100" : "text-ink-975 dark:text-white"
      }`}
    >
      {value}
    </p>
  </div>
);

/** Skeleton placeholder for a single stat card while loading. */
const StatSkeleton = () => (
  <div className={`${STAT_CARD} animate-pulse`}>
    <div className="flex items-center justify-between">
      <div className="h-3 w-16 rounded-full bg-ink-100 dark:bg-void-800" />
      <div className="w-8 h-8 rounded-lg bg-ink-100 dark:bg-void-800" />
    </div>
    <div className="h-[26px] w-24 rounded-lg bg-ink-100 dark:bg-void-800" />
  </div>
);

/**
 * Usage summary card for the Library page.
 *
 * Shows total chats, token consumption, and estimated spend in a clean
 * bordered card. Links through to the full analytics dashboard.
 * One Firestore read on mount — no charts.
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
    <>
      <SectionHeader
        title="Usage"
        description="Your activity across all chats"
        action={
          <Link
            to={ROUTES.ANALYTICS}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium
              text-brand-600 dark:text-brand-400
              hover:bg-brand-500/10 dark:hover:bg-brand-400/10 transition-colors flex-shrink-0"
          >
            View analytics
            <LuArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {/* Stat cards */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatItem
                icon={LuMessageSquare}
                label="Chats"
                value={data?.totalChats ?? 0}
              />
              <StatItem
                icon={LuZap}
                label="Tokens"
                value={fmt(data?.totalTokens ?? 0)}
              />
              <StatItem
                icon={LuCoins}
                label="Total Spend"
                value={`$${(data?.totalCostUsd ?? 0).toFixed(4)}`}
                accent
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AnalyticsSummaryBar;
