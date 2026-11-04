/**
 * IANA time zones for schedule nodes (cron-job.org compatible).
 * Uses Intl.supportedValuesOf when available; falls back to a short list.
 */

function formatOffset(tz, now = new Date()) {
  try {
    return (
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "longOffset",
      })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value ?? "GMT"
    );
  } catch {
    return "GMT";
  }
}

function buildTimezoneOptions() {
  let zones;
  try {
    zones = [...Intl.supportedValuesOf("timeZone")];
  } catch {
    zones = [
      "UTC",
      "Asia/Kolkata",
      "America/New_York",
      "America/Los_Angeles",
      "Europe/London",
      "Asia/Tokyo",
      "Asia/Shanghai",
    ];
  }

  if (!zones.includes("UTC")) {
    zones.unshift("UTC");
  }

  zones.sort((a, b) => {
    if (a === "UTC") return -1;
    if (b === "UTC") return 1;
    return a.localeCompare(b);
  });

  const now = new Date();
  return zones.map((tz) => ({
    value: tz,
    label: tz.replace(/_/g, " "),
    offset: formatOffset(tz, now),
  }));
}

export const SCHEDULE_TIMEZONE_OPTIONS = buildTimezoneOptions();

export const DEFAULT_SCHEDULE_TIMEZONE = "UTC";

export function filterTimezoneOptions(options, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return options;
  return options.filter(
    (opt) =>
      opt.value.toLowerCase().includes(q) ||
      opt.label.toLowerCase().includes(q) ||
      opt.offset.toLowerCase().includes(q),
  );
}
