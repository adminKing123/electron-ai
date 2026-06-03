import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuraRadio, STATUS } from "../hooks/useAuraRadio";
import { PlayingState, ErrorState } from "../components/AuraRadio";

export default function AuraRjPage() {
  const { status, errorMessage, currentTrack, started, start, stop } = useAuraRadio();
  const navigate      = useNavigate();
  const hasStartedRef = useRef(false);

  /* Start the radio automatically when the page mounts. */
  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Navigate back when stop() finishes (started flips false after being true). */
  useEffect(() => {
    if (started) {
      hasStartedRef.current = true;
    } else if (hasStartedRef.current) {
      navigate(-1);
    }
  }, [started, navigate]);

  if (status === STATUS.ERROR) {
    return <ErrorState errorMessage={errorMessage} onRetry={start} />;
  }

  return <PlayingState status={status} currentTrack={currentTrack} onStop={stop} />;
}
