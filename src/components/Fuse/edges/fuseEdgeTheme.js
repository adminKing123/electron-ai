import { MarkerType } from "@xyflow/react";

/** Edge stroke tokens — aligned with connected handles (#1a73e8 / #8ab4f8). */
export const FUSE_EDGE_THEME = {
  light: {
    stroke: "#80868b",
    strokeActive: "#1a73e8",
    halo: "#f7f7f7",
  },
  dark: {
    stroke: "#9aa0a6",
    strokeActive: "#8ab4f8",
    halo: "#1a1a1a",
  },
};

export const FUSE_EDGE_PATH = {
  borderRadius: 12,
  /** Offset from handle center so the line clears the node border. */
  offset: 2,
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
