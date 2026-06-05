import React, { useEffect, useRef } from "react";
import { TbAlertTriangle, TbX } from "react-icons/tb";

/**
 * ConfirmDialog — a reusable, accessible confirmation modal.
 *
 * Renders a centered overlay with a title, message, and two action buttons.
 * Closes on Escape key or backdrop click.
 *
 * @param {object}   props
 * @param {boolean}  props.open              — controls visibility
 * @param {string}   props.title             — modal heading
 * @param {string}   [props.message]         — body text (supports JSX)
 * @param {string}   [props.confirmLabel]    — confirm button label (default: "Confirm")
 * @param {string}   [props.cancelLabel]     — cancel button label  (default: "Cancel")
 * @param {"danger"|"primary"} [props.variant] — button color theme (default: "danger")
 * @param {boolean}  [props.loading]         — disables buttons and shows spinner on confirm
 * @param {Function} props.onConfirm         — called when the confirm button is clicked
 * @param {Function} props.onCancel          — called when cancel / backdrop / Escape is used
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  variant      = "danger",
  loading      = false,
  onConfirm,
  onCancel,
}) => {
  const confirmBtnRef = useRef(null);

  // Focus the confirm button when the dialog opens for keyboard accessibility.
  useEffect(() => {
    if (open) confirmBtnRef.current?.focus();
  }, [open]);

  // Close on Escape key.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onCancel?.(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmCls =
    variant === "danger"
      ? "bg-[#dc2626] hover:bg-[#b91c1c] text-white"
      : "bg-[#4a6cf7] hover:bg-[#3a5ce0] text-white";

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Panel */}
      <div className="relative w-full max-w-[400px] rounded-2xl shadow-2xl
        bg-white dark:bg-[#1e1e1e]
        border border-[#e8e8e8] dark:border-[#2a2a2a]
        flex flex-col">

        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 w-7 h-7 flex items-center justify-center rounded-lg
            text-[#aaa] dark:text-[#555]
            hover:text-[#333] dark:hover:text-[#ccc]
            hover:bg-[#f0f0f0] dark:hover:bg-[#272727]
            transition-colors disabled:opacity-40"
        >
          <TbX className="w-[15px] h-[15px]" />
        </button>

        {/* Body */}
        <div className="px-6 pt-6 pb-5 flex flex-col gap-3">
          {/* Icon + title row */}
          <div className="flex items-center gap-3">
            {variant === "danger" && (
              <span className="flex-shrink-0 w-9 h-9 flex items-center justify-center
                rounded-full bg-[#fef2f2] dark:bg-[#2a1212]">
                <TbAlertTriangle className="w-5 h-5 text-[#dc2626] dark:text-[#f87171]" />
              </span>
            )}
            <h2
              id="confirm-dialog-title"
              className="text-[15px] font-semibold text-[#111] dark:text-[#e8e8e8] leading-snug"
            >
              {title}
            </h2>
          </div>

          {/* Message */}
          {message && (
            <p className="text-[13px] text-[#666] dark:text-[#888] leading-relaxed pl-0.5">
              {message}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pb-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-[13px] font-medium
              text-[#444] dark:text-[#aaa]
              bg-[#f3f3f3] dark:bg-[#272727]
              hover:bg-[#e8e8e8] dark:hover:bg-[#303030]
              disabled:opacity-40 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium flex items-center gap-2
              transition-colors disabled:opacity-60 ${confirmCls}`}
          >
            {loading && (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
