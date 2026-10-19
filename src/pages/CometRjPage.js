import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCometRadio, STATUS } from "../hooks/useCometRadio";
import { PlayingState, ErrorState } from "../components/CometRadio";

export default function CometRjPage() {
  const { status, errorMessage, currentTrack, started, start, stop } = useCometRadio();
  const navigate      = useNavigate();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
