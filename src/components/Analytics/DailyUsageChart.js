import "./chartSetup";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import useIsDark from "../../hooks/useIsDark";

/**
 * Line chart showing daily token usage, cost, or conversation count
 * over a date range.
 *
 * @param {{ daily: Array, metric: 'tokens'|'cost'|'chats' }} props
 *   daily  — Array of { date, label, tokens, cost, chats } from computeAnalytics()
 *   metric — Which value to plot on the Y axis
 */
const DailyUsageChart = ({ daily = [], metric = "tokens" }) => {
  const isDark = useIsDark();

  const gridColor = isDark ? "rgba(148,163,184,0.1)" : "rgba(0,0,0,0.05)";
  const tickColor = isDark ? "#94a3b8" : "#a8a4bd";
  const tooltipBg = isDark ? "#242a35" : "#ffffff";
  const tooltipBorder = isDark ? "#3b4250" : "#e5e2f0";
  const tooltipText = isDark ? "#e2e8f0" : "#2e2e2e";

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
        borderColor: isDark ? "#94a3b8" : "#8b5cf6",
        backgroundColor: isDark ? "rgba(148,163,184,0.12)" : "rgba(139,92,246,0.08)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: isDark ? "#94a3b8" : "#8b5cf6",
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
    <div className="relative w-full h-[240px]">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default DailyUsageChart;
