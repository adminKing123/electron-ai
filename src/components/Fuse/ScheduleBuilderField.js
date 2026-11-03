import React, { useCallback, useEffect, useMemo } from "react";
import {
  MONTH_LABELS,
  DOW_LABELS,
  buildCronExpression,
  defaultCustomSchedule,
  schedulePatchWithCron,
} from "./scheduleCronUtils";

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

function toggleInList(list, value) {
  const v = Number(value);
  const set = new Set((list || []).map(Number));
  if (set.has(v)) set.delete(v);
  else set.add(v);
  return [...set].sort((a, b) => a - b);
}

function selectionSummary(selected, labels, emptyLabel = "Any") {
  if (!selected?.length) return emptyLabel;
  if (labels) {
    return selected.map((v) => labels[Number(v)] ?? labels[v] ?? v).join(", ");
  }
  return selected.join(", ");
}

function Chip({ active, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        `rounded-md border text-[11px] font-medium transition-colors ${className} ` +
        (active
          ? "bg-brand-500 border-brand-500 text-white shadow-sm"
          : "bg-white dark:bg-void-850 border-ink-200 dark:border-void-775 text-ink-700 dark:text-ink-300 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50/80 dark:hover:bg-brand-950/30")
      }
    >
      {children}
    </button>
  );
}

function CustomDimension({ title, description, onClear, children }) {
  return (
    <div className="rounded-xl border border-ink-100 dark:border-void-850 bg-white dark:bg-void-875/40 p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-ink-800 dark:text-ink-200">{title}</p>
          <p className="text-[11px] text-ink-500 dark:text-ink-550 mt-0.5 truncate" title={description}>
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
        >
          Any (*)
        </button>
      </div>
      {children}
    </div>
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
      const next = { ...values, ...patch };
      onValuesChange(schedulePatchWithCron(next));
    },
    [values, onValuesChange],
  );

  useEffect(() => {
    if (!values.cron_expression) {
      onValuesChange(schedulePatchWithCron(values));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMode = (nextMode) => {
    apply({ schedule_mode: nextMode });
  };

  const cronDisplay = values.cron_expression || buildCronExpression(values);

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
          <CustomDimension
            title="Days of the week"
            description={selectionSummary(custom.days_of_week, DOW_LABELS)}
            onClear={() => updateCustom({ days_of_week: [] })}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DOW_LABELS.map((label, idx) => (
                <Chip
                  key={label}
                  active={(custom.days_of_week || []).map(Number).includes(idx)}
                  onClick={() =>
                    updateCustom({ days_of_week: toggleInList(custom.days_of_week, idx) })
                  }
                  className="px-2 py-2 text-[12px]"
                >
                  {label}
                </Chip>
              ))}
            </div>
          </CustomDimension>

          <CustomDimension
            title="Months"
            description={selectionSummary(
              custom.months,
              months.map((m) => MONTH_LABELS[m - 1]),
            )}
            onClear={() => updateCustom({ months: [] })}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {months.map((m) => (
                <Chip
                  key={m}
                  active={(custom.months || []).map(Number).includes(m)}
                  onClick={() => updateCustom({ months: toggleInList(custom.months, m) })}
                  className="px-2 py-1.5 text-left"
                >
                  {MONTH_LABELS[m - 1]}
                </Chip>
              ))}
            </div>
          </CustomDimension>

          <CustomDimension
            title="Days of the month"
            description={selectionSummary(custom.days_of_month)}
            onClear={() => updateCustom({ days_of_month: [] })}
          >
            <div className="grid grid-cols-7 gap-1">
              {daysOfMonth.map((d) => (
                <Chip
                  key={d}
                  active={(custom.days_of_month || []).map(Number).includes(d)}
                  onClick={() =>
                    updateCustom({ days_of_month: toggleInList(custom.days_of_month, d) })
                  }
                  className="px-0 py-1.5 min-w-[2rem]"
                >
                  {d}
                </Chip>
              ))}
            </div>
          </CustomDimension>

          <CustomDimension
            title="Hours"
            description={selectionSummary(custom.hours)}
            onClear={() => updateCustom({ hours: [] })}
          >
            <div className="grid grid-cols-8 sm:grid-cols-12 gap-1">
              {hours.map((h) => (
                <Chip
                  key={h}
                  active={(custom.hours || []).map(Number).includes(h)}
                  onClick={() => updateCustom({ hours: toggleInList(custom.hours, h) })}
                  className="px-0 py-1 min-w-[1.75rem]"
                >
                  {h}
                </Chip>
              ))}
            </div>
          </CustomDimension>

          <CustomDimension
            title="Minutes"
            description={selectionSummary(custom.minutes)}
            onClear={() => updateCustom({ minutes: [] })}
          >
            <div className="grid grid-cols-10 sm:grid-cols-12 gap-1 max-h-40 overflow-y-auto pr-1">
              {minutes.map((m) => (
                <Chip
                  key={m}
                  active={(custom.minutes || []).map(Number).includes(m)}
                  onClick={() => updateCustom({ minutes: toggleInList(custom.minutes, m) })}
                  className="px-0 py-1 min-w-[1.65rem] text-[10px]"
                >
                  {String(m).padStart(2, "0")}
                </Chip>
              ))}
            </div>
          </CustomDimension>

          <p className="text-[11px] text-ink-500 dark:text-ink-550 leading-relaxed">
            Tap to select. Use <strong className="font-semibold">Any (*)</strong> on a row to match
            every value in that field. Empty rows become <code className="text-[10px]">*</code> in
            the crontab.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-ink-200 dark:border-void-775 bg-ink-50/80 dark:bg-void-875/50 px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-550 mb-1">
          Crontab expression
        </p>
        <code className="text-[13px] font-mono text-ink-900 dark:text-ink-100 break-all">
          {cronDisplay}
        </code>
        <p className="text-[11px] text-ink-500 dark:text-ink-550 mt-2 leading-relaxed">
          Registered with Cron Service when you turn the workflow on.
        </p>
      </div>
    </div>
  );
};

export default ScheduleBuilderField;
