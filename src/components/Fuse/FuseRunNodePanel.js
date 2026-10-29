import React from "react";
import { TbAlertCircle } from "react-icons/tb";
import FuseRunNodeGalaxySpinner from "./FuseRunNodeGalaxySpinner";
import { BasicLoader } from "../Loaders";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "./FuseNodeIcon";
import useLiveDuration from "../../hooks/useLiveDuration";
import {
  fmtDate,
  fmtDuration,
  JsonBlock,
  RunAccordionGroup,
  RunStatusBadge,
  VariablesBlock,
} from "./fuseRunFormatters";
import { resolveVariablesFromConfig } from "../../utils/fuseRunNodeInspect";
import { fuseRunLogSaveEnabled } from "../../utils/fuseNodeConfig";
import { FuseVersionIdButton } from "./fuseListingTable";

function Metric({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        highlight
          ? "border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10"
          : "border-ink-100 dark:border-void-850 bg-white dark:bg-void-850"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-550">
        {label}
      </p>
      <p className="text-[14px] font-semibold font-mono text-ink-975 dark:text-ink-150 mt-0.5">
        {value}
      </p>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-[12px] text-ink-400 dark:text-ink-550 min-w-[88px] flex-shrink-0">
        {label}
      </span>
      <span className="text-[12px] font-mono text-ink-700 dark:text-ink-450 break-all">
        {value}
      </span>
    </div>
  );
}

/** Default panel: whole-workflow run summary (no node selected). */
function FuseRunOverview({ run, workflowName, className = "" }) {
  const runDuration = useLiveDuration(
    run?.started_at,
    run?.status === "running",
    run?.duration_ms
  );

  if (!run) {
    return (
      <div
        className={`flex items-center justify-center min-h-[120px] text-ink-400 dark:text-ink-600 ${className}`}
      >
        <BasicLoader />
      </div>
    );
  }

  return (
    <div className="min-h-0 flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-550">
          Workflow run
        </p>
        <div className="mt-2">
          <RunStatusBadge status={run.status} large />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="Total duration"
          value={fmtDuration(runDuration)}
          highlight={run.status === "running"}
        />
        <Metric label="Nodes ran" value={run.node_count ?? 0} />
        <Metric label="Succeeded" value={run.nodes_succeeded ?? 0} />
        <Metric label="Failed" value={run.nodes_failed ?? 0} />
      </div>

      <div className="rounded-xl border border-ink-100 dark:border-void-850 bg-white dark:bg-void-850 px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-550 mb-2">
          Run info
        </p>
        <MetaRow label="Started" value={fmtDate(run.started_at)} />
        <MetaRow label="Finished" value={fmtDate(run.finished_at)} />
        <MetaRow label="Trigger" value={run.trigger_type ?? "—"} />
        <div className="flex items-start gap-2 py-1.5">
          <span className="text-[12px] text-ink-400 dark:text-ink-550 min-w-[88px] flex-shrink-0">
            Version
          </span>
          <FuseVersionIdButton versionId={run.version_id} className="text-[12px]" />
        </div>
        <MetaRow label="Run ID" value={run.run_id ?? "—"} />
        <MetaRow
          label="Workflow"
          value={
            workflowName
              ? `${workflowName} (${run.workflow_id ?? "—"})`
              : (run.workflow_id ?? "—")
          }
        />
      </div>

      <JsonBlock label="Trigger data" value={run.trigger_data} />

      {run.error && (
        <div
          className="flex items-start gap-2 p-3 rounded-lg
          bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800"
        >
          <TbAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-red-600 dark:text-red-400 break-words">{run.error}</p>
        </div>
      )}

      <p className="text-[11px] text-ink-450 dark:text-ink-600 pb-1">
        Select a node on the canvas to see step-level details.
      </p>
    </div>
  );
}

function RunLogFieldSkipped({ label, saveKey }) {
  return (
    <div className="px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-550 mb-1">
        {label}
      </p>
      <p className="text-[12px] text-ink-500 dark:text-ink-600">
        {label} was not saved for this step (enable {saveKey} under Run history on this node).
      </p>
    </div>
  );
}

function FuseRunNodeDetail({
  selectedNode,
  nodeState,
  nodeStates,
  isActiveNode,
  run,
}) {
  const label = nodeState?.node_label ?? selectedNode?.data?.label ?? "Node";
  const nodeType = nodeState?.node_type ?? selectedNode?.data?.nodeType ?? "—";
  const iconName = selectedNode?.data?.icon ?? null;
  const status = isActiveNode ? "running" : nodeState?.status ?? null;

  const liveDuration = useLiveDuration(
    nodeState?.started_at,
    status === "running",
    nodeState?.duration_ms
  );

  const runDuration = useLiveDuration(
    run?.started_at,
    run?.status === "running",
    run?.duration_ms
  );

  const settingsConfig = selectedNode?.data?.config ?? null;

  const nodeConfig = fuseRunLogSaveEnabled(settingsConfig, "save_config")
    ? nodeState?.config ?? settingsConfig
    : nodeState?.config ?? null;

  const variablesValue = fuseRunLogSaveEnabled(settingsConfig, "save_variables")
    ? nodeState?.variables ??
      (nodeConfig && nodeStates
        ? resolveVariablesFromConfig(nodeConfig, nodeStates)
        : null)
    : nodeState?.variables ?? null;

  const inputValue = fuseRunLogSaveEnabled(settingsConfig, "save_input")
    ? nodeState?.input ?? null
    : null;

  return (
    <div className="min-h-0 flex flex-col gap-4">
      <div className="flex items-start gap-3 pb-4 border-b border-ink-100 dark:border-void-850">
        <span className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-ink-50 dark:bg-void-775">
          <FuseNodeIcon iconName={iconName} sizeClass={FUSE_NODE_ICON_SIZES.pickerRow} />
          {status === "running" && (
            <FuseRunNodeGalaxySpinner className="top-0 right-0" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-ink-975 dark:text-ink-100 truncate">
            {label}
          </p>
          <p className="text-[11px] font-mono text-ink-400 dark:text-ink-550 truncate mt-0.5">
            {nodeType}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {status && status !== "running" && <RunStatusBadge status={status} />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Node duration" value={fmtDuration(liveDuration)} highlight={status === "running"} />
        <Metric label="Run duration" value={fmtDuration(runDuration)} highlight={run?.status === "running"} />
        <Metric label="Started" value={fmtDate(nodeState?.started_at)} />
        <Metric label="Finished" value={fmtDate(nodeState?.finished_at)} />
      </div>

      {nodeState?.status === "error" && nodeState?.error && (
        <div
          className="flex items-start gap-2 p-3 rounded-lg
          bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800"
        >
          <TbAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            {nodeState.error_type && (
              <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 mb-0.5">
                {nodeState.error_type}
              </p>
            )}
            <p className="text-[12px] text-red-600 dark:text-red-400 font-mono break-words">
              {nodeState.error}
            </p>
          </div>
        </div>
      )}

      <RunAccordionGroup>
        {!fuseRunLogSaveEnabled(settingsConfig, "save_variables") &&
        variablesValue == null ? (
          <RunLogFieldSkipped label="Variables" saveKey="Variables" />
        ) : (
          <VariablesBlock variables={variablesValue} grouped />
        )}
        {!fuseRunLogSaveEnabled(settingsConfig, "save_input") && inputValue == null ? (
          <RunLogFieldSkipped label="Input" saveKey="Input" />
        ) : (
          <JsonBlock label="Input" value={inputValue} grouped />
        )}
        {!fuseRunLogSaveEnabled(settingsConfig, "save_config") && nodeConfig == null ? (
          <RunLogFieldSkipped label="Config" saveKey="Config" />
        ) : (
          <JsonBlock label="Config" value={nodeConfig} showWhenEmpty grouped />
        )}
        {!fuseRunLogSaveEnabled(settingsConfig, "save_output") &&
        nodeState?.output == null ? (
          <RunLogFieldSkipped label="Output" saveKey="Output" />
        ) : (
          <JsonBlock label="Output" value={nodeState?.output} grouped />
        )}
        {run?.trigger_data && selectedNode?.data?.isStarter && (
          <JsonBlock label="Trigger data" value={run.trigger_data} grouped />
        )}
      </RunAccordionGroup>
    </div>
  );
}

function FuseRunPanelScroll({ children, className = "" }) {
  return (
    <div
      className={`flex flex-col flex-1 min-h-0 h-full overflow-hidden ${className}`}
    >
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 py-4
          [scrollbar-gutter:stable]"
      >
        <div className="flex flex-col gap-4 pb-2">{children}</div>
      </div>
    </div>
  );
}

/**
 * Right-hand panel on the run detail page — run overview or live node execution info.
 */
export default function FuseRunNodePanel(props) {
  const { className = "", ...rest } = props;
  return (
    <FuseRunPanelScroll className={className}>
      {!rest.selectedNode ? (
        <FuseRunOverview run={rest.run} workflowName={rest.workflowName} />
      ) : (
        <FuseRunNodeDetail {...rest} />
      )}
    </FuseRunPanelScroll>
  );
}
