import React, { useState } from "react";
import { useRunLogFieldDisplay } from "../../utils/fuseRunLogOffload";
import {
  TbCircleCheck,
  TbCircleX,
  TbLoader2,
  TbMinus,
  TbChevronDown,
  TbChevronRight,
} from "react-icons/tb";
import FuseJsonViewer from "./FuseJsonViewer";

export function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function fmtDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export const RunStatusBadge = ({ status, large = false }) => {
  const map = {
    success: {
      icon: TbCircleCheck,
      cls: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    },
    failed: {
      icon: TbCircleX,
      cls: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    },
    running: {
      icon: TbLoader2,
      cls: "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      spin: true,
    },
  };
  const { icon: Icon, cls, spin } = map[status] ?? map.failed;
  const sizeIcon = large ? "w-4 h-4" : "w-3 h-3";
  const textSize = large ? "text-[13px]" : "text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border ${textSize} ${cls}`}
    >
      <Icon className={`${sizeIcon} ${spin ? "animate-spin" : ""}`} />
      {status}
    </span>
  );
};

export const NodeStatusIcon = ({ status }) => {
  if (status === "running")
    return <TbLoader2 className="w-[15px] h-[15px] text-blue-500 dark:text-blue-400 flex-shrink-0 animate-spin" />;
  if (status === "success")
    return <TbCircleCheck className="w-[15px] h-[15px] text-green-500 dark:text-green-400 flex-shrink-0" />;
  if (status === "error")
    return <TbCircleX className="w-[15px] h-[15px] text-red-500 dark:text-red-400 flex-shrink-0" />;
  return <TbMinus className="w-[15px] h-[15px] text-[#bbb] dark:text-[#555] flex-shrink-0" />;
};

function isEmptyValue(value) {
  if (value == null) return true;
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.keys(value).length === 0;
  }
  return false;
}

/** Shared run-panel accordion row (inside RunAccordionGroup). */
function RunAccordionSection({
  label,
  badge,
  open,
  onToggle,
  children,
  empty = false,
  emptyMessage = "No data",
}) {
  return (
    <div className="border-b border-[#ebebeb] dark:border-[#2a2a2a] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left
          hover:bg-[#f8f9fa] dark:hover:bg-[#1e1e1e] transition-colors"
      >
        {open ? (
          <TbChevronDown className="w-4 h-4 flex-shrink-0 text-[#888] dark:text-[#666]" />
        ) : (
          <TbChevronRight className="w-4 h-4 flex-shrink-0 text-[#888] dark:text-[#666]" />
        )}
        <span className="text-[12px] font-medium text-[#202124] dark:text-[#e8eaed]">
          {label}
        </span>
        {badge != null && (
          <span className="ml-auto text-[10px] font-mono text-[#9aa0a6] dark:text-[#5f6368]">
            {badge}
          </span>
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-0">
          {empty ? (
            <p className="text-[12px] text-[#9aa0a6] dark:text-[#5f6368] py-1">{emptyMessage}</p>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}

export function RunAccordionGroup({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-[#ebebeb] dark:border-[#2a2a2a]
        bg-[#fafafa] dark:bg-[#171717] overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

const JSON_BODY_CLASS =
  "max-h-[min(280px,38vh)] overflow-y-auto overscroll-y-contain";

function RunLogOffloadBanner({ meta, truncatedInline }) {
  if (!meta && !truncatedInline) return null;
  return (
    <div className="mb-2 text-[11px] text-[#888] dark:text-[#666] space-y-1">
      {meta?.url && (
        <p>
          Full payload is stored on the CDN
          {meta.size_bytes != null
            ? ` (${Number(meta.size_bytes).toLocaleString()} bytes)`
            : ""}
          . Preview is not shown here.{" "}
          <a
            href={meta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1a73e8] dark:text-[#8ab4f8] underline"
          >
            Open file
          </a>
        </p>
      )}
      {truncatedInline && !meta?.url && (
        <p>Preview truncated in the panel. Use Open file when a CDN link is available.</p>
      )}
    </div>
  );
}

export const JsonBlock = ({
  label,
  value,
  showWhenEmpty = false,
  defaultOpen = false,
  grouped = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const { displayValue, offloaded, offloadMeta, truncated } =
    useRunLogFieldDisplay(value);
  const empty = isEmptyValue(value) && !offloaded;
  if (!showWhenEmpty && empty) return null;

  const body = empty ? null : (
    <div className={JSON_BODY_CLASS}>
      <RunLogOffloadBanner meta={offloadMeta} truncatedInline={truncated && !offloaded} />
      {offloaded ? null : <FuseJsonViewer value={displayValue} />}
    </div>
  );

  if (grouped) {
    return (
      <RunAccordionSection
        label={label}
        open={open}
        onToggle={() => setOpen((v) => !v)}
        empty={empty}
      >
        {body}
      </RunAccordionSection>
    );
  }

  return (
    <RunAccordionGroup>
      <RunAccordionSection
        label={label}
        open={open}
        onToggle={() => setOpen((v) => !v)}
        empty={empty}
      >
        {body}
      </RunAccordionSection>
    </RunAccordionGroup>
  );
};

function formatVariableValue(value) {
  if (value == null) return "null";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export const VariablesBlock = ({
  variables,
  showWhenEmpty = true,
  defaultOpen = false,
  grouped = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const { displayValue, offloaded, offloadMeta, truncated } =
    useRunLogFieldDisplay(variables);
  const entries =
    displayValue && typeof displayValue === "object" && !Array.isArray(displayValue)
      ? Object.entries(displayValue)
      : [];
  const empty = entries.length === 0 && !offloaded && !truncated;
  if (!showWhenEmpty && empty) return null;

  const list = (
    <ul
      className={
        empty ? "" : "max-h-[min(280px,38vh)] overflow-y-auto overscroll-y-contain"
      }
    >
      {(offloaded || truncated) && (
        <li className="pb-2">
          <RunLogOffloadBanner meta={offloadMeta} truncatedInline={truncated && !offloaded} />
        </li>
      )}
      {!offloaded && typeof displayValue === "string" && truncated && (
        <li className="py-2 text-[11.5px] font-mono text-[#444] dark:text-[#999] whitespace-pre-wrap break-all">
          {displayValue}
        </li>
      )}
      {!offloaded &&
        typeof displayValue !== "string" &&
        entries.map(([name, val]) => (
          <li
            key={name}
            className="py-2.5 flex flex-col gap-0.5 min-w-0 border-b border-[#ebebeb] dark:border-[#2a2a2a] last:border-b-0"
          >
            <span className="text-[11px] font-mono text-[#1a73e8] dark:text-[#8ab4f8] break-all">
              {name}
            </span>
            <span className="text-[11.5px] font-mono text-[#444] dark:text-[#999] break-all whitespace-pre-wrap">
              {formatVariableValue(val)}
            </span>
          </li>
        ))}
    </ul>
  );

  const section = (
    <RunAccordionSection
      label="Variables"
      badge={empty ? null : entries.length}
      open={open}
      onToggle={() => setOpen((v) => !v)}
      empty={empty}
      emptyMessage="No variables referenced in this node's config."
    >
      {list}
    </RunAccordionSection>
  );

  if (grouped) return section;
  return <RunAccordionGroup>{section}</RunAccordionGroup>;
};
