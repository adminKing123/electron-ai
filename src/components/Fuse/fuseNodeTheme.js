/**
 * Neutral Fuse node surfaces — color comes from icons, not card fills.
 * Row metrics match picker grid column at md panel (550px - padding - gap) � 2.
 */
export const FUSE_NODE_SURFACE = "bg-white dark:bg-void-825";
export const FUSE_NODE_BORDER = "border-ink-200 dark:border-void-725";
export const FUSE_NODE_BORDER_HOVER =
  "hover:border-ink-300 dark:hover:border-void-650";
export const FUSE_NODE_BORDER_SELECTED =
  "border-brand-600 dark:border-brand-400 ring-2 ring-brand-600/15 dark:ring-brand-400/20";
export const FUSE_NODE_ICON_WELL = "bg-ink-50 dark:bg-void-775";
export const FUSE_NODE_LABEL = "text-ink-875 dark:text-ink-100";
export const FUSE_NODE_LABEL_MUTED = "text-ink-600 dark:text-ink-450";
export const FUSE_NODE_HANDLE =
  "!border-ink-200 dark:!border-void-725 !bg-white dark:!bg-void-825";
export const FUSE_NODE_HANDLE_CONNECTED =
  "!border-brand-600 dark:!border-brand-400 !bg-brand-50 dark:!bg-brand-800/35";

export const FUSE_PICKER_ROW =
  "bg-ink-50 dark:bg-void-775 hover:bg-ink-100 dark:hover:bg-void-750 active:bg-ink-150 dark:active:bg-void-725";

/** Studio canvas nodes — white card on #f9f9fc canvas (picker keeps FUSE_PICKER_ROW). */
export const FUSE_CANVAS_NODE_SURFACE =
  "bg-white dark:bg-void-775 border border-ink-200 dark:border-void-725 hover:border-ink-300 dark:hover:border-void-650 shadow-[0_1px_2px_rgba(60,64,67,0.1)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35)]";

/** n8n-style caption under the icon tile. */
export const FUSE_CANVAS_LABEL_CLASS =
  "text-[13px] font-medium leading-snug tracking-tight";

/** Icon tile on canvas (96�96 — n8n DEFAULT_NODE_SIZE). */
export const FUSE_CANVAS_NODE_BOX =
  "w-[96px] h-[96px] min-w-[96px] min-h-[96px] box-border";

/** Trigger/starter nodes — rounded left "pill" (n8n --trigger-node--radius). */
export const FUSE_CANVAS_TRIGGER_SHAPE =
  "rounded-l-[36px] rounded-r-xl";

export const FUSE_CANVAS_DEFAULT_SHAPE = "rounded-xl";

/** One picker grid column width (keep in sync with NodeConfigPanel md:max-w-[550px] 2-col grid). */
export const FUSE_NODE_ROW_WIDTH =
  "w-[255px] min-w-[255px] max-w-[255px] shrink-0";

/** Shared row layout — picker tiles and studio nodes must use these together. */
export const FUSE_NODE_ROW_SHELL =
  "flex flex-row items-center gap-3 h-[52px] min-h-[52px] px-3.5 py-2.5 rounded-2xl box-border";

export const FUSE_NODE_ROW_ICON_SLOT =
  "flex-shrink-0 w-8 h-8 flex items-center justify-center";

export const FUSE_NODE_ROW_LABEL =
  "text-left text-[15px] font-medium leading-[1.25] truncate min-w-0 flex-1";

/** Picker panel tile (full width of grid cell). */
export const fusePickerCardClass =
  `${FUSE_NODE_ROW_SHELL} ${FUSE_PICKER_ROW} w-full text-left justify-start transition-colors duration-150 cursor-grab active:cursor-grabbing select-none`;

/** Run-detail canvas: color + border highlight (no status icons). */
export const fuseCanvasRunStatusClass = (runStatus) => {
  switch (runStatus) {
    case "running":
      return [
        "border",
        "bg-brand-50/95 dark:bg-brand-950/45",
        "border-brand-500 dark:border-brand-400",
        "ring-[3px] ring-brand-500/40 dark:ring-brand-400/35",
        "fuse-canvas-node-running",
        "relative overflow-visible",
      ].join(" ");
    case "success":
      return [
        "border",
        "bg-emerald-50 dark:bg-emerald-950/50",
        "border-emerald-500 dark:border-emerald-400",
        "ring-2 ring-emerald-500/35 dark:ring-emerald-400/30",
        "fuse-canvas-node-success",
      ].join(" ");
    case "error":
      return [
        "border",
        "bg-red-50 dark:bg-red-950/50",
        "border-red-500 dark:border-red-400",
        "ring-2 ring-red-500/35 dark:ring-red-400/30",
        "fuse-canvas-node-error",
      ].join(" ");
    case "skipped":
      return [
        "border",
        "bg-ink-50/95 dark:bg-void-800/85",
        "border-ink-350 dark:border-void-650",
        "opacity-90",
        "ring-1 ring-ink-200/80 dark:ring-void-700/55",
        "fuse-canvas-node-skipped",
      ].join(" ");
    default:
      return "";
  }
};

/** Studio canvas row — same size/type as picker; optional selection + run-status ring. */
export const fuseCanvasNodeShellClass = (selected, runStatus) => {
  const parts = [
    runStatus ? fuseCanvasRunStatusClass(runStatus) : FUSE_CANVAS_NODE_SURFACE,
    "transition-[box-shadow,ring-color,background-color,border-color] duration-200",
  ];

  if (selected && runStatus !== "running") {
    parts.push("ring-2 ring-brand-600/25 dark:ring-brand-400/30");
  }

  return parts.filter(Boolean).join(" ");
};

/** n8n-style icon tile shell (96�96) with optional trigger shape. */
export const fuseCanvasNodeBoxClass = (
  selected,
  runStatus,
  isStarter,
  { dynamicSize = false } = {},
) => {
  const parts = [
    dynamicSize ? "min-w-[96px] min-h-[96px] box-border" : FUSE_CANVAS_NODE_BOX,
    runStatus ? fuseCanvasRunStatusClass(runStatus) : FUSE_CANVAS_NODE_SURFACE,
    isStarter ? FUSE_CANVAS_TRIGGER_SHAPE : FUSE_CANVAS_DEFAULT_SHAPE,
    "transition-[box-shadow,border-color,background-color] duration-150 overflow-visible relative",
  ];

  if (selected && runStatus !== "running") {
    parts.push(
      "ring-2 ring-brand-600/30 dark:ring-brand-400/35 border-brand-500/40 dark:border-brand-400/45",
    );
  }

  return parts.filter(Boolean).join(" ");
};

export const fuseCanvasNodeRowClass = (selected, runStatus) =>
  [
    FUSE_NODE_ROW_SHELL,
    FUSE_NODE_ROW_WIDTH,
    fuseCanvasNodeShellClass(selected, runStatus),
    "select-none cursor-pointer",
  ]
    .filter(Boolean)
    .join(" ");

/** Inner header row inside branch nodes (no extra height/padding vs picker). */
export const FUSE_NODE_ROW_INNER =
  "flex flex-row items-center gap-3 h-[52px] min-h-[52px] px-3.5 py-2.5 w-full box-border relative";

export const fuseNodeBorderClass = (selected) =>
  selected ? FUSE_NODE_BORDER_SELECTED : `${FUSE_NODE_BORDER} ${FUSE_NODE_BORDER_HOVER}`;
