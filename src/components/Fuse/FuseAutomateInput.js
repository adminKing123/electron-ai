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
    <div ref={containerRef} className="relative w-full flex flex-col items-center pt-5 pb-4 px-4 md:pt-8 md:pb-6 md:px-6">
      {expanded && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[min(720px,90%)] h-64
            bg-[radial-gradient(ellipse_at_center,rgba(147,197,253,0.35)_0%,rgba(196,181,253,0.15)_45%,transparent_70%)]
            dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.2)_0%,rgba(124,58,237,0.1)_45%,transparent_70%)]
            blur-2xl transition-opacity duration-300"
        />
      )}

      <h1
        className={`relative text-[1.7rem] md:text-[2.4rem] font-semibold font-sans tracking-tight text-[#343434] dark:text-white text-center
          transition-opacity duration-300 ${expanded ? "opacity-40 dark:opacity-30" : ""}`}
      >
        Automate your work with{" "}
        <span className="italic text-[#ffad09] dark:text-[#ffbf3e] font-mono">Fuse</span>
        <span>
          <TbBolt className="inline-block text-[#ffad09] dark:text-[#ffbf3e] ml-1" />
        </span>
      </h1>

      <p
        className={`relative text-[1rem] md:text-[1.4rem] text-[#888] dark:text-[#666] text-center leading-relaxed mt-1
          transition-opacity duration-300 ${expanded ? "opacity-30 dark:opacity-25" : ""}`}
      >
        Streamline and manage tasks across Workspace
      </p>

      <div className="relative w-full max-w-2xl mt-8 flex flex-col gap-3">
        {!expanded ? (
          <div
            onClick={handleExpand}
            className="w-full flex items-center gap-2 cursor-text
              bg-white dark:bg-[#242424]
              border border-[#e0e0e0] dark:border-[#2e2e2e]
              rounded-full shadow-sm
              hover:border-[#c4b5fd] dark:hover:border-[#4a3a8a]
              focus-within:border-[#93c5fd] dark:focus-within:border-[#4a3a8a]
              focus-within:shadow-[0_0_0_3px_rgba(147,197,253,0.25)]
              transition-all duration-200
              pl-4 pr-1 py-1"
          >
            <input
              ref={collapsedInputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={handleExpand}
              placeholder="Describe a task for Comet Fuse…"
              disabled={creating}
              className="flex-1 min-w-0 bg-transparent text-[13px]
                text-[#333] dark:text-[#ccc]
                placeholder-[#bbb] dark:placeholder-[#555]
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold
                bg-[#111] dark:bg-[#f0f0f0] text-white dark:text-[#111]
                hover:opacity-80 active:opacity-70
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-opacity"
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
              className="w-full bg-white dark:bg-[#242424]
                border border-[#dbeafe] dark:border-[#3b3b5c]
                rounded-[28px]
                shadow-[0_8px_40px_rgba(59,130,246,0.18),0_2px_12px_rgba(0,0,0,0.06)]
                dark:shadow-[0_8px_40px_rgba(59,130,246,0.12),0_2px_12px_rgba(0,0,0,0.3)]
                px-6 pt-5 pb-4
                animate-fuseExpandIn"
            >
              <p className="text-[15px] font-medium text-[#2563eb] dark:text-[#93c5fd] mb-3">
                Describe a task for Fuse
              </p>

              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what tasks to do, which apps to use, and when to do them"
                disabled={creating}
                rows={4}
                className="w-full resize-none bg-transparent text-[15px] leading-relaxed
                  text-[#333] dark:text-[#ddd]
                  placeholder-[#bbb] dark:placeholder-[#555]
                  outline-none disabled:opacity-60 min-h-[96px]"
              />

              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  onMouseDown={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[13px] font-medium
                    bg-[#f0f0f0] dark:bg-[#333]
                    text-[#444] dark:text-[#ccc]
                    hover:bg-[#e8e8e8] dark:hover:bg-[#3a3a3a]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors"
                >
                  {creating ? (
                    <span className="w-4 h-4 border-2 border-[#999] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <TbBolt className="w-4 h-4" />
                  )}
                  Create
                </button>
              </div>
            </form>

            <div
              className="w-full bg-white dark:bg-[#242424]
                border border-[#e8e8e8] dark:border-[#2e2e2e]
                rounded-[20px] shadow-sm
                px-5 py-4
                animate-fuseExpandIn"
            >
              <p className="text-[14px] font-semibold text-[#222] dark:text-[#eee] mb-3">
                Try example prompts
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map(({ icon: Icon, label, prompt: examplePrompt }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={creating}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleExampleClick(examplePrompt)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px]
                      bg-white dark:bg-[#2a2a2a]
                      border border-[#e0e0e0] dark:border-[#3a3a3a]
                      text-[#333] dark:text-[#ccc]
                      hover:border-[#c4b5fd] dark:hover:border-[#5b4a9a]
                      hover:bg-[#fafafa] dark:hover:bg-[#303030]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
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
