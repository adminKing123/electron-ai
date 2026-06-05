/**
 * FuseStudioHeader.js
 * ───────────────────
 * Top bar for the Fuse workflow builder studio.
 *
 * Displays:
 *   - Back navigation
 *   - Inline-editable workflow name with autosave indicator
 *   - Webhook URL copy row (when the workflow is active + webhook-triggered)
 *   - "Add Node" button (disabled until a starter node is on canvas)
 *   - Execution control buttons that adapt to the current workflow state:
 *       inactive             → "Turn On"  (green)
 *       activating           → spinner disabled button
 *       active + clean graph → "Running" pill + "Turn Off" (red)
 *       active + dirty graph → "Running (pending)" pill + "Recompile" (green) + "Turn Off" (red)
 */

import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";
import { TbCopy, TbCheck, TbPlus, TbPower, TbRefresh, TbAlertCircle, TbX } from "react-icons/tb";
import HeaderUserProfile from "../HeaderUserProfile";
import ROUTES from "../../router/routes";

export const iconBtnCls =
  "w-8 h-8 flex items-center justify-center rounded-lg " +
  "text-[#888] dark:text-[#666] " +
  "hover:text-[#111] dark:hover:text-white " +
  "hover:bg-[#ebebeb] dark:hover:bg-[#222] " +
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

const WorkflowNameInput = ({ value, onChange, onBlur, saving = false }) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Escape") inputRef.current?.blur();
  };

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <input
        ref={inputRef}
        type="text"
        value={value}
        maxLength={60}
        onChange={(e) => onChange(e.target.value.slice(0, 60))}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder="Untitled Workflow"
        style={{ textOverflow: "ellipsis" }}
        className="w-full max-w-[300px] bg-transparent px-2 py-1
          text-[14px] font-semibold tracking-tight
          text-[#111] dark:text-white
          placeholder:text-[#aaa] dark:placeholder:text-[#555]
          border-none outline-none"
      />
    </div>
  );
};

// ─── Webhook URL copy row ─────────────────────────────────────────────────────

const WebhookUrlRow = ({ url }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  let displayUrl = url;
  try {
    displayUrl = new URL(url).pathname;
  } catch (_) { /* keep full URL */ }

  return (
    <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
      <span className="text-[11px] text-[#888] dark:text-[#555] flex-shrink-0">Webhook:</span>
      <code
        className="text-[11px] font-mono text-[#555] dark:text-[#aaa]
          bg-[#f4f4f4] dark:bg-[#272727]
          border border-[#e5e5e5] dark:border-[#333]
          px-2 py-0.5 rounded-md truncate max-w-[220px]"
        title={url}
      >
        {displayUrl}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className={`${iconBtnCls} !w-6 !h-6`}
        aria-label="Copy webhook URL"
        title={copied ? "Copied!" : "Copy webhook URL"}
      >
        {copied
          ? <TbCheck className="w-[13px] h-[13px] text-green-500" />
          : <TbCopy className="w-[13px] h-[13px]" />
        }
      </button>
    </div>
  );
};

// ─── Status pill ──────────────────────────────────────────────────────────────

const StatusPill = ({ isGraphDirty }) => {
  if (isGraphDirty) {
    return (
      <span
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold
          text-amber-700 dark:text-amber-400
          bg-amber-50 dark:bg-amber-900/20
          border border-amber-200 dark:border-amber-800"
        title="Graph has been modified since last compilation. Click Recompile to apply changes."
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" />
        Running · pending changes
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold
        text-emerald-700 dark:text-emerald-400
        bg-emerald-50 dark:bg-emerald-900/20
        border border-emerald-200 dark:border-emerald-800"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
      Running
    </span>
  );
};

// ─── Add Node button (shared) ─────────────────────────────────────────────────

const AddNodeButton = ({ hasNodes, onAddNode }) => (
  <button
    type="button"
    onClick={onAddNode}
    disabled={!hasNodes}
    className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-semibold
      transition-colors
      disabled:opacity-40 disabled:cursor-not-allowed
      text-[#444] dark:text-[#bbb]
      bg-[#f0f0f0] dark:bg-[#272727]
      hover:bg-[#e4e4e4] dark:hover:bg-[#303030]
      disabled:hover:bg-[#f0f0f0] dark:disabled:hover:bg-[#272727]"
  >
    <TbPlus className="w-[14px] h-[14px]" />
    Add Node
  </button>
);

// ─── Compilation errors popup ───────────────────────────────────────────────

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
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-semibold
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
            bg-white dark:bg-[#1e1e1e]
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
          <div className="px-3.5 py-2 border-t border-[#f0f0f0] dark:border-[#272727]">
            <p className="text-[11px] text-[#aaa] dark:text-[#555]">
              Fix the issues above and click Turn On again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Execution control buttons ────────────────────────────────────────────────

const ExecutionControls = ({
  hasNodes,
  isActive,
  isGraphDirty,
  activating,
  deactivating,
  compilationErrors,
  onAddNode,
  onActivate,
  onDeactivate,
}) => {
  // Either an activate or deactivate call is in-flight
  if (activating || deactivating) {
    return (
      <div className="flex items-center gap-2">
        <AddNodeButton hasNodes={hasNodes} onAddNode={onAddNode} />
        <button
          disabled
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-semibold
            opacity-60 cursor-not-allowed
            text-[#444] dark:text-[#bbb]
            bg-[#f0f0f0] dark:bg-[#272727]"
        >
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {deactivating ? "Stopping…" : "Compiling…"}
        </button>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="flex items-center gap-2">
        <StatusPill isGraphDirty={isGraphDirty} />
        <CompilationErrorsButton errors={compilationErrors} />
        <AddNodeButton hasNodes={hasNodes} onAddNode={onAddNode} />
        {isGraphDirty && (
          <button
            type="button"
            onClick={onActivate}
            title="Stop current execution, compile updated graph, and restart"
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-semibold
              transition-colors
              text-[#2da44e] dark:text-[#3fb950]
              bg-[#eafaf0] dark:bg-[#1a2d1e]
              hover:bg-[#d6f5e3] dark:hover:bg-[#213828]"
          >
            <TbRefresh className="w-[14px] h-[14px]" />
            Recompile
          </button>
        )}
        <button
          type="button"
          onClick={onDeactivate}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-semibold
            transition-colors
            text-red-600 dark:text-red-400
            bg-red-50 dark:bg-red-900/20
            hover:bg-red-100 dark:hover:bg-red-900/30"
        >
          <TbPower className="w-[14px] h-[14px]" />
          Turn Off
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <CompilationErrorsButton errors={compilationErrors} />
      <AddNodeButton hasNodes={hasNodes} onAddNode={onAddNode} />
      <button
        type="button"
        onClick={onActivate}
        disabled={!hasNodes}
        title={!hasNodes ? "Add a trigger node first" : "Compile and start the workflow"}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12.5px] font-semibold
          transition-colors
          disabled:opacity-40 disabled:cursor-not-allowed
          text-[#2da44e] dark:text-[#3fb950]
          bg-[#eafaf0] dark:bg-[#1a2d1e]
          hover:bg-[#d6f5e3] dark:hover:bg-[#213828]
          disabled:hover:bg-[#eafaf0] dark:disabled:hover:bg-[#1a2d1e]"
      >
        <TbPower className="w-[14px] h-[14px]" />
        Turn On
      </button>
    </div>
  );
};

// ─── Root header ──────────────────────────────────────────────────────────────

/**
 * FuseStudioHeader
 *
 * Props
 * -----
 * name         {string}       Workflow name (controlled input value)
 * onNameChange {Function}     Called on every keystroke
 * onNameBlur   {Function}     Called on blur — triggers autosave
 * saving       {boolean}      True while the name is being saved
 * hasNodes     {boolean}      True when at least one starter node is on canvas
 * onAddNode    {Function}     Opens the Add Node panel
 * onActivate   {Function}     Compile + start (or recompile if active + dirty)
 * onDeactivate {Function}     Stop the running execution
 * isActive          {boolean}      Whether the workflow is currently active
 * isGraphDirty      {boolean}      Whether the graph changed since last compilation
 * activating        {boolean}      True while an activate (compile) call is in-flight
 * deactivating      {boolean}      True while a deactivate (stop) call is in-flight
 * compilationErrors {string[]}     List of error strings from the last failed compilation
 * webhookUrl        {string|null}  Public webhook URL, or null for schedule workflows
 */
const FuseStudioHeader = ({
  name,
  onNameChange,
  onNameBlur,
  saving = false,
  hasNodes = false,
  onAddNode,
  onActivate,
  onDeactivate,
  isActive = false,
  isGraphDirty = false,
  activating = false,
  deactivating = false,
  compilationErrors = [],
  webhookUrl = null,
}) => (
  <header id="fuse-studio-header" className="w-full flex-shrink-0">
    <div className="h-[56px] w-full flex items-center justify-between gap-2 px-3">
      {/* Left: back + name + webhook URL */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <BackButton />
        <WorkflowNameInput
          value={name}
          onChange={onNameChange}
          onBlur={onNameBlur}
          saving={saving}
        />
        {isActive && webhookUrl && (
          <>
            <span className="w-px h-4 bg-[#e0e0e0] dark:bg-[#2e2e2e] flex-shrink-0 mx-0.5" />
            <WebhookUrlRow url={webhookUrl} />
          </>
        )}
      </div>

      {/* Right: execution controls + profile */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ExecutionControls
          hasNodes={hasNodes}
          isActive={isActive}
          isGraphDirty={isGraphDirty}
          activating={activating}
          deactivating={deactivating}
          compilationErrors={compilationErrors}
          onAddNode={onAddNode}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
        />
        <span className="w-px h-5 bg-[#e0e0e0] dark:bg-[#2e2e2e] rounded-full flex-shrink-0" />
        <HeaderUserProfile />
      </div>
    </div>
  </header>
);

export default FuseStudioHeader;
