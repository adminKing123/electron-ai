import { useEffect, useState } from "react";

/**
 * Ticks elapsed ms from an ISO start time while `active` is true.
 * When inactive, returns `finishedMs` if provided.
 */
export default function useLiveDuration(startedAt, active, finishedMs = null) {
  const [elapsed, setElapsed] = useState(() => {
    if (!active) return finishedMs;
    if (!startedAt) return null;
    return Date.now() - new Date(startedAt).getTime();
  });

  useEffect(() => {
    if (!active) {
      setElapsed(finishedMs);
      return undefined;
    }
    if (!startedAt) {
      setElapsed(null);
      return undefined;
    }

    const tick = () => {
      setElapsed(Date.now() - new Date(startedAt).getTime());
    };
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [startedAt, active, finishedMs]);

  return elapsed;
}
