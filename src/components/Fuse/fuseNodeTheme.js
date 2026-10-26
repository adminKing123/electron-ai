/**
 * Neutral Fuse node surfaces — color comes from icons, not card fills.
 * Row metrics match picker grid column at md panel (550px − padding − gap) ÷ 2.
 */
export const FUSE_NODE_SURFACE = "bg-white dark:bg-[#1e1e1e]";
export const FUSE_NODE_BORDER = "border-[#dadce0] dark:border-[#3c4043]";
export const FUSE_NODE_BORDER_HOVER =
  "hover:border-[#bdc1c6] dark:hover:border-[#5f6368]";
export const FUSE_NODE_BORDER_SELECTED =
  "border-[#1a73e8] dark:border-[#8ab4f8] ring-2 ring-[#1a73e8]/15 dark:ring-[#8ab4f8]/20";
export const FUSE_NODE_ICON_WELL = "bg-[#f1f3f4] dark:bg-[#2d2e30]";
export const FUSE_NODE_LABEL = "text-[#202124] dark:text-[#e8eaed]";
export const FUSE_NODE_LABEL_MUTED = "text-[#5f6368] dark:text-[#9aa0a6]";
export const FUSE_NODE_HANDLE =
  "!border-[#dadce0] dark:!border-[#3c4043] !bg-white dark:!bg-[#1e1e1e]";
export const FUSE_NODE_HANDLE_CONNECTED =
  "!border-[#1a73e8] dark:!border-[#8ab4f8] !bg-[#e8f0fe] dark:!bg-[#174ea6]/35";

export const FUSE_PICKER_ROW =
  "bg-[#f1f3f4] dark:bg-[#2d2e30] hover:bg-[#e8eaed] dark:hover:bg-[#35363a] active:bg-[#e0e3e7] dark:active:bg-[#3c4043]";

/** Studio canvas nodes — white card on #f7f7f7 canvas (picker keeps FUSE_PICKER_ROW). */
export const FUSE_CANVAS_NODE_SURFACE =
  "bg-white dark:bg-[#2d2e30] border border-[#dadce0] dark:border-[#3c4043] hover:border-[#bdc1c6] dark:hover:border-[#5f6368] shadow-[0_1px_2px_rgba(60,64,67,0.1)] dark:shadow-none";

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

const RUN_STATUS_RING = {
  running:
    "ring-[3px] ring-[#1a73e8] dark:ring-[#8ab4f8] shadow-[0_0_0_4px_rgba(26,115,232,0.22)] dark:shadow-[0_0_0_4px_rgba(138,180,248,0.18)]",
  success: "ring-2 ring-green-500/45 dark:ring-green-400/40",
  error: "ring-2 ring-red-500/50 dark:ring-red-400/45",
  skipped: "ring-2 ring-[#dadce0]/80 dark:ring-[#5f6368]/50",
};

/** Studio canvas row — same size/type as picker; optional selection + run-status ring. */
export const fuseCanvasNodeShellClass = (selected, runStatus) => {
  const parts = [
    FUSE_CANVAS_NODE_SURFACE,
    "transition-[box-shadow,ring-color] duration-200",
  ];

  if (runStatus === "running") {
    parts.push(
      RUN_STATUS_RING.running,
      "fuse-run-node-shell-running",
      "relative overflow-visible",
    );
  } else if (runStatus && RUN_STATUS_RING[runStatus]) {
    parts.push(RUN_STATUS_RING[runStatus]);
  }

  if (selected && runStatus !== "running") {
    parts.push("ring-2 ring-[#1a73e8]/25 dark:ring-[#8ab4f8]/30");
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
