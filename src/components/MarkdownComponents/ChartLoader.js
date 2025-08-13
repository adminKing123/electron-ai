const ChartLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <svg
        width="160"
        height="100"
        viewBox="0 0 160 100"
        fill="none"
        stroke="currentColor"
        className="text-primary dark:text-primary-400"
        style={{ strokeWidth: 2 }}
      >
        <line x1="10" y1="90" x2="150" y2="90" stroke="currentColor" />
        <line x1="10" y1="20" x2="10" y2="90" stroke="currentColor" />
        <path
          d="M10 90 L40 40 L80 60 L120 20 L150 50"
          stroke="currentColor"
          fill="none"
          style={{
            strokeDasharray: 300,
            strokeDashoffset: 300,
            animation: "drawLine 1.5s ease-in-out infinite",
          }}
        />
      </svg>

      <span className="text-gray-600 dark:text-gray-300 font-medium text-xs animate-pulse">
        Generating chart...
      </span>

      <style>{`
        @keyframes drawLine {
          0% { stroke-dashoffset: 300; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 300; }
        }
      `}</style>
    </div>
  );
};

export default ChartLoader;
