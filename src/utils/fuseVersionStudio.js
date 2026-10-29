/**
 * Build React Flow canvas state from a fuse_versions document.
 * Returns null when the version has no studio snapshot (legacy versions).
 */
export function studioGraphFromVersion(version) {
  if (!version) return null;
  const nodes = version.studio_nodes;
  const edges = version.studio_edges;
  const blocks = version.studio_blocks;
  if (!Array.isArray(nodes)) return null;
  return {
    nodes: [...(blocks ?? []), ...nodes],
    edges: edges ?? [],
  };
}
