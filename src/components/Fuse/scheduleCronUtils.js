/** Shared labels and defaults for the schedule builder (cron math lives in cron-service). */

export const MONTH_LABELS = [
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

export const DOW_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function defaultCustomSchedule() {
  return {
    minutes: [],
    hours: [],
    days_of_month: [],
    months: [],
    days_of_week: [],
  };
}
