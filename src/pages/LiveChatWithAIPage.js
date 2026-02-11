import { useVoiceSession, STATUS } from "../hooks/useVoiceSession";
import {
  InitialState,
  LoadingState,
  ErrorState,
  ActiveState,
} from "../components/LiveVoiceSession";

export default function LiveChatWithAIPage() {
  const { status, errorMessage, isMuted, start, stop, toggleMute } =
    useVoiceSession();

  const isActive = status === STATUS.ACTIVE;
  const isLoading =
    status === STATUS.FETCHING_TOKEN || status === STATUS.CONNECTING;
  const isError = status === STATUS.ERROR;
  const isInitial = status === STATUS.IDLE || status === STATUS.STOPPED;

  return (
    <div className="bg-[#ffffff] dark:bg-[#212121] w-full h-full flex items-center justify-center overflow-hidden">
      {isInitial ? (
        <InitialState onStart={start} />
      ) : isLoading ? (
        <LoadingState status={status} />
      ) : isError ? (
        <ErrorState errorMessage={errorMessage} onRetry={start} />
      ) : isActive ? (
        <ActiveState isMuted={isMuted} onToggleMute={toggleMute} onStop={stop} />
      ) : null}
    </div>
  );
}
