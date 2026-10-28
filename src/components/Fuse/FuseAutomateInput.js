import React, { useCallback, useEffect, useRef, useState } from "react";
import { TbBolt, TbClock, TbFlag, TbMail, TbSun } from "react-icons/tb";

const EXAMPLE_PROMPTS = [
  { icon: TbClock, label: "Set a reminder", prompt: "Remind me every weekday at 8 AM with a push notification" },
  { icon: TbFlag, label: "Manage requests", prompt: "When a webhook receives a new request, notify me with the details" },
  { icon: TbSun, label: "Catch me up daily", prompt: "Every morning at 9 AM, send me a notification to start the day" },
  { icon: TbMail, label: "Send an email", prompt: "When a webhook is triggered, send a Gmail to the recipient in the payload" },
];

/**
 * FuseAutomateInput — Hero prompt area on the Fuse discovery page.
 *
 * Collapsed: compact pill input.
 * Focused:  expands into a card with textarea, Create action, and example prompts.
 * Collapses on blur (focus out), click outside, or Escape.
 */
const FuseAutomateInput = ({ creating, onCreate, onExpandedChange }) => {
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef(null);
  const expandedRef = useRef(null);
  const textareaRef = useRef(null);
  const collapsedInputRef = useRef(null);

  const setExpandedState = useCallback(
    (value) => {
      setExpanded(value);
      onExpandedChange?.(value);
    },
    [onExpandedChange]
  );

  const handleExpand = useCallback(() => {
    setExpandedState(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [setExpandedState]);

  const handleCollapse = useCallback(() => {
    if (creating) return;
    setExpandedState(false);
    collapsedInputRef.current?.blur();
    textareaRef.current?.blur();
  }, [creating, setExpandedState]);

  /** Collapse when focus leaves the expanded panel entirely. */
  const handleExpandedFocusOut = useCallback(
    (e) => {
      if (creating) return;
      const next = e.relatedTarget;
      if (expandedRef.current?.contains(next)) return;
      handleCollapse();
    },
    [creating, handleCollapse]
  );

  useEffect(() => {
    if (!expanded) return;

    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        handleCollapse();
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") handleCollapse();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded, handleCollapse]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const trimmed = prompt.trim();
    if (!trimmed || creating) return;
    onCreate(trimmed);
  };

  const handleExampleClick = (examplePrompt) => {
    setPrompt(examplePrompt);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const canSubmit = prompt.trim().length > 0 && !creating;

  return (
    <div ref={containerRef} className="relative w-full flex flex-col items-center pt-8 pb-6 px-4 md:pt-14 md:pb-10 md:px-6">
      {expanded && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 w-[min(720px,90%)] h-64
            bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.22)_0%,rgba(139,92,246,0.08)_45%,transparent_70%)]
            dark:bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.06)_0%,transparent_55%)]
            blur-2xl transition-opacity duration-300"
        />
      )}

      <div
        className={`relative flex flex-col items-center transition-opacity duration-300 ${
          expanded ? "opacity-40 dark:opacity-30" : ""
        }`}
      >

        <h1 className="text-[28px] md:text-[38px] font-bold tracking-tight leading-[1.15] text-ink-975 dark:text-white text-center">
          Automate your work with{" "}
          <span className="text-brand-600 dark:text-brand-400">Fuse</span>
        </h1>

        <p className="text-[14px] md:text-[16px] text-ink-500 dark:text-ink-500 text-center leading-relaxed mt-3 max-w-md">
          Streamline and manage tasks across Workspace
        </p>
      </div>

      <div className="relative w-full max-w-2xl mt-8 flex flex-col gap-3">
        {!expanded ? (
          <div
            onClick={handleExpand}
            className="w-full flex items-center gap-3 cursor-text
              bg-white dark:bg-void-825
              border border-ink-150 dark:border-void-750
              rounded-2xl shadow-glow-lg dark:shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]
              hover:border-brand-200 dark:hover:border-brand-900
              transition-colors duration-200
              pl-4 pr-1.5 py-1.5"
          >
            <TbBolt className="w-[18px] h-[18px] flex-shrink-0 text-brand-500 dark:text-brand-400" />
            <input
              ref={collapsedInputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={handleExpand}
              placeholder="Describe a task for Comet Fuse…"
              disabled={creating}
              className="flex-1 min-w-0 bg-transparent text-[14px] py-2
                text-ink-875 dark:text-ink-150
                placeholder-ink-450 dark:placeholder-ink-550
                outline-none disabled:opacity-60"
            />
            <button
              type="button"
              disabled={!canSubmit}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                if (canSubmit) handleSubmit();
                else handleExpand();
              }}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-semibold
                bg-brand-600 dark:bg-brand-500 text-white dark:text-[var(--brand-on-solid)]
                hover:bg-brand-700 dark:hover:bg-brand-600 active:opacity-80
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors"
            >
              <TbBolt className="w-4 h-4" />
              Create
            </button>
          </div>
        ) : (
          <div
            ref={expandedRef}
            onBlur={handleExpandedFocusOut}
            className="flex flex-col gap-3"
          >
            <form
              onSubmit={handleSubmit}
              className="w-full bg-white dark:bg-void-825
                border border-brand-200 dark:border-brand-900
                rounded-2xl
                shadow-[0_8px_40px_rgba(139,92,246,0.16),0_2px_12px_rgba(0,0,0,0.05)]
                dark:shadow-[0_8px_32px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.04)_inset]
                px-5 pt-4 pb-3.5
                animate-fuseExpandIn"
            >
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 dark:text-brand-300 mb-2.5">
                <TbBolt className="w-4 h-4" />
                Describe a task for Fuse
              </p>

              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what tasks to do, which apps to use, and when to do them"
                disabled={creating}
                rows={4}
                className="w-full resize-none bg-transparent text-[14px] leading-relaxed
                  text-ink-875 dark:text-ink-150
                  placeholder-ink-450 dark:placeholder-ink-550
                  outline-none disabled:opacity-60 min-h-[96px]"
              />

              <div className="flex items-center justify-between gap-3 mt-2 pt-3 border-t border-ink-100 dark:border-void-800">
                <span className="hidden sm:inline text-[12px] text-ink-450 dark:text-ink-550">
                  Press Esc to close
                </span>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  onMouseDown={(e) => e.preventDefault()}
                  className="ml-auto inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold
                    bg-brand-600 dark:bg-brand-500 text-white dark:text-[var(--brand-on-solid)]
                    hover:bg-brand-700 dark:hover:bg-brand-600
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-colors"
                >
                  {creating ? (
                    <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <TbBolt className="w-4 h-4" />
                  )}
                  Create
                </button>
              </div>
            </form>

            <div
              className="w-full bg-white dark:bg-void-825
                border border-ink-150 dark:border-void-800
                rounded-2xl shadow-sm
                px-5 py-4
                animate-fuseExpandIn"
            >
              <p className="text-[12px] font-semibold text-ink-500 dark:text-ink-500 mb-3">
                Try an example
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map(({ icon: Icon, label, prompt: examplePrompt }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={creating}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleExampleClick(examplePrompt)}
                    className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium
                      bg-ink-25 dark:bg-void-800
                      border border-ink-150 dark:border-void-750
                      text-ink-750 dark:text-ink-200
                      hover:border-brand-200 dark:hover:border-brand-900
                      hover:bg-brand-50 dark:hover:bg-void-775
                      hover:text-brand-700 dark:hover:text-white
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-brand-500 dark:text-brand-400" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuseAutomateInput;
