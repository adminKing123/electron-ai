import React from "react";
import { HiRadio } from "react-icons/hi2";
import { MdStop } from "react-icons/md";
import { STATUS } from "../../hooks/useAuraRadio";

export default function PlayingState({ status, currentTrack, onStop }) {
  const isLoading = [STATUS.STARTING, STATUS.LOADING, STATUS.BUFFERING].includes(status);
  const isSongPlaying = currentTrack?.type === "song" && currentTrack?.metadata;
  const isIntroPlaying = currentTrack?.type === "intro";

  const getAlbumThumbnail = () => {
    if (!isSongPlaying) return null;
    const baseUrl = "https://raw.githubusercontent.com/harshcore/arsongs-src-copy/main/";
    return baseUrl + currentTrack.metadata.album.thumbnail300x300;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          {/* Show album artwork for songs */}
          {isSongPlaying ? (
            <>
              <img
                src={getAlbumThumbnail()}
                alt="Album Art"
                className="w-64 h-64 rounded-xl shadow-2xl object-cover"
              />
              {/* Subtle pulse around artwork */}
              <div className="absolute inset-0 rounded-xl bg-indigo-500/10 animate-pulse" />
            </>
          ) : (
            /* Show AI icon for intro or loading */
            <div className={`w-32 h-32 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center ${isLoading || isIntroPlaying ? 'animate-pulse' : ''}`}>
              <HiRadio className="text-6xl text-indigo-500" />
            </div>
          )}
          
          {/* Pulse animation rings when AI is speaking */}
          {isIntroPlaying && (
            <>
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-pulse" />
            </>
          )}
        </div>
      </div>

      <button
        onClick={onStop}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
      >
        <MdStop className="text-xl" />
        Stop Radio
      </button>
    </div>
  );
}
