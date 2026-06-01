import "./chartSetup";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import useIsDark from "../../hooks/useIsDark";

/**
 * Line chart showing daily token usage, cost, or conversation count
 * over a date range.
 *
 * @param {{ daily: Array, metric: 'tokens'|'cost'|'chats' }} props
 *   daily  – Array of { date, label, tokens, cost, chats } from computeAnalytics()
 *   metric – Which value to plot on the Y axis
 */
const DailyUsageChart = ({ daily = [], metric = "tokens" }) => {
  const isDark = useIsDark();

  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tickColor = isDark ? "#666" : "#aaa";
  const tooltipBg = isDark ? "#1e1e1e" : "#ffffff";
  const tooltipBorder = isDark ? "#333" : "#e5e5e5";
  const tooltipText = isDark ? "#e0e0e0" : "#333";

  const labels = daily.map((d) => d.label);
  const values = useMemo(() => {
    return daily.map((d) => {
      if (metric === "cost") return d.cost;
      if (metric === "chats") return d.chats;
      return d.tokens;
    });
  }, [daily, metric]);

  const formatY = (val) => {
    if (metric === "cost") return `$${val.toFixed(4)}`;
    if (metric === "chats") return val;
    return val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val;
  };

  const formatTooltip = (val) => {
    if (metric === "cost") return ` $${val.toFixed(6)}`;
    if (metric === "chats") return ` ${val} chats`;
    return ` ${val.toLocaleString()} tokens`;
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: metric === "cost" ? "Cost (USD)" : metric === "chats" ? "Chats" : "Tokens",
        data: values,
        borderColor: "#6366f1",
        backgroundColor: isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)",
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: "#6366f1",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
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
          label: (ctx) => formatTooltip(ctx.parsed.y),
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor, drawBorder: false },
        ticks: {
          color: tickColor,
          font: { size: 11 },
          maxTicksLimit: 7,
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor, drawBorder: false },
        ticks: {
          color: tickColor,
          font: { size: 11 },
          callback: formatY,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="relative w-full h-[200px]">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default DailyUsageChart;
