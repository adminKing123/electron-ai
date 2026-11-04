import { useEffect, useState } from "react";
import { getScheduleTimezonesAPI } from "../apis/fuse/queryFunctions";
import {
  DEFAULT_SCHEDULE_TIMEZONE,
  normalizeTimezoneOption,
} from "../components/Fuse/scheduleTimezoneOptions";

let cachedOptions = null;
let loadPromise = null;

export function fetchScheduleTimezones() {
  if (cachedOptions) {
    return Promise.resolve(cachedOptions);
  }
  if (!loadPromise) {
    loadPromise = getScheduleTimezonesAPI()
      .then((data) => {
        const list = (data?.timezones || []).map(normalizeTimezoneOption);
        cachedOptions = list.length ? list : [{ value: DEFAULT_SCHEDULE_TIMEZONE, label: "UTC", offset: "GMT" }];
        return cachedOptions;
      })
      .catch(() => {
        cachedOptions = [{ value: DEFAULT_SCHEDULE_TIMEZONE, label: "UTC", offset: "GMT" }];
        return cachedOptions;
      });
  }
  return loadPromise;
}

/** @returns {{ options: Array<{value,label,offset}>, loading: boolean, error: boolean }} */
export function useScheduleTimezones() {
  const [options, setOptions] = useState(cachedOptions || []);
  const [loading, setLoading] = useState(!cachedOptions);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchScheduleTimezones()
      .then((list) => {
        if (!cancelled) {
          setOptions(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { options, loading, error };
}
