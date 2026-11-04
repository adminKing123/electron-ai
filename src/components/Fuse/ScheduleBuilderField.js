import React, { useCallback, useMemo } from "react";
import { CronMultiSelectList, CronMultiSelectPanel } from "./CronMultiSelectList";
import { MONTH_LABELS, DOW_LABELS, defaultCustomSchedule } from "./scheduleCronUtils";
import {
  buildYearOptions,
  defaultScheduleExpireParts,
  isScheduleExpiresEnabled,
} from "./scheduleExpiresUtils";

const SELECT_INLINE =
  "inline-flex items-center rounded-md px-1.5 py-0.5 mx-0.5 " +
  "text-[13px] font-medium text-brand-600 dark:text-brand-400 " +
  "bg-brand-50 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-800/50 " +
  "focus:outline-none focus:ring-1 focus:ring-brand-500/40 cursor-pointer appearance-none pr-6 relative";

const INTERVAL_OPTIONS = [
  { label: "1 minute", value: "1" },
  { label: "5 minutes", value: "5" },
  { label: "10 minutes", value: "10" },
  { label: "15 minutes", value: "15" },
  { label: "30 minutes", value: "30" },
  { label: "60 minutes", value: "60" },
];

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

function InlineSelect({ value, onChange, options, ariaLabel }) {
  return (
    <span className="relative inline-block align-middle">
      <select
        aria-label={ariaLabel}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className={SELECT_INLINE}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-brand-500"
      >
        ▾
      </span>
    </span>
  );
}

function RadioRow({ selected, onSelect, children }) {
  return (
    <label
      className="flex items-start gap-3 py-2.5 cursor-pointer group"
      onClick={onSelect}
    >
      <span
        className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
          selected
            ? "border-brand-500 bg-brand-500"
            : "border-ink-300 dark:border-void-700 group-hover:border-ink-400"
        }`}
      >
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
      <span className="text-[13px] leading-relaxed text-ink-800 dark:text-ink-200 flex-1 min-w-0">
        {children}
      </span>
    </label>
  );
}

/**
 * @param {{ values: object, onValuesChange: (patch: object) => void }} props
 */
const ScheduleBuilderField = ({ values, onValuesChange }) => {
  const mode = (values.schedule_mode || "interval").toLowerCase();
  const custom = useMemo(() => {
    const c = values.custom;
    if (c && typeof c === "object") return { ...defaultCustomSchedule(), ...c };
    return defaultCustomSchedule();
  }, [values.custom]);

  const apply = useCallback(
    (patch) => {
      onValuesChange({ ...values, ...patch });
    },
    [values, onValuesChange],
  );

  const setMode = (nextMode) => {
    apply({ schedule_mode: nextMode });
  };

  const hourOpts = hours.map((h) => ({ label: String(h), value: String(h) }));
  const minuteOpts = minutes.map((m) => ({
    label: String(m).padStart(2, "0"),
    value: String(m),
  }));
  const domOpts = daysOfMonth.map((d) => ({ label: `${d}.`, value: String(d) }));
  const monthOpts = months.map((m) => ({
    label: MONTH_LABELS[m - 1],
    value: String(m),
  }));

  const updateCustom = (partial) => {
    apply({ custom: { ...custom, ...partial } });
  };

  const domListOpts = daysOfMonth.map((d) => ({ label: String(d), value: d }));
  const dowListOpts = DOW_LABELS.map((label, idx) => ({ label, value: idx }));
  const monthListOpts = months.map((m) => ({ label: MONTH_LABELS[m - 1], value: m }));
  const hourListOpts = hours.map((h) => ({ label: String(h), value: h }));
  const minuteListOpts = minutes.map((m) => ({
    label: String(m).padStart(2, "0"),
    value: m,
  }));

  const yearOpts = useMemo(() => buildYearOptions(15), []);
  const expiresOn = isScheduleExpiresEnabled(values);
  const tzLabel = values.timezone || "UTC";

  const setExpiresEnabled = (on) => {
    if (on) {
      apply({
        schedule_expires_enabled: true,
        ...defaultScheduleExpireParts(),
      });
    } else {
      apply({ schedule_expires_enabled: false });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[12px] font-semibold text-ink-750 dark:text-ink-300 mb-1">
          When to run
        </p>
        <p className="text-[11px] text-ink-500 dark:text-ink-550 mb-2 leading-relaxed">
          Pick how often this workflow should start. Times use the time zone below.
        </p>
        <div
          className="flex flex-col divide-y divide-ink-100 dark:divide-void-850 rounded-xl
            border border-ink-100 dark:border-void-850 px-3 bg-white/50 dark:bg-void-875/20"
        >
          <RadioRow selected={mode === "interval"} onSelect={() => setMode("interval")}>
            Every{" "}
            <InlineSelect
              ariaLabel="Interval minutes"
              value={values.interval_minutes ?? "15"}
              onChange={(v) => apply({ interval_minutes: v })}
              options={INTERVAL_OPTIONS}
            />
          </RadioRow>

          <RadioRow selected={mode === "daily"} onSelect={() => setMode("daily")}>
            Every day at{" "}
            <InlineSelect
              ariaLabel="Hour"
              value={values.hour ?? "0"}
              onChange={(v) => apply({ hour: v })}
              options={hourOpts}
            />{" "}
            :{" "}
            <InlineSelect
              ariaLabel="Minute"
              value={values.minute ?? "0"}
              onChange={(v) => apply({ minute: v })}
              options={minuteOpts}
            />
          </RadioRow>

          <RadioRow selected={mode === "monthly"} onSelect={() => setMode("monthly")}>
            Every{" "}
            <InlineSelect
              ariaLabel="Day of month"
              value={values.day_of_month ?? "1"}
              onChange={(v) => apply({ day_of_month: v })}
              options={domOpts}
            />{" "}
            of the month at{" "}
            <InlineSelect
              ariaLabel="Hour"
              value={values.hour ?? "0"}
              onChange={(v) => apply({ hour: v })}
              options={hourOpts}
            />{" "}
            :{" "}
            <InlineSelect
              ariaLabel="Minute"
              value={values.minute ?? "0"}
              onChange={(v) => apply({ minute: v })}
              options={minuteOpts}
            />
          </RadioRow>

          <RadioRow selected={mode === "yearly"} onSelect={() => setMode("yearly")}>
            Every year on{" "}
            <InlineSelect
              ariaLabel="Day"
              value={values.day_of_month ?? "1"}
              onChange={(v) => apply({ day_of_month: v })}
              options={domOpts}
            />{" "}
            <InlineSelect
              ariaLabel="Month"
              value={values.month ?? "1"}
              onChange={(v) => apply({ month: v })}
              options={monthOpts}
            />{" "}
            at{" "}
            <InlineSelect
              ariaLabel="Hour"
              value={values.hour ?? "0"}
              onChange={(v) => apply({ hour: v })}
              options={hourOpts}
            />{" "}
            :{" "}
            <InlineSelect
              ariaLabel="Minute"
              value={values.minute ?? "0"}
              onChange={(v) => apply({ minute: v })}
              options={minuteOpts}
            />
          </RadioRow>

          <RadioRow selected={mode === "custom"} onSelect={() => setMode("custom")}>
            Custom schedule
          </RadioRow>
        </div>
      </div>

      {mode === "custom" && (
        <div className="flex flex-col gap-3">
          <CronMultiSelectPanel
            title="Date fields"
            hint="Leave empty for any (*). Ctrl+click or long-press to select multiple."
            onClearAny={() =>
              updateCustom({
                days_of_month: [],
                days_of_week: [],
                months: [],
              })
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CronMultiSelectList
                label="Days of month"
                options={domListOpts}
                value={custom.days_of_month}
                onChange={(v) => updateCustom({ days_of_month: v })}
              />
              <CronMultiSelectList
                label="Days of week"
                options={dowListOpts}
                value={custom.days_of_week}
                onChange={(v) => updateCustom({ days_of_week: v })}
              />
              <CronMultiSelectList
                label="Months"
                options={monthListOpts}
                value={custom.months}
                onChange={(v) => updateCustom({ months: v })}
              />
            </div>
          </CronMultiSelectPanel>

          <CronMultiSelectPanel
            title="Time of day"
            hint="Which hours and minutes to run within the date fields above."
            onClearAny={() => updateCustom({ hours: [], minutes: [] })}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CronMultiSelectList
                label="Hours"
                options={hourListOpts}
                value={custom.hours}
                onChange={(v) => updateCustom({ hours: v })}
                size={12}
              />
              <CronMultiSelectList
                label="Minutes"
                options={minuteListOpts}
                value={custom.minutes}
                onChange={(v) => updateCustom({ minutes: v })}
                size={12}
              />
            </div>
          </CronMultiSelectPanel>

          <p className="text-[11px] text-ink-500 dark:text-ink-550 leading-relaxed">
            Hold <kbd className="px-1 rounded bg-ink-100 dark:bg-void-800 text-[10px]">Ctrl</kbd>{" "}
            (Windows) or{" "}
            <kbd className="px-1 rounded bg-ink-100 dark:bg-void-800 text-[10px]">⌘</kbd> (Mac) while
            clicking to select multiple rows. Nothing selected ={" "}
            <code className="text-[10px]">*</code> in the crontab.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-ink-200 dark:border-void-775 bg-white dark:bg-void-875/30 p-3">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={expiresOn}
            onChange={(e) => setExpiresEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500/40"
          />
          <span className="text-[13px] font-medium text-ink-800 dark:text-ink-200">
            Schedule expires
          </span>
        </label>

        {expiresOn ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13px] text-ink-700 dark:text-ink-300">
            <span className="text-ink-500">on</span>
            <InlineSelect
              ariaLabel="Expiry day"
              value={values.schedule_expires_day ?? "1"}
              onChange={(v) => apply({ schedule_expires_day: v })}
              options={domOpts}
            />
            <InlineSelect
              ariaLabel="Expiry month"
              value={values.schedule_expires_month ?? "1"}
              onChange={(v) => apply({ schedule_expires_month: v })}
              options={monthOpts}
            />
            <InlineSelect
              ariaLabel="Expiry year"
              value={values.schedule_expires_year ?? String(new Date().getFullYear() + 1)}
              onChange={(v) => apply({ schedule_expires_year: v })}
              options={yearOpts}
            />
            <span className="text-ink-500">at</span>
            <InlineSelect
              ariaLabel="Expiry hour"
              value={values.schedule_expires_hour ?? "0"}
              onChange={(v) => apply({ schedule_expires_hour: v })}
              options={hourOpts}
            />
            <span>:</span>
            <InlineSelect
              ariaLabel="Expiry minute"
              value={values.schedule_expires_minute ?? "0"}
              onChange={(v) => apply({ schedule_expires_minute: v })}
              options={minuteOpts}
            />
            <span className="w-full text-[11px] text-ink-500 dark:text-ink-550 mt-1">
              In time zone <strong className="font-semibold">{tzLabel}</strong>. After this moment,
              cron-job.org stops firing (workflow stays active in Fuse until you turn it off).
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-ink-500 dark:text-ink-550 mt-2">
            Off — the schedule runs until you deactivate the workflow.
          </p>
        )}
      </div>
    </div>
  );
};

export default ScheduleBuilderField;
