import React from "react";
import { IoStop } from "react-icons/io5";
import { FaRadio } from "react-icons/fa6";
import { STATUS } from "../../hooks/useCometRadio";
import Header from "../Header";

const ALBUM_SIZE  = 200;
const RING_SIZE   = 232;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = ALBUM_SIZE / 2 + 12;
const TICK_COUNT  = 72;
const TICK_HALF   = 4;

function MiniRing() {
  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      className="absolute inset-0"
      aria-hidden="true"
    >
      {Array.from({ length: TICK_COUNT }, (_, i) => {
        const angle = (i / TICK_COUNT) * Math.PI * 2 - Math.PI / 2;
        const cos   = Math.cos(angle);
        const sin   = Math.sin(angle);
        return (
          <line
            key={i}
            x1={RING_CENTER + cos * (RING_RADIUS - TICK_HALF)}
            y1={RING_CENTER + sin * (RING_RADIUS - TICK_HALF)}
            x2={RING_CENTER + cos * (RING_RADIUS + TICK_HALF)}
            y2={RING_CENTER + sin * (RING_RADIUS + TICK_HALF)}
            stroke="rgba(129,140,248,0.35)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export default function PlayingState({ status, currentTrack, onStop }) {
  const isSongPlaying  = currentTrack?.type === "song" && currentTrack?.metadata;
  const isIntroPlaying = currentTrack?.type === "intro";
  const isPlaying      = status === STATUS.PLAYING; // eslint-disable-line no-unused-vars

  if (!currentTrack) {
    return (
      <main className="h-screen flex flex-col overflow-hidden bg-ink-25 dark:bg-void-850">
        <Header type="comet-rj" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            {[0, 0.15, 0.3].map((delay) => (
              <div
                key={delay}
                className="w-1.5 h-1.5 rounded-full bg-ink-950 dark:bg-white opacity-40"
                style={{ animation: `pulse 1.2s ease-in-out ${delay}s infinite` }}
              />
            ))}
          </div>
          <p className="text-xs text-ink-450 dark:text-ink-550 tracking-wide">
            Getting your station ready
          </p>
        </div>
      </main>
    );
  }

  const albumThumbnail = isSongPlaying
    ? "https://raw.githubusercontent.com/harshcore/arsongs-src-copy/main/" +
      currentTrack.metadata.album.thumbnail1200x1200
    : null;

  const statusLabel = isIntroPlaying
    ? "Comet is speaking"
    : isSongPlaying
    ? "Now playing"
    : "Buffering…";

  const artistLine = isSongPlaying
    ? currentTrack.metadata.artists.map((a) => a.name).join("  ·  ")
    : null;

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-ink-25 dark:bg-void-850">
      <Header type="comet-rj" />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-5 pb-4">

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-500">
              Live
            </span>
          </div>
          <span className="text-[11px] text-ink-450 dark:text-ink-600">·</span>
          <span className="text-[11px] text-ink-500 dark:text-ink-550 tracking-wide">
            {statusLabel}
          </span>
        </div>

        <div
          className="relative flex-shrink-0 flex items-center justify-center"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <MiniRing />

          {isSongPlaying ? (
            <img
              src={albumThumbnail}
              alt={currentTrack.metadata.album.title}
              style={{ width: ALBUM_SIZE, height: ALBUM_SIZE }}
              className="rounded-full object-cover shadow-2xl relative z-10"
            />
          ) : (
            <div
              style={{ width: ALBUM_SIZE, height: ALBUM_SIZE }}
              className="rounded-full bg-white dark:bg-void-850 border border-ink-150 dark:border-void-875 shadow-xl flex items-center justify-center relative z-10"
            >
              <FaRadio className="text-4xl text-ink-450 dark:text-ink-600" />
            </div>
          )}
        </div>

        <div className="text-center max-w-xs">
          <p className="text-base font-semibold text-ink-950 dark:text-white leading-snug">
            {isSongPlaying ? currentTrack.metadata.original_name : "Comet RJ"}
          </p>

          {isSongPlaying ? (
            <>
              <p className="text-sm text-ink-550 dark:text-ink-550 mt-1">
                {artistLine}
              </p>
              <p className="text-xs text-ink-400 dark:text-ink-600 mt-0.5">
                {currentTrack.metadata.album.title}&ensp;·&ensp;{currentTrack.metadata.album.year}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-550 dark:text-ink-550 mt-1">
              Your personal radio station
            </p>
          )}
        </div>

        <button
          onClick={onStop}
          aria-label="Stop radio"
          className="flex items-center gap-2 px-5 py-2 rounded-full border border-ink-200 dark:border-void-800
            text-xs font-medium text-ink-950 dark:text-white
            hover:bg-ink-50 dark:hover:bg-void-850 transition-colors"
        >
          <IoStop className="text-sm" />
          Stop
        </button>

      </div>
    </main>
  );
}
