import React from "react";
import { NodeResizer, NodeToolbar, Position } from "@xyflow/react";
import { TbTrash } from "react-icons/tb";
import useFuseStudioStore from "../../../store/useFuseStudioStore";

// ─── Colour palette ────────────────────────────────────────────────────────────
// All class strings spelled out in full so Tailwind JIT includes them at build.
export const BLOCK_PALETTE = {
  indigo: {
    name: "Indigo",
    idle: "bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-200  dark:border-indigo-800",
    selected:
      "bg-indigo-50/40 dark:bg-indigo-950/40 border-indigo-500  dark:border-indigo-400",
    text: "text-indigo-600 dark:text-indigo-400",
    dot: "#818cf8",
  },
  green: {
    name: "Green",
    idle: "bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
    selected:
      "bg-emerald-50/40 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "#4ade80",
  },
  amber: {
    name: "Amber",
    idle: "bg-amber-50/20 dark:bg-amber-950/20 border-amber-200  dark:border-amber-800",
    selected:
      "bg-amber-50/40 dark:bg-amber-950/40 border-amber-500  dark:border-amber-400",
    text: "text-amber-600 dark:text-amber-400",
    dot: "#fbbf24",
  },
  rose: {
    name: "Rose",
    idle: "bg-rose-50/20 dark:bg-rose-950/20 border-rose-200  dark:border-rose-800",
    selected:
      "bg-rose-50/40 dark:bg-rose-950/40 border-rose-500  dark:border-rose-400",
    text: "text-rose-600 dark:text-rose-400",
    dot: "#fb7185",
  },
  violet: {
    name: "Violet",
    idle: "bg-violet-50/20 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800",
    selected:
      "bg-violet-50/40 dark:bg-violet-950/40 border-violet-500 dark:border-violet-400",
    text: "text-violet-600 dark:text-violet-400",
    dot: "#a78bfa",
  },
  slate: {
    name: "Slate",
    idle: "bg-slate-50/20 dark:bg-slate-900/20 border-slate-300  dark:border-slate-700",
    selected:
      "bg-slate-50/40 dark:bg-slate-900/40 border-slate-500  dark:border-slate-400",
    text: "text-slate-600 dark:text-slate-400",
    dot: "#94a3b8",
  },
};

const DEFAULT_COLOR = "indigo";

/**
 * Resolve a palette key ("indigo") or a raw hex string ("#a1b2c3") into a
 * unified `cc` descriptor used to drive both block body and label styling.
 */
const resolveColor = (colorKey) => {
  const isCustom = typeof colorKey === "string" && colorKey.startsWith("#");
  if (isCustom) {
    return {
      isCustom: true,
      dot: colorKey,
      bodyIdle: {
        backgroundColor: `${colorKey}22`,
        borderColor: `${colorKey}70`,
      },
      bodySelected: { backgroundColor: `${colorKey}40`, borderColor: colorKey },
      textStyle: { color: colorKey },
      textClass: "",
      idleClass: "border-dashed",
      selectedClass: "",
    };
  }
  const p = BLOCK_PALETTE[colorKey] ?? BLOCK_PALETTE[DEFAULT_COLOR];
  return {
    isCustom: false,
    dot: p.dot,
    bodyIdle: {},
    bodySelected: {},
    textStyle: {},
    textClass: p.text,
    idleClass: `${p.idle} border-dashed`,
    selectedClass: p.selected,
  };
};

// ─── BlockNode ─────────────────────────────────────────────────────────────────
/**
 * Purely-visual block overlay sitting behind workflow nodes (zIndex: -1).
 * When selected, shows a floating delete control above the block.
 * Colour accepts a BLOCK_PALETTE key or any #rrggbb hex value.
 */
const BlockNode = ({ id, data, selected }) => {
  const removeBlock = useFuseStudioStore((s) => s.removeBlock);

  const colorKey = data.color ?? DEFAULT_COLOR;
  const cc = resolveColor(colorKey);
  const label = data.label ?? "Block";

  return (
    <>
      {/* ── Resize handles ──────────────────────────────────────────────── */}
      <NodeResizer
        color={cc.dot}
        isVisible={selected}
        minWidth={120}
        minHeight={80}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 2,
          border: "none",
          background: cc.dot,
        }}
      />

      {/* ── Floating toolbar (Figma / Linear style) ─────────────────────── */}
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        align="start"
        offset={10}
      >
        <div
          className="flex"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-0.5 gap-5">
            <button
              type="button"
              title="Delete Block"
              onClick={(e) => {
                e.stopPropagation();
                removeBlock(id);
              }}
              className="w-5 h-5 flex items-center justify-center rounded-md
                text-ink-400 dark:text-ink-550
                hover:text-red-500 dark:hover:text-red-400
                transition-colors duration-150"
            >
              <TbTrash className="w-[13px] h-[13px]" />
            </button>
          </div>
        </div>
      </NodeToolbar>

      <div
        className={[
          "w-full h-full rounded-xl border-2 transition-all",
          selected ? cc.selectedClass : cc.idleClass,
        ].join(" ")}
        style={cc.isCustom ? (selected ? cc.bodySelected : cc.bodyIdle) : {}}
      >
        <div className="flex items-center gap-1.5 px-2.5 pt-2 select-none pointer-events-none">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: cc.dot }}
          />
          <span
            className={`text-[11px] font-semibold leading-tight truncate max-w-[180px] ${cc.textClass}`}
            style={cc.textStyle}
            title={label}
          >
            {label}
          </span>
        </div>
      </div>
    </>
  );
};

export default BlockNode;
