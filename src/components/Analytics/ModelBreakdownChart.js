import "./chartSetup";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { getModelMeta, getModelName } from "../../constants/modelMappings";
import useIsDark from "../../hooks/useIsDark";

/**
 * Horizontal bar chart showing per-model breakdown of tokens, cost, or chats.
 *
 * @param {{ byModel: Record<string, object>, metric: 'tokens'|'cost'|'chats' }} props
 *   byModel – Per-model stats map from computeAnalytics()
 *   metric  – Which value to plot
 */
const ModelBreakdownChart = ({ byModel = {}, metric = "tokens" }) => {
  const isDark = useIsDark();

  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tickColor = isDark ? "#635e7d" : "#a8a4bd";
  const tooltipBg = isDark ? "#161616" : "#ffffff";
  const tooltipBorder = isDark ? "#2e2e2e" : "#e5e2f0";
  const tooltipText = isDark ? "#e5e2f0" : "#2e2e2e";

  const getField = (stats) => {
    if (metric === "cost") return stats.costUsd ?? 0;
    if (metric === "chats") return stats.chats ?? 0;
    return stats.totalTokens ?? 0;
  };

  const sorted = useMemo(() => {
    return Object.keys(byModel).sort((a, b) => getField(byModel[b]) - getField(byModel[a]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byModel, metric]);

  const labels = sorted.map((id) => getModelName(id));
  const values = sorted.map((id) => getField(byModel[id]));
  const metas = sorted.map((id) => getModelMeta(id));

  const formatTooltip = (val) => {
    if (metric === "cost") return ` $${val.toFixed(6)}`;
    if (metric === "chats") return ` ${val} chats`;
    return ` ${val.toLocaleString()} tokens`;
  };

  const formatX = (val) => {
    if (metric === "cost") return `$${val.toFixed(4)}`;
    if (metric === "chats") return val;
    return val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val;
  };

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: metas.map((m) => m.color + "cc"), // 80 % opacity
        borderColor: metas.map((m) => m.color),
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barHeight = Math.max(120, sorted.length * 44);

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => formatTooltip(ctx.parsed.x),
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: gridColor, drawBorder: false },
        ticks: {
          color: tickColor,
          font: { size: 11 },
          callback: formatX,
        },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { color: tickColor, font: { size: 11 } },
        border: { display: false },
      },
    },
  };

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center h-[120px] rounded-xl border border-dashed border-ink-200 dark:border-ink-750 text-ink-500 dark:text-ink-550 text-[13px] text-center px-4">
        No model data yet — start a conversation to see usage.
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: barHeight }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ModelBreakdownChart;
