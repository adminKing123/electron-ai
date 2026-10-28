import React from "react";
import { getNodeIcon, getNodeIconPresentation } from "./iconRegistry";

/** Shared size tokens for node icons across picker, canvas, and config panel. */
export const FUSE_NODE_ICON_SIZES = {
  picker: "w-[20px] h-[20px]",
  pickerLg: "w-[22px] h-[22px]",
  /** Horizontal picker rows (Gemini-style) */
  pickerRow: "w-[26px] h-[26px]",
  canvasSm: "w-[20px] h-[20px]",
  canvas: "w-[24px] h-[24px]",
  canvasLg: "w-[28px] h-[28px]",
  canvasStarter: "w-[32px] h-[32px]",
  config: "w-[24px] h-[24px]",
  /** Integration cards and info modals */
  integration: "w-6 h-6",
};

/**
 * Renders a workflow node icon with brand / semantic colors (no forced blue tint).
 *
 * @param {string | null | undefined} iconName — backend icon key (e.g. "SiGmail")
 * @param {string} [sizeClass] — Tailwind w/h classes
 * @param {string} [className] — extra classes on the SVG
 * @param {string} [fallbackClassName] — placeholder dot when icon is unknown
 */
const FuseNodeIcon = ({
  iconName,
  sizeClass = FUSE_NODE_ICON_SIZES.picker,
  className = "",
  fallbackClassName = "w-3.5 h-3.5 rounded-full bg-ink-200 dark:bg-void-700",
}) => {
  const Icon = getNodeIcon(iconName);
  if (!Icon) {
    return <span className={fallbackClassName} aria-hidden />;
  }

  const { className: colorClass, brandColor } = getNodeIconPresentation(iconName);

  return (
    <Icon
      className={[sizeClass, colorClass, className].filter(Boolean).join(" ")}
      style={brandColor ? { color: brandColor } : undefined}
      aria-hidden
    />
  );
};

export default FuseNodeIcon;
