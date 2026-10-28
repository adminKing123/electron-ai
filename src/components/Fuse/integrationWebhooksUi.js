import React from "react";
import { HiOutlineExclamationTriangle, HiOutlineTrash } from "react-icons/hi2";
import { BasicLoader } from "../Loaders";

export const WebhooksPanelLoader = () => (
  <div className="flex items-center justify-center py-12">
    <BasicLoader />
  </div>
);

export const WebhooksPanelError = ({ onRetry }) => (
  <div className="py-10 text-center px-4">
    <HiOutlineExclamationTriangle className="w-5 h-5 text-red-400 mx-auto mb-2" />
    <p className="text-[13px] text-ink-600 dark:text-ink-450 mb-2">
      Couldn&apos;t load webhooks.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="text-[12px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
    >
      Try again
    </button>
  </div>
);

export const WebhooksPanelEmpty = ({ message, hint }) => (
  <div className="py-10 text-center px-4">
    <p className="text-[13px] font-medium text-ink-700 dark:text-ink-350">{message}</p>
    {hint ? (
      <p className="text-[12px] text-ink-500 dark:text-ink-550 mt-1.5 leading-relaxed">{hint}</p>
    ) : null}
  </div>
);

const StatusDot = ({ active, label }) => (
  <span
    className={[
      "inline-flex items-center gap-1 text-[11px] font-medium",
      active ? "text-emerald-600 dark:text-emerald-400" : "text-ink-450 dark:text-ink-550",
    ].join(" ")}
  >
    <span
      className={[
        "w-1.5 h-1.5 rounded-full",
        active ? "bg-emerald-500" : "bg-ink-350 dark:bg-ink-600",
      ].join(" ")}
    />
    {label}
  </span>
);

export const WebhookListRow = ({
  title,
  subtitle,
  active,
  activeLabel,
  fuseManaged,
  onRemove,
  removing,
}) => (
  <div className="flex items-start gap-2 py-2.5 border-b border-ink-100 dark:border-void-800 last:border-0">
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="text-[13px] font-medium text-ink-875 dark:text-ink-100 truncate max-w-full">
          {title}
        </span>
        {fuseManaged ? (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
            Fuse
          </span>
        ) : null}
        {activeLabel != null ? (
          <StatusDot active={active} label={activeLabel} />
        ) : null}
      </div>
      {subtitle ? (
        <p className="text-[11px] text-ink-500 dark:text-ink-550 mt-0.5 truncate" title={subtitle}>
          {subtitle}
        </p>
      ) : null}
    </div>
    <button
      type="button"
      title="Remove webhook"
      disabled={removing}
      onClick={onRemove}
      className="shrink-0 p-1.5 rounded-lg text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors"
    >
      {removing ? (
        <span className="block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <HiOutlineTrash className="w-4 h-4" />
      )}
    </button>
  </div>
);

export const WebhookList = ({ children, header }) => (
  <div>
    {header}
    <div className="max-h-[280px] overflow-y-auto -mx-1 px-1">{children}</div>
  </div>
);

/** GitHub repo lookup — minimal single row. */
export const GithubRepoLookup = ({ repoName, setRepoName, onSubmit, loading }) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }}
    className="mb-4"
  >
    <label className="block text-[12px] font-medium text-ink-600 dark:text-ink-450 mb-1.5">
      Repository
    </label>
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="owner/repo"
        value={repoName}
        onChange={(e) => setRepoName(e.target.value)}
        className="flex-1 min-w-0 bg-white dark:bg-void-850 border border-ink-200 dark:border-void-750
          text-[13px] px-3 py-2 rounded-lg text-ink-875 dark:text-ink-100
          placeholder:text-ink-400 focus:outline-none focus:border-brand-500 dark:focus:border-brand-400"
      />
      <button
        type="submit"
        disabled={!repoName.trim() || loading}
        className="px-4 py-2 rounded-lg text-[13px] font-medium shrink-0
          bg-brand-600 text-white dark:text-[var(--brand-on-solid)] hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600
          disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
      >
        Load
      </button>
    </div>
  </form>
);

export const WebhooksListHeader = ({ count, onRefresh }) => {
  if (!count) return null;
  return (
    <div className="flex items-center justify-between mb-2 pb-2 border-b border-ink-100 dark:border-void-800">
      <span className="text-[12px] text-ink-500 dark:text-ink-550">
        {count} {count === 1 ? "webhook" : "webhooks"}
      </span>
      {onRefresh ? (
        <button
          type="button"
          onClick={onRefresh}
          className="text-[12px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
        >
          Refresh
        </button>
      ) : null}
    </div>
  );
};
