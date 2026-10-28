import "./chartSetup";
import { Doughnut } from "react-chartjs-2";
import useIsDark from "../../hooks/useIsDark";

/**
 * Doughnut chart visualising the input-vs-output token split for a period.
 *
 * @param {{ inputTokens: number, outputTokens: number }} props
 */
const TokenSplitChart = ({ inputTokens = 0, outputTokens = 0 }) => {
  const isDark = useIsDark();

  const tooltipBg = isDark ? "#242a35" : "#ffffff";
  const tooltipBorder = isDark ? "#3b4250" : "#e5e2f0";
  const tooltipText = isDark ? "#e2e8f0" : "#2e2e2e";
  const legendColor = isDark ? "#94a3b8" : "#635e7d";

  const total = inputTokens + outputTokens;

  const fmt = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  const chartData = {
    labels: ["Input", "Output"],
    datasets: [
      {
        // If there's no data yet, render a muted placeholder slice.
        data: total > 0 ? [inputTokens, outputTokens] : [1, 0],
        backgroundColor: total > 0
          ? isDark
            ? ["rgba(148,163,184,0.65)", "rgba(16,185,129,0.75)"]
            : ["rgba(139,92,246,0.75)", "rgba(16,185,129,0.75)"]
          : [isDark ? "#2c323e" : "#ebe9f4", "transparent"],
        borderColor: total > 0
          ? isDark
            ? ["#94a3b8", "#10b981"]
            : ["#8b5cf6", "#10b981"]
          : ["transparent", "transparent"],
        borderWidth: total > 0 ? 1.5 : 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: legendColor,
          font: { size: 11 },
          boxWidth: 10,
          boxHeight: 10,
          padding: 14,
          usePointStyle: true,
          pointStyle: "circle",
          // Hide labels when there is no data
          filter: () => total > 0,
        },
      },
      tooltip: {
        enabled: total > 0,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => {
            const pct = ((ctx.parsed / total) * 100).toFixed(1);
            return ` ${fmt(ctx.parsed)} tokens (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="relative w-full h-[240px]">
      <Doughnut data={chartData} options={options} />

      {/* Centre label */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ paddingBottom: 40 }} // offset for legend row
      >
        {total > 0 ? (
          <>
            <p className="text-[11px] text-ink-400 dark:text-ink-600 leading-none">Total</p>
            <p className="text-[18px] font-bold tracking-tight text-ink-975 dark:text-white mt-1 tabular-nums">
              {fmt(total)}
            </p>
          </>
        ) : (
          <p className="text-[11px] text-ink-400 dark:text-ink-550">No data</p>
        )}
      </div>
    </div>
  );
};

export default TokenSplitChart;
