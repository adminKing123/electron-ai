import { useState, useEffect, useMemo } from "react";
import { LuCoins, LuMessageSquare, LuZap, LuRefreshCw } from "react-icons/lu";
import { fetchUserUsageRaw, computeAnalytics } from "../apis/library/analyticsQueryFunctions";
import { MODEL_META, getModelName } from "../constants/modelMappings";
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

/**
 * Pill-style toggle button used inside filter rows and chart headers.
 */
const PillButton = ({ label, active, onClick, style }) => (
  <button
    onClick={onClick}
    style={style}
    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
      active
        ? "bg-black dark:bg-white text-white dark:text-black"
        : "border border-[#E1E1E1] dark:border-[#2F2F2F] text-[#555] dark:text-[#888] hover:bg-[#f4f4f4] dark:hover:bg-[#2a2a2a]"
    }`}
  >
    {label}
  </button>
);

/**
 * Reusable section card wrapper used to group charts.
 */
const ChartCard = ({ title, action, children, loading }) => (
  <div className="border border-[#E1E1E1] dark:border-[#2F2F2F] bg-white dark:bg-[#141414] rounded-2xl p-4">
    <div className="flex items-center justify-between mb-4">
      <p className="text-xs font-semibold text-[#555] dark:text-[#888] uppercase tracking-wide">
        {title}
      </p>
      {action}
    </div>
    {loading ? (
      <div className="h-[200px] rounded-xl bg-[#f4f4f4] dark:bg-[#1a1a1a] animate-pulse" />
    ) : (
      children
    )}
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

  /** Unique AURA model IDs the user has actually used (derived from raw docs). */
  const usedModels = useMemo(
    () => Array.from(new Set(rawUsage.map((c) => c.model).filter(Boolean))),
    [rawUsage]
  );

  const fmt = (n) => {
    if (!n) return "0";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  /** Metric toggle row shared by chart panels. */
  const MetricToggle = () => (
    <div className="flex items-center gap-0.5">
      {METRICS.map((m) => (
        <button
          key={m.value}
          onClick={() => setMetric(m.value)}
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
            metric === m.value
              ? "bg-black dark:bg-white text-white dark:text-black"
              : "text-[#888] dark:text-[#666] hover:text-[#555] dark:hover:text-[#999]"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[892px] px-5 mx-auto pb-10">

        {/* ── Page header ── */}
        <div className="mt-6 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-2xl text-black dark:text-white font-semibold">Analytics</h3>
            <p className="text-xs text-[#888] dark:text-[#666] mt-0.5">
              Your personal API usage overview
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-[#555] dark:text-[#888]
              hover:text-black dark:hover:text-white transition-colors disabled:opacity-40 mt-1"
          >
            <LuRefreshCw className={`text-sm ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        )}

        {/* ── Filter bar ── */}
        <div className="mt-5 flex items-center gap-4 flex-wrap">
          {/* Date range */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {DATE_RANGES.map((r) => (
              <PillButton
                key={r.value}
                label={r.label}
                active={days === r.value}
                onClick={() => setDays(r.value)}
              />
            ))}
          </div>

          {/* Model filter — only shown when the user has used multiple models */}
          {usedModels.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#aaa] dark:text-[#666]">Model:</span>
              <PillButton
                label="All"
                active={selectedModel === null}
                onClick={() => setSelectedModel(null)}
              />
              {usedModels.map((m) => {
                const meta = MODEL_META[m];
                const isActive = selectedModel === m;
                return (
                  <PillButton
                    key={m}
                    label={getModelName(m)}
                    active={isActive}
                    onClick={() => setSelectedModel(isActive ? null : m)}
                    style={
                      isActive && meta
                        ? { borderColor: meta.color, backgroundColor: meta.colorAlpha, color: meta.color, border: "1px solid" }
                        : {}
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ── Summary stat cards ── */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
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

        {/* ── Daily usage + token split ── */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="sm:col-span-3">
            <ChartCard
              title="Daily Usage"
              action={<MetricToggle />}
              loading={loading}
            >
              <DailyUsageChart daily={analytics?.daily ?? []} metric={metric} />
            </ChartCard>
          </div>

          <div className="sm:col-span-2">
            <ChartCard title="Token Split" loading={loading}>
              <TokenSplitChart
                inputTokens={analytics?.inputTokens ?? 0}
                outputTokens={analytics?.outputTokens ?? 0}
              />
            </ChartCard>
          </div>
        </div>

        {/* ── Model breakdown ── */}
        <div className="mt-3">
          <ChartCard
            title="Usage by Model"
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
