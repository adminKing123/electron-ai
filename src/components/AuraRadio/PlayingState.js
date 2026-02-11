import React from "react";
import { IoClose } from "react-icons/io5";
import { BsMusicNoteBeamed } from "react-icons/bs";
import { STATUS } from "../../hooks/useAuraRadio";
import Header from "../Header";

export default function PlayingState({ status, currentTrack, onStop }) {
  const isLoading = [
    STATUS.STARTING,
    STATUS.LOADING,
    STATUS.BUFFERING,
  ].includes(status);
  const isSongPlaying = currentTrack?.type === "song" && currentTrack?.metadata;
  const isIntroPlaying = currentTrack?.type === "intro";

  const getAlbumThumbnail = () => {
    if (!isSongPlaying) return null;
    const baseUrl =
      "https://raw.githubusercontent.com/harshcore/arsongs-src-copy/main/";
    return baseUrl + currentTrack.metadata.album.thumbnail1200x1200;
  };

  const getStatusText = () => {
    if (isLoading) return "Preparing";
    if (isIntroPlaying) return "Aura is speaking";
    if (isSongPlaying) return "Now Playing";
    return "Buffering...";
  };

  const getStatusColor = () => {
    if (isIntroPlaying) return "text-indigo-500";
    if (isSongPlaying) return "text-green-500";
    return "text-gray-500";
  };

  return (
    <main className="h-screen overflow-auto bg-gradient-to-b from-gray-50 to-white dark:from-[#1a1a1a] dark:to-[#0a0a0a]">
      <Header type="aura-rj" />

      <div className="max-w-4xl mx-auto px-5 py-10">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#2a2a2a] shadow-lg border border-gray-200 dark:border-gray-800">
            <div
              className={`w-2 h-2 rounded-full ${isIntroPlaying ? "bg-indigo-500 animate-pulse" : isSongPlaying ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}
            ></div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {isSongPlaying ? (
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-80 h-80 rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
                <img
                  src={getAlbumThumbnail()}
                  alt={currentTrack.metadata.album.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-green-500/20 to-blue-500/20 animate-pulse pointer-events-none"></div>
            </div>

            <div className="mt-8 text-center max-w-xl">
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                {currentTrack.metadata.original_name}
              </h1>

              <div className="flex items-center justify-center gap-2 text-lg text-gray-700 dark:text-gray-300 mb-3">
                {currentTrack.metadata.artists.map((artist, index) => (
                  <React.Fragment key={artist.id}>
                    {index > 0 && <span className="text-gray-400">•</span>}
                    <span>{artist.name}</span>
                  </React.Fragment>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <BsMusicNoteBeamed />
                  {currentTrack.metadata.album.title}
                </span>
                <span className="text-gray-400">•</span>
                <span>{currentTrack.metadata.album.year}</span>
              </div>

              {currentTrack.metadata.languages &&
                currentTrack.metadata.languages.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {currentTrack.metadata.languages.map((lang) => (
                      <span
                        key={lang.id}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        {lang.name}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          </div>
        ) : <div className="flex flex-col items-center my-20">
            <div className="w-[300px] h-[300px] border-2 rounded-full"></div>
          </div>}

        <div className="flex justify-center mt-6">
          <button
            onClick={onStop}
            className="text-black dark:text-white p-3 border border-black dark:border-white rounded-full"
          >
            <IoClose className="text-xl" />
          </button>
        </div>
      </div>
    </main>
  );
}
