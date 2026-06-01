import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LuCoins, LuMessageSquare, LuZap, LuArrowRight } from "react-icons/lu";
import { getUserAnalyticsAPI } from "../../apis/library/analyticsQueryFunctions";
import ROUTES from "../../router/routes";

/**
 * Single stat column inside the usage card.
 * `accent` applies the golden colour used for cost figures.
 */
const StatItem = ({ icon: Icon, label, value, accent = false }) => (
  <div className="flex-1 flex flex-col gap-1.5 px-5 first:pl-0 last:pr-0">
    <div className="flex items-center gap-1.5">
      <Icon className="text-sm text-[#bbb] dark:text-[#555] flex-shrink-0" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#aaa] dark:text-[#555]">
        {label}
      </span>
    </div>
    <p
      className={`text-2xl font-semibold tracking-tight ${
        accent ? "text-[#b8860b] dark:text-[#daa500]" : "text-black dark:text-white"
      }`}
    >
      {value}
    </p>
  </div>
);

/** Skeleton placeholder for a single stat column while loading. */
const StatSkeleton = () => (
  <div className="flex-1 flex flex-col gap-2 px-5 first:pl-0 last:pr-0 animate-pulse">
    <div className="h-2.5 w-14 rounded-full bg-[#ebebeb] dark:bg-[#272727]" />
    <div className="h-7 w-20 rounded-full bg-[#ebebeb] dark:bg-[#272727]" />
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
      {/* Section label row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-[#aaa] dark:text-[#555] uppercase tracking-widest">
          Usage
        </p>
        <Link
          to={ROUTES.ANALYTICS}
          className="flex items-center gap-1 text-[11px] font-medium text-[#888] dark:text-[#666]
            hover:text-black dark:hover:text-white transition-colors"
        >
          View Analytics
          <LuArrowRight className="text-xs" />
        </Link>
      </div>

      {/* Stats card */}
      <div className="border border-[#E1E1E1] dark:border-[#2F2F2F] bg-white dark:bg-[#141414] rounded-2xl px-5 py-4">
        <div className="flex items-stretch divide-x divide-[#E1E1E1] dark:divide-[#2F2F2F]">
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
