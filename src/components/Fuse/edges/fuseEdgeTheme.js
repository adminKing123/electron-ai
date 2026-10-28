import { MarkerType } from "@xyflow/react";

/** Edge stroke tokens — aligned with connected handles (#7c3aed light / #94a3b8 dark). */
export const FUSE_EDGE_THEME = {
  light: {
    stroke: "#8681a0",
    strokeActive: "#7c3aed",
    halo: "#f9f9fc",
  },
  dark: {
    stroke: "#5a6272",
    strokeActive: "#94a3b8",
    halo: "#151a23",
  },
};

export const FUSE_EDGE_PATH = {
  borderRadius: 12,
  /** Offset from handle center so the line clears the node border and output labels. */
  offset: 12,
};

export const fuseEdgeMarker = (color) => ({
  type: MarkerType.ArrowClosed,
  width: 16,
  height: 16,
  color,
});

export const resolveFuseEdgeStroke = (isDark, { selected = false, hovered = false } = {}) => {
  const t = isDark ? FUSE_EDGE_THEME.dark : FUSE_EDGE_THEME.light;
  return selected || hovered ? t.strokeActive : t.stroke;
};

export const fuseEdgeHaloColor = (isDark) =>
  isDark ? FUSE_EDGE_THEME.dark.halo : FUSE_EDGE_THEME.light.halo;
