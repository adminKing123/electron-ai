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

  const tooltipBg = isDark ? "#1e1e1e" : "#ffffff";
  const tooltipBorder = isDark ? "#333" : "#e5e5e5";
  const tooltipText = isDark ? "#e0e0e0" : "#333";
  const legendColor = isDark ? "#888" : "#666";

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
          ? ["rgba(99,102,241,0.75)", "rgba(16,185,129,0.75)"]
          : [isDark ? "#2a2a2a" : "#e8e8e8", "transparent"],
        borderColor: total > 0 ? ["#6366f1", "#10b981"] : ["transparent", "transparent"],
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
    <div className="relative w-full h-[200px]">
      <Doughnut data={chartData} options={options} />

      {/* Centre label */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ paddingBottom: 40 }} // offset for legend row
      >
        {total > 0 ? (
          <>
            <p className="text-[10px] text-[#aaa] dark:text-[#666] leading-none">Total</p>
            <p className="text-sm font-semibold text-black dark:text-white mt-0.5">
              {fmt(total)}
            </p>
          </>
        ) : (
          <p className="text-[11px] text-[#ccc] dark:text-[#555]">No data</p>
        )}
      </div>
    </div>
  );
};

export default TokenSplitChart;
