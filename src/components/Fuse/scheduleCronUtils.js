/**
 * Build a 5-field UNIX cron string for the Fuse UI preview only.
 * Cron Service recomputes the same string from schedule_config when registering jobs.
 */

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DOW_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export { MONTH_LABELS, DOW_LABELS };

function cronPartFromList(list, { min, max } = {}) {
  if (!Array.isArray(list) || list.length === 0) return "*";
  const nums = list
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
  if (!nums.length) return "*";
  if (min != null && max != null && nums.length === max - min + 1) return "*";
  return nums.join(",");
}

/** @param {Record<string, unknown>} config */
export function buildCronExpression(config) {
  const mode = (config.schedule_mode || "interval").toLowerCase();

  if (mode === "interval") {
    const step = Math.max(1, parseInt(String(config.interval_minutes ?? 15), 10) || 15);
    if (step >= 60) return "0 * * * *";
    return `*/${step} * * * *`;
  }

  const hour = parseInt(String(config.hour ?? 0), 10) || 0;
  const minute = parseInt(String(config.minute ?? 0), 10) || 0;

  if (mode === "daily") {
    return `${minute} ${hour} * * *`;
  }

  if (mode === "monthly") {
    const dom = parseInt(String(config.day_of_month ?? 1), 10) || 1;
    return `${minute} ${hour} ${dom} * *`;
  }

  if (mode === "yearly") {
    const dom = parseInt(String(config.day_of_month ?? 1), 10) || 1;
    const month = parseInt(String(config.month ?? 1), 10) || 1;
    return `${minute} ${hour} ${dom} ${month} *`;
  }

  if (mode === "custom") {
    const c = config.custom && typeof config.custom === "object" ? config.custom : {};
    const minuteField =
      typeof c.minute === "string" && c.minute.trim()
        ? c.minute.trim()
        : cronPartFromList(c.minutes, { min: 0, max: 59 });
    const hourField =
      typeof c.hour === "string" && c.hour.trim()
        ? c.hour.trim()
        : cronPartFromList(c.hours, { min: 0, max: 23 });
    const dayField =
      typeof c.day === "string" && c.day.trim()
        ? c.day.trim()
        : cronPartFromList(c.days_of_month, { min: 1, max: 31 });
    const monthField =
      typeof c.month === "string" && c.month.trim()
        ? c.month.trim()
        : cronPartFromList(c.months, { min: 1, max: 12 });
    const dowField =
      typeof c.day_of_week === "string" && c.day_of_week.trim()
        ? c.day_of_week.trim()
        : cronPartFromList(c.days_of_week, { min: 0, max: 6 });
    return `${minuteField} ${hourField} ${dayField} ${monthField} ${dowField}`;
  }

  return "0 0 * * *";
}

/** Default custom pickers: every minute, every hour, etc. */
export function defaultCustomSchedule() {
  return {
    minutes: [],
    hours: [],
    days_of_month: [],
    months: [],
    days_of_week: [],
  };
}

export function schedulePatchWithCron(patch) {
  return { ...patch, cron_expression: buildCronExpression(patch) };
}
