/**
 * FuseStudioHeader.js
 * ───────────────────
 * Top bar for the Fuse workflow builder studio.
 *
 * Displays:
 *   - Back navigation
 *   - Inline-editable workflow name with autosave indicator
 *   - User profile button
 */

import React, { useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import useFuseStudioStore from "../../store/useFuseStudioStore";
import { IoChevronBackOutline } from "react-icons/io5";
import { TbPlus, TbPower, TbRefresh, TbAlertCircle, TbX, TbActivity } from "react-icons/tb";
import HeaderUserProfile from "../HeaderUserProfile";
import ROUTES from "../../router/routes";

export const iconBtnCls =
  "w-8 h-8 flex items-center justify-center rounded-lg " +
  "text-ink-500 dark:text-ink-600 " +
  "hover:text-ink-975 dark:hover:text-white " +
  "hover:bg-ink-100 dark:hover:bg-ink-875 " +
  "transition-colors";

  const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(ROUTES.FUSE)}
      className={iconBtnCls}
      aria-label="Go back"
    >
      <IoChevronBackOutline className="w-[18px] h-[18px]" />
    </button>
  );
};

const WorkflowNameInput = ({ value, onChange, onBlur, placeholder = "Untitled Workflow", savingName = false }) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Escape") inputRef.current?.blur();
  };

  return (
    <div className="flex flex-1 items-center gap-1.5 min-w-0">
      <input
        ref={inputRef}
        type="text"
        value={value}
        maxLength={60}
        onChange={(e) => onChange(e.target.value.slice(0, 60))}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder={placeholder}
        style={{ textOverflow: "ellipsis" }}
        className="w-full min-w-0 bg-transparent px-2 py-1
          text-[14px] font-semibold tracking-tight
          text-ink-975 dark:text-white
          placeholder:text-ink-400 dark:placeholder:text-ink-550
          border-none outline-none"
      />
    </div>
  );
};

// ─── Compilation errors popup (used inside CanvasActionBar) ───────────────────

/**
 * Renders a red badge button that opens a popover listing all compilation
 * errors.  Disappears when there are no errors.
 */
const CompilationErrorsButton = ({ errors = [] }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  // Dismiss on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!errors.length) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="View compilation errors"
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-semibold
          transition-colors
          text-red-600 dark:text-red-400
          bg-red-50 dark:bg-red-900/20
          hover:bg-red-100 dark:hover:bg-red-900/30
          border border-red-200 dark:border-red-800"
      >
        <TbAlertCircle className="w-[14px] h-[14px]" />
        {errors.length} error{errors.length !== 1 ? "s" : ""}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[300px] z-50
            bg-white dark:bg-ink-825
            border border-red-200 dark:border-red-900
            rounded-xl shadow-xl overflow-hidden"
          role="dialog"
          aria-label="Compilation errors"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5
            border-b border-red-100 dark:border-red-900/50
            bg-red-50 dark:bg-red-950/30">
            <span className="text-[12px] font-semibold text-red-700 dark:text-red-400">
              Compilation failed
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="w-5 h-5 flex items-center justify-center rounded
                text-red-400 dark:text-red-600
                hover:text-red-700 dark:hover:text-red-300
                hover:bg-red-100 dark:hover:bg-red-900/40
                transition-colors"
            >
              <TbX className="w-[13px] h-[13px]" />
            </button>
          </div>

          {/* Error list */}
          <ul className="px-3.5 py-3 space-y-1.5 max-h-60 overflow-y-auto">
            {errors.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-red-600 dark:text-red-400">
                <span className="flex-shrink-0 mt-0.5 font-bold">•</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>

          {/* Footer hint */}
          <div className="px-3.5 py-2 border-t border-ink-75 dark:border-ink-825">
            <p className="text-[11px] text-ink-400 dark:text-ink-550">
              Fix the issues above and click Turn On again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CanvasActionBar ─────────────────────────────────────────────────────────
//
// Floating pill bar rendered at the bottom-centre of the canvas area.
// Mirrors the Google Studio / Zapier bottom-bar pattern.
// Rendered as `position: absolute` inside a `position: relative` canvas wrapper.
//
// States:
//   in-flight  → spinner pill ("Compiling…" or "Stopping…")
//   active     → "Add step" | "Save changes" (dark) | "Turn off"
//   inactive   → "Add step" | "Turn on" (dark)
//
// Props
// -----
// hasNodes     {boolean}   True when at least one starter node is on canvas
// isActive     {boolean}   Workflow is running
// activating   {boolean}   Activate call in-flight
// deactivating {boolean}   Deactivate call in-flight
// compilationErrors {string[]} Errors from last failed compile
// onAddNode    {Function}  Open Add Node panel
// onActivate   {Function}  Turn On / Save Changes
// onDeactivate {Function}  Turn Off

export const CanvasActionBar = ({
  hasNodes = false,
  isActive = false,
  activating = false,
  deactivating = false,
  compilationErrors = [],
  onAddNode,
  onActivate,
  onDeactivate,
}) => {
  const inFlight = activating || deactivating;
  const saving = useFuseStudioStore((s) => s.saving);

  return (
    <>
      {/* Errors badge — top-right corner of the canvas */}
      <div className="absolute top-4 right-4 z-20">
        <CompilationErrorsButton errors={compilationErrors} />
      </div>

    <div className="hidden md:block absolute bottom-5 left-1/2 -translate-x-1/2 z-10">

      {/* ── Pill ────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center
          bg-white dark:bg-ink-825
          border border-ink-150 dark:border-ink-775
          rounded-full shadow-xl shadow-black/10 dark:shadow-black/50
          overflow-hidden p-1 gap-0.5"
      >
        {/* Add step — always visible (disabled when no trigger yet or in-flight) */}
        <button
          type="button"
          onClick={onAddNode}
          disabled={!hasNodes || inFlight}
          title={!hasNodes ? "Add a trigger node first" : "Add an action node"}
          className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 h-8 md:h-10
            text-[11px] md:text-[13px] font-medium whitespace-nowrap
            transition-colors select-none
            text-ink-700 dark:text-ink-400
            hover:bg-ink-50 dark:hover:bg-ink-825
            disabled:opacity-40 disabled:cursor-not-allowed rounded-full"
        >
          <TbPlus className="w-[13px] h-[13px] md:w-[15px] md:h-[15px] flex-shrink-0" />
          Add step
        </button>

        {inFlight ? (
          /* Spinner button while API call is in-flight */
          <button
            disabled
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 h-8 md:h-10
              text-[11px] md:text-[13px] font-semibold whitespace-nowrap
              select-none cursor-not-allowed
              text-white bg-ink-650 dark:bg-ink-750 rounded-full"
          >
            <span className="w-3 h-3 md:w-3.5 md:h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
            {deactivating ? "Stopping…" : "Compiling…"}
          </button>
        ) : isActive ? (
          /* Save changes — primary action when running */
          <button
            type="button"
            onClick={onActivate}
            disabled={saving}
            title="Recompile with current graph"
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 h-8 md:h-10
              text-[11px] md:text-[13px] font-semibold whitespace-nowrap
              transition-colors select-none
              text-white bg-brand-600 dark:bg-brand-500 shadow-glow
              hover:bg-brand-700 dark:hover:bg-brand-400 rounded-full
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <TbRefresh className="w-[13px] h-[13px] md:w-[15px] md:h-[15px] flex-shrink-0" />
            Save changes
          </button>
        ) : (
          /* Turn on — primary action when inactive */
          <button
            type="button"
            onClick={onActivate}
            disabled={!hasNodes || saving}
            title={!hasNodes ? "Add a trigger node first" : "Compile and start the workflow"}
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 h-8 md:h-10
              text-[11px] md:text-[13px] font-semibold whitespace-nowrap
              transition-colors select-none
              text-white bg-brand-600 dark:bg-brand-500 shadow-glow
              hover:bg-brand-700 dark:hover:bg-brand-400 rounded-full
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <TbPower className="w-[13px] h-[13px] md:w-[15px] md:h-[15px] flex-shrink-0" />
            Turn on
          </button>
        )}

        {/* Turn off — only shown when active and not in-flight */}
        {isActive && !inFlight && (
          <>
            <button
              type="button"
              onClick={onDeactivate}
              className="flex items-center gap-1 md:gap-1.5 px-2.5 md:px-4 h-8 md:h-10
                text-[11px] md:text-[13px] font-medium whitespace-nowrap
                transition-colors select-none
                text-red-500 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
            >
              <TbPower className="w-[13px] h-[13px] md:w-[15px] md:h-[15px] flex-shrink-0" />
              Turn off
            </button>
          </>
        )}
      </div>
    </div>
    </>
  );
};

// ─── Root header ──────────────────────────────────────────────────────────────
//
// Slim top bar — back navigation, editable workflow name,
// optional webhook URL pill (when running + webhook-triggered), and profile.
// Execution controls live in CanvasActionBar (bottom of canvas), not here.
//
// Props
// -----
// name         {string}      Workflow name
// onNameChange {Function}    Keystroke handler
// onNameBlur   {Function}    Blur handler (triggers autosave)
// savingName       {boolean}     True while the name is persisting
// isActive     {boolean}     Whether the workflow is running (controls webhook pill)
// webhookUrl   {string|null} Public webhook URL (null for schedule workflows)

const FuseStudioHeader = ({
  name,
  workflowId,
  onNameChange,
  onNameBlur,
  savingName = false,
  isLoading = false,
}) => (
  <header id="fuse-studio-header" className="w-full flex-shrink-0">
    <div className="h-[56px] w-full flex items-center justify-between gap-2 px-3">
      {/* Left: back button + workflow name */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <BackButton />
        <WorkflowNameInput
          value={name}
          onChange={onNameChange}
          onBlur={onNameBlur}
          savingName={savingName}
          placeholder={isLoading ? "" : "Untitled Workflow"}
        />
      </div>

      {/* Right: runs link + user profile */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {workflowId && (
          <Link
            to={ROUTES.GET_FUSE_RUNS_URL(workflowId)}
            title="View run history"
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium
              text-ink-500 dark:text-ink-550
              hover:text-ink-750 dark:hover:text-ink-300
              hover:bg-ink-100 dark:hover:bg-ink-875
              transition-colors"
          >
            <TbActivity className="w-[14px] h-[14px]" />
            Runs
          </Link>
        )}
        <HeaderUserProfile />
      </div>
    </div>
  </header>
);

export default FuseStudioHeader;

