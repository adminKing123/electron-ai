/**
 * Generic stat card for the analytics dashboard.
 *
 * Props:
 *   icon    – react-icons component to show beside the label
 *   label   – Short descriptive label
 *   value   – Primary value (string or number)
 *   sub     – Optional secondary line beneath the value
 *   accent  – When true, renders golden cost-style styling
 *   loading – Shows an animated skeleton instead of content
 */

const StatCardSkeleton = () => (
  <div className="animate-pulse flex flex-col gap-2">
    <div className="h-3 w-16 rounded-full bg-[#e8e8e8] dark:bg-[#2a2a2a]" />
    <div className="h-7 w-24 rounded-full bg-[#e8e8e8] dark:bg-[#2a2a2a]" />
    <div className="h-3 w-20 rounded-full bg-[#e8e8e8] dark:bg-[#2a2a2a]" />
  </div>
);

const StatCard = ({ icon: Icon, label, value, sub, accent = false, loading = false }) => {
  const containerClass = `flex flex-col gap-1.5 p-4 rounded-2xl border ${
    accent
      ? "border-[#daa500]/40 dark:border-[#daa500]/30 bg-[#fffbef] dark:bg-[#1e1a0e]"
      : "border-[#E1E1E1] dark:border-[#2F2F2F] bg-white dark:bg-[#141414]"
  }`;

  if (loading) {
    return (
      <div className={containerClass}>
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {Icon && (
        <div className="flex items-center gap-1.5 text-[#777] dark:text-[#888] text-xs font-medium">
          <Icon className="text-sm flex-shrink-0" />
          <span>{label}</span>
        </div>
      )}
      <p
        className={`text-2xl font-semibold tracking-tight ${
          accent ? "text-[#b8860b] dark:text-[#daa500]" : "text-black dark:text-white"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[11px] text-[#999] dark:text-[#666] leading-tight">{sub}</p>
      )}
    </div>
  );
};

export default StatCard;
