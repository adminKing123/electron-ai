/** Default expiry: one year from now (local calendar). */
export function defaultScheduleExpireParts(now = new Date()) {
  const d = new Date(now);
  d.setFullYear(d.getFullYear() + 1);
  return {
    schedule_expires_day: String(d.getDate()),
    schedule_expires_month: String(d.getMonth() + 1),
    schedule_expires_year: String(d.getFullYear()),
    schedule_expires_hour: String(d.getHours()),
    schedule_expires_minute: String(d.getMinutes()),
  };
}

export function isScheduleExpiresEnabled(values) {
  return values?.schedule_expires_enabled === true || values?.schedule_expires_enabled === "true";
}

export function buildYearOptions(count = 12, startYear = new Date().getFullYear()) {
  return Array.from({ length: count }, (_, i) => {
    const y = startYear + i;
    return { label: String(y), value: String(y) };
  });
}
