/** Helpers for cron-job.org schedule timezones (loaded from API). */

export const DEFAULT_SCHEDULE_TIMEZONE = "UTC";

export function filterTimezoneOptions(options, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return options;
  return options.filter(
    (opt) =>
      opt.value.toLowerCase().includes(q) ||
      (opt.label || "").toLowerCase().includes(q) ||
      (opt.offset || "").toLowerCase().includes(q),
  );
}

export function normalizeTimezoneOption(opt) {
  return {
    value: opt.value,
    label: opt.label || opt.value.replace(/_/g, " "),
    offset: opt.offset || "",
  };
}
