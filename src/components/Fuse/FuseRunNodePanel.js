import React from "react";
import { TbAlertCircle } from "react-icons/tb";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "./FuseNodeIcon";
import useLiveDuration from "../../hooks/useLiveDuration";
import {
  fmtDate,
  fmtDuration,
  JsonBlock,
  NodeStatusIcon,
  RunStatusBadge,
} from "./fuseRunFormatters";

/**
 * Right-hand panel on the run detail page — live node execution info.
 */
export default function FuseRunNodePanel({
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

  if (!selectedNode && !nodeState) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center px-6 ${className}`}
      >
        <p className="text-[14px] font-medium text-[#888] dark:text-[#555]">
          Select a node
        </p>
        <p className="text-[12px] text-[#bbb] dark:text-[#444] mt-1 max-w-[240px]">
          Click a node on the canvas to see live execution details.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-0 overflow-hidden ${className}`}>
      <div className="flex-shrink-0 px-4 py-4 border-b border-[#ebebeb] dark:border-[#232323]">
        <div className="flex items-start gap-3">
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
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
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
    </div>
  );
}

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
