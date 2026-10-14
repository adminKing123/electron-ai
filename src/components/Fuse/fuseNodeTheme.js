/**
 * Neutral Fuse node surfaces — color comes from icons, not card fills.
 * Light/dark values aligned with Google Workspace–style grays.
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

/** Picker rows, search field, and studio canvas node body */
export const FUSE_PICKER_ROW =
  "bg-[#f1f3f4] dark:bg-[#2d2e30] hover:bg-[#e8eaed] dark:hover:bg-[#35363a] active:bg-[#e0e3e7] dark:active:bg-[#3c4043]";

/** Layout shared by picker and studio (background applied separately). */
export const FUSE_STUDIO_ROW =
  "flex flex-row items-center gap-3 min-h-[52px] px-3.5 py-2.5 rounded-2xl";

/** Studio / picker row surface — matches picker; ring when selected on canvas. */
export const fuseStudioRowClass = (selected, { interactive = true } = {}) =>
  [
    FUSE_STUDIO_ROW,
    FUSE_PICKER_ROW,
    interactive ? "select-none cursor-pointer transition-colors duration-150" : "",
    selected ? "ring-2 ring-[#1a73e8]/20 dark:ring-[#8ab4f8]/25" : "",
  ]
    .filter(Boolean)
    .join(" ");

export const fuseNodeBorderClass = (selected) =>
  selected ? FUSE_NODE_BORDER_SELECTED : `${FUSE_NODE_BORDER} ${FUSE_NODE_BORDER_HOVER}`;
