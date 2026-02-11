import React from "react";
import { useAuraRadio, STATUS } from "../hooks/useAuraRadio";
import { InitialState, PlayingState, ErrorState } from "../components/AuraRadio";

export default function AuraRjPage() {
  const { status, errorMessage, started, currentTrack, start, stop } = useAuraRadio();

  if (status === STATUS.ERROR) {
    return <ErrorState errorMessage={errorMessage} onRetry={start} />;
  }

  if (started) {
    return <PlayingState status={status} currentTrack={currentTrack} onStop={stop} />;
  }

  return <InitialState onStart={start} />;
}
