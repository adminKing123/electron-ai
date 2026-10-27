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

const CONTAINER =
  "flex flex-col gap-3 p-4 md:p-5 rounded-2xl border border-ink-150 dark:border-ink-800 bg-white dark:bg-ink-850";

const StatCardSkeleton = () => (
  <div className="animate-pulse flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="h-3 w-20 rounded-full bg-ink-100 dark:bg-ink-800" />
      <div className="w-8 h-8 rounded-lg bg-ink-100 dark:bg-ink-800" />
    </div>
    <div className="h-[26px] w-24 rounded-lg bg-ink-100 dark:bg-ink-800" />
    <div className="h-3 w-28 rounded-full bg-ink-100 dark:bg-ink-800" />
  </div>
);

const StatCard = ({ icon: Icon, label, value, sub, accent = false, loading = false }) => {
  if (loading) {
    return (
      <div className={CONTAINER}>
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className={CONTAINER}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-ink-500 dark:text-ink-500 truncate">
          {label}
        </span>
        {Icon && (
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              accent
                ? "bg-amber-500/10 text-[#b8860b] dark:text-[#daa500]"
                : "bg-brand-500/10 text-brand-600 dark:text-brand-400"
            }`}
          >
            <Icon className="w-4 h-4" />
          </span>
        )}
      </div>
      <p
        className={`text-[24px] md:text-[26px] font-bold tracking-tight leading-none tabular-nums truncate ${
          accent ? "text-[#b8860b] dark:text-[#daa500]" : "text-ink-975 dark:text-white"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[12px] text-ink-450 dark:text-ink-550 leading-tight">{sub}</p>
      )}
    </div>
  );
};

export default StatCard;
