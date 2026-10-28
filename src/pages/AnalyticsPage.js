import { useState, useEffect, useMemo } from "react";
import { LuCoins, LuMessageSquare, LuZap, LuRefreshCw } from "react-icons/lu";
import { fetchUserUsageRaw, computeAnalytics } from "../apis/library/analyticsQueryFunctions";
import { getModelName } from "../constants/modelMappings";
import StatCard from "../components/Analytics/StatCard";
import DailyUsageChart from "../components/Analytics/DailyUsageChart";
import ModelBreakdownChart from "../components/Analytics/ModelBreakdownChart";
import TokenSplitChart from "../components/Analytics/TokenSplitChart";

/** Date-range filter options shown as pill buttons. */
const DATE_RANGES = [
  { label: "7 days",  value: 7  },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "All time", value: 0 },
];

/** Chart metric options shared between DailyUsageChart and ModelBreakdownChart. */
const METRICS = [
  { label: "Tokens", value: "tokens" },
  { label: "Cost",   value: "cost"   },
  { label: "Chats",  value: "chats"  },
];

/** Segmented-control track; children are SegmentButton items. */
const SegmentGroup = ({ children, className = "" }) => (
  <div
    className={`inline-flex items-center gap-0.5 p-0.5 rounded-xl
      bg-ink-100 dark:bg-void-875 border border-ink-150 dark:border-void-800 ${className}`}
  >
    {children}
  </div>
);

/**
 * Single option inside a SegmentGroup, used by filter rows and chart headers.
 */
const PillButton = ({ label, active, onClick, style, size = "md" }) => (
  <button
    onClick={onClick}
    style={style}
    className={`rounded-[10px] font-medium whitespace-nowrap transition-colors ${
      size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-[12px]"
    } ${
      active
        ? "bg-white dark:bg-void-725 text-ink-975 dark:text-white shadow-sm"
        : "text-ink-500 dark:text-ink-500 hover:text-ink-875 dark:hover:text-ink-150"
    }`}
  >
    {label}
  </button>
);

/**
 * Reusable section card wrapper used to group charts.
 */
const ChartCard = ({ title, subtitle, action, children, loading }) => (
  <div className="h-full flex flex-col border border-ink-150 dark:border-void-800 bg-white dark:bg-void-850 rounded-2xl">
    <div className="flex items-center justify-between gap-3 flex-wrap px-5 pt-4 pb-3.5 border-b border-ink-100 dark:border-void-800">
      <div className="min-w-0">
        <h2 className="text-[14px] font-semibold text-ink-975 dark:text-white tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[12px] text-ink-500 dark:text-ink-550 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
    <div className="flex-1 p-5">
      {loading ? (
        <div className="h-[220px] rounded-xl bg-ink-50 dark:bg-void-825 animate-pulse" />
      ) : (
        children
      )}
    </div>
  </div>
);

/**
 * Full analytics dashboard page.
 *
 * Fetches raw Firestore chat data once on mount, then recomputes all
 * aggregations in-memory on every filter change (no additional reads).
 */
const AnalyticsPage = () => {
  const [rawUsage, setRawUsage]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [days, setDays]                 = useState(30);
  const [selectedModel, setSelectedModel] = useState(null);
  const [metric, setMetric]             = useState("tokens");

  /** Fetch all chat-level usage docs from the user's personal usage collection. */
  const load = () => {
    setLoading(true);
    setError(null);
    fetchUserUsageRaw()
      .then(setRawUsage)
      .catch(() => setError("Could not load analytics. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchUserUsageRaw()
      .then((data) => { if (!cancelled) setRawUsage(data); })
      .catch(() => { if (!cancelled) setError("Could not load analytics. Please try again."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /** Re-compute analytics whenever the raw data or any filter changes (no extra reads). */
  const analytics = useMemo(
    () => computeAnalytics(rawUsage, { days, model: selectedModel }),
    [rawUsage, days, selectedModel]
  );

  /** Unique Comet model IDs used across all chats (union of every chat's byModel keys). */
  const usedModels = useMemo(() => {
    const ids = new Set();
    rawUsage.forEach((chat) => Object.keys(chat.byModel ?? {}).forEach((id) => ids.add(id)));
    return Array.from(ids);
  }, [rawUsage]);

  const fmt = (n) => {
    if (!n) return "0";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  /** Metric toggle row shared by chart panels. */
  const MetricToggle = () => (
    <SegmentGroup>
      {METRICS.map((m) => (
        <PillButton
          key={m.value}
          size="sm"
          label={m.label}
          active={metric === m.value}
          onClick={() => setMetric(m.value)}
        />
      ))}
    </SegmentGroup>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1080px] px-5 md:px-8 mx-auto pb-16">

        {/* -- Page header -- */}
        <div className="pt-8 md:pt-10 pb-8 mb-6 border-b border-ink-100 dark:border-void-800 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[26px] md:text-[30px] font-bold tracking-tight text-ink-975 dark:text-white">
              Analytics
            </h1>
            <p className="text-[14px] text-ink-500 dark:text-ink-500 mt-1">
              Your personal API usage overview
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 h-9 px-3.5 rounded-xl text-[13px] font-medium
              border border-ink-150 dark:border-void-800
              bg-white dark:bg-void-850 text-ink-750 dark:text-ink-200
              hover:bg-ink-50 dark:hover:bg-void-825
              transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LuRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px]
            border border-red-200 dark:border-red-900/60
            bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* -- Filter bar -- */}
        <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
          {/* Date range */}
          <SegmentGroup className="flex-wrap">
            {DATE_RANGES.map((r) => (
              <PillButton
                key={r.value}
                label={r.label}
                active={days === r.value}
                onClick={() => setDays(r.value)}
              />
            ))}
          </SegmentGroup>

          {/* Model filter dropdown — only shown when at least one model has been used */}
          {usedModels.length > 0 && (
            <label className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-ink-500 dark:text-ink-500">Model</span>
              <select
                value={selectedModel ?? ""}
                onChange={(e) => setSelectedModel(e.target.value || null)}
                className="h-9 text-[13px] font-medium rounded-xl border border-ink-150 dark:border-void-800
                  bg-white dark:bg-void-850 text-ink-875 dark:text-ink-150
                  pl-3.5 pr-9 min-w-[160px] appearance-none cursor-pointer
                  hover:border-ink-200 dark:hover:border-void-750
                  focus:outline-none focus:border-brand-300 dark:focus:border-brand-500/50
                  focus:ring-4 focus:ring-brand-500/10
                  transition-colors"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238681a0' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                }}
              >
                <option value="">All models</option>
                {usedModels.map((m) => (
                  <option key={m} value={m}>{getModelName(m)}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {/* -- Summary stat cards -- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={LuMessageSquare}
            label="Chats"
            value={analytics?.totalChats ?? 0}
            sub="Total conversations"
            loading={loading}
          />
          <StatCard
            icon={LuZap}
            label="Input Tokens"
            value={fmt(analytics?.inputTokens ?? 0)}
            sub="Prompt tokens sent"
            loading={loading}
          />
          <StatCard
            icon={LuZap}
            label="Output Tokens"
            value={fmt(analytics?.outputTokens ?? 0)}
            sub="Tokens generated"
            loading={loading}
          />
          <StatCard
            icon={LuCoins}
            label="Total Spend"
            value={`$${(analytics?.totalCostUsd ?? 0).toFixed(4)}`}
            sub="Estimated API cost (USD)"
            accent
            loading={loading}
          />
        </div>

        {/* -- Daily usage + token split -- */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <ChartCard
              title="Daily usage"
              subtitle="Activity over the selected period"
              action={<MetricToggle />}
              loading={loading}
            >
              <DailyUsageChart daily={analytics?.daily ?? []} metric={metric} />
            </ChartCard>
          </div>

          <div className="lg:col-span-2">
            <ChartCard title="Token split" subtitle="Input vs. output tokens" loading={loading}>
              <TokenSplitChart
                inputTokens={analytics?.inputTokens ?? 0}
                outputTokens={analytics?.outputTokens ?? 0}
              />
            </ChartCard>
          </div>
        </div>

        {/* -- Model breakdown -- */}
        <div className="mt-4">
          <ChartCard
            title="Usage by model"
            subtitle="Compare consumption across models"
            action={<MetricToggle />}
            loading={loading}
          >
            <ModelBreakdownChart byModel={analytics?.byModel ?? {}} metric={metric} />
          </ChartCard>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
