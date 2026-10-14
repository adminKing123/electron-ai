import React, { useState } from "react";
import {
  TbCircleCheck,
  TbCircleX,
  TbLoader2,
  TbMinus,
  TbChevronDown,
  TbChevronRight,
} from "react-icons/tb";

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

export function prettyJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
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

export const JsonBlock = ({ label, value }) => {
  const [open, setOpen] = useState(false);
  if (!value || (typeof value === "object" && Object.keys(value).length === 0)) return null;
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[11.5px] font-medium text-[#888] dark:text-[#555]
          hover:text-[#555] dark:hover:text-[#888] transition-colors"
      >
        {open ? <TbChevronDown className="w-3.5 h-3.5" /> : <TbChevronRight className="w-3.5 h-3.5" />}
        {label}
      </button>
      {open && (
        <pre
          className="mt-2 p-3 rounded-lg text-[11.5px] font-mono leading-relaxed
          bg-[#f7f7f7] dark:bg-[#1a1a1a]
          border border-[#e8e8e8] dark:border-[#2a2a2a]
          text-[#333] dark:text-[#ccc]
          overflow-x-auto whitespace-pre-wrap break-words"
        >
          {prettyJson(value)}
        </pre>
      )}
    </div>
  );
};
