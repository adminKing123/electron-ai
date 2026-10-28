import React from "react";
import { TbSettings2, TbPlus, TbPower, TbRefresh } from "react-icons/tb";
import useFuseStudioStore from "../../store/useFuseStudioStore";

export default function MobileActionBar({
  mobilePanelOpen,
  setMobilePanelOpen,
  hasStarterNode,
  inFlight,
  deactivating,
  isActive,
  onActivate,
  onDeactivate,
}) {
  const setAddingNode = useFuseStudioStore((s) => s.setAddingNode);
  const saving = useFuseStudioStore((s) => s.saving);

  return (
    <nav
      className="flex md:hidden fixed bottom-0 left-0 right-0 z-50
        bg-white dark:bg-void-850
        border-t border-ink-150 dark:border-void-825
        px-2 py-1 justify-around items-center"
    >
      {/* Configure — toggles the config bottom-sheet */}
      <button
        onClick={() => setMobilePanelOpen((v) => !v)}
        className={`flex flex-col items-center justify-center gap-0.5 w-14 py-2 rounded-xl
          text-[11px] font-semibold select-none transition-colors
          ${
            mobilePanelOpen
              ? "text-ink-975 dark:text-white"
              : "text-ink-600 dark:text-ink-450 hover:text-ink-875 dark:hover:text-ink-200"
          }`}
      >
        <TbSettings2 className="w-[20px] h-[20px]" />
        <span>Config</span>
      </button>

      {/* Add step */}
      <button
        onClick={() => setAddingNode(true)}
        disabled={!hasStarterNode || inFlight}
        className="flex flex-col items-center justify-center gap-0.5 w-14 py-2 rounded-xl
          text-[11px] font-semibold select-none transition-colors
          text-ink-600 dark:text-ink-450
          hover:text-ink-875 dark:hover:text-ink-200
          disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <TbPlus className="w-[20px] h-[20px]" />
        <span>Add step</span>
      </button>

      {/* Primary action: Compiling/Stopping | Save changes | Turn on */}
      {inFlight ? (
        <button
          disabled
          className="flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-2xl
            text-[11px] font-semibold text-ink-500 dark:text-ink-550 select-none"
        >
          <span className="w-5 h-5 flex items-center justify-center">
            <span className="w-[14px] h-[14px] border-2 border-ink-500 border-t-transparent rounded-full animate-spin" />
          </span>
          <span>{deactivating ? "Stopping" : "Compiling"}</span>
        </button>
      ) : isActive ? (
        <button
          onClick={onActivate}
          disabled={saving}
          className="flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-2xl
            text-[11px] font-semibold select-none transition-all active:opacity-80
            bg-brand-600 dark:bg-brand-500 shadow-glow
            text-white dark:text-[var(--brand-on-solid)]
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <TbRefresh className="w-[20px] h-[20px]" />
          <span>Save</span>
        </button>
      ) : (
        <button
          onClick={onActivate}
          disabled={!hasStarterNode || saving}
          className="flex flex-col items-center justify-center gap-0.5 w-16 py-2 rounded-2xl
            text-[11px] font-semibold select-none transition-all active:opacity-80
            bg-brand-600 dark:bg-brand-500 shadow-glow
            text-white dark:text-[var(--brand-on-solid)]
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <TbPower className="w-[20px] h-[20px]" />
          <span>Turn on</span>
        </button>
      )}

      {/* Turn off — only when active; spacer keeps layout stable otherwise */}
      {isActive && !inFlight ? (
        <button
          onClick={onDeactivate}
          className="flex flex-col items-center justify-center gap-0.5 w-14 py-2 rounded-xl
            text-[11px] font-semibold select-none transition-colors
            text-red-500 dark:text-red-400
            hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <TbPower className="w-[20px] h-[20px]" />
          <span>Turn off</span>
        </button>
      ) : (
        <div className="w-14" aria-hidden />
      )}
    </nav>
  );
}
