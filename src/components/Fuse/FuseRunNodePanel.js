import React from "react";
import { TbAlertCircle } from "react-icons/tb";
import { BasicLoader } from "../Loaders";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "./FuseNodeIcon";
import useLiveDuration from "../../hooks/useLiveDuration";
import {
  fmtDate,
  fmtDuration,
  JsonBlock,
  NodeStatusIcon,
  RunStatusBadge,
} from "./fuseRunFormatters";

function Metric({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        highlight
          ? "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10"
          : "border-[#ebebeb] dark:border-[#232323] bg-white dark:bg-[#171717]"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#aaa] dark:text-[#555]">
        {label}
      </p>
      <p className="text-[14px] font-semibold font-mono text-[#111] dark:text-[#e0e0e0] mt-0.5">
        {value}
      </p>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-[11.5px] text-[#aaa] dark:text-[#555] min-w-[88px] flex-shrink-0">
        {label}
      </span>
      <span className="text-[11.5px] font-mono text-[#444] dark:text-[#999] break-all">
        {value}
      </span>
    </div>
  );
}

/** Default panel: whole-workflow run summary (no node selected). */
function FuseRunOverview({ run, className = "" }) {
  const runDuration = useLiveDuration(
    run?.started_at,
    run?.status === "running",
    run?.duration_ms
  );

  if (!run) {
    return (
      <div
        className={`flex items-center justify-center min-h-[120px] text-[#c0c0c0] dark:text-[#3a3a3a] ${className}`}
      >
        <BasicLoader />
      </div>
    );
  }

  return (
    <div className={`min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4 ${className}`}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#aaa] dark:text-[#555]">
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

      <div className="rounded-xl border border-[#ebebeb] dark:border-[#232323] bg-white dark:bg-[#171717] px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#aaa] dark:text-[#555] mb-2">
          Run info
        </p>
        <MetaRow label="Started" value={fmtDate(run.started_at)} />
        <MetaRow label="Finished" value={fmtDate(run.finished_at)} />
        <MetaRow label="Trigger" value={run.trigger_type ?? "—"} />
        <MetaRow label="Version" value={run.version_id ?? "—"} />
        <MetaRow label="Run ID" value={run.run_id ?? "—"} />
        <MetaRow label="Workflow" value={run.workflow_id ?? "—"} />
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

      <p className="text-[11px] text-[#bbb] dark:text-[#444] pb-1">
        Select a node on the canvas to see step-level details.
      </p>
    </div>
  );
}

function FuseRunNodeDetail({
  className = "",
  selectedNode,
  nodeState,
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

  return (
    <div className={`min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4 ${className}`}>
      <div className="flex items-start gap-3 pb-4 border-b border-[#ebebeb] dark:border-[#232323]">
        <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#f1f3f4] dark:bg-[#2d2e30]">
          <FuseNodeIcon iconName={iconName} sizeClass={FUSE_NODE_ICON_SIZES.pickerRow} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[#111] dark:text-[#e8eaed] truncate">
            {label}
          </p>
          <p className="text-[11px] font-mono text-[#aaa] dark:text-[#555] truncate mt-0.5">
            {nodeType}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {status && (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#666] dark:text-[#999]">
                <NodeStatusIcon status={status} />
                {status}
              </span>
            )}
            {run && <RunStatusBadge status={run.status} />}
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

      <JsonBlock label="Output" value={nodeState?.output} />

      {run?.trigger_data && selectedNode?.data?.isStarter && (
        <JsonBlock label="Trigger data" value={run.trigger_data} />
      )}
    </div>
  );
}

/**
 * Right-hand panel on the run detail page — run overview or live node execution info.
 */
export default function FuseRunNodePanel(props) {
  if (!props.selectedNode) {
    return <FuseRunOverview run={props.run} className={props.className} />;
  }
  return <FuseRunNodeDetail {...props} />;
}
