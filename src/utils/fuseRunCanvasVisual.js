/**
 * Run-detail canvas: which nodes ran and which edges were taken.
 */

export function nodeHasRunActivity(nodeId, nodeStates, activeNodeId) {
  if (!nodeId) return false;
  if (nodeId === activeNodeId) return true;
  return Boolean(nodeStates?.[nodeId]);
}

export function runVisualsActive(nodeStates, activeNodeId) {
  return Boolean(activeNodeId) || Object.keys(nodeStates ?? {}).length > 0;
}

function parseOutput(output) {
  if (output == null) return null;
  if (typeof output === "object") return output;
  if (typeof output === "string") {
    try {
      return JSON.parse(output);
    } catch {
      return null;
    }
  }
  return null;
}

function sourceAllowsEdge(edge, sourceNode, sourceState) {
  const nodeType = sourceNode?.data?.nodeType;
  const handle = edge.sourceHandle ?? null;

  if (nodeType === "if_else") {
    if (!sourceState || sourceState.status === "running") return false;
    const out = parseOutput(sourceState.output);
    if (typeof out?.result !== "boolean") return true;
    const taken = out.result ? "true" : "false";
    return handle === taken;
  }

  if (nodeType === "switch") {
    if (!sourceState || sourceState.status === "running") return false;
    const out = parseOutput(sourceState.output);
    const taken = out?.matched_handle ?? "default";
    return handle === taken;
  }

  if (nodeType === "for_each") {
    if (handle === "done") {
      return Boolean(sourceState && sourceState.status !== "running");
    }
    if (handle === "item") {
      return true;
    }
  }

  return true;
}

/**
 * Edge was on the execution path (source finished or is running into target).
 */
export function isRunEdgeTraversed(edge, nodeStates, activeNodeId, nodeById) {
  const { source, target } = edge;
  if (!nodeHasRunActivity(target, nodeStates, activeNodeId)) return false;

  const sourceState = nodeStates?.[source];
  const sourceIsActive = source === activeNodeId;
  const sourceRunning =
    sourceIsActive || sourceState?.status === "running";

  const sourceNode = nodeById?.[source];

  if (sourceRunning) {
    if (target === activeNodeId) return true;
    if (
      sourceNode?.data?.nodeType === "for_each" &&
      edge.sourceHandle === "item" &&
      nodeHasRunActivity(target, nodeStates, activeNodeId)
    ) {
      return true;
    }
    return false;
  }

  if (!sourceState && !sourceIsActive) return false;

  if (!sourceAllowsEdge(edge, sourceNode, sourceState)) return false;

  return nodeHasRunActivity(target, nodeStates, activeNodeId);
}

export function buildNodeLookup(nodes) {
  const map = Object.create(null);
  for (const n of nodes ?? []) {
    map[n.id] = n;
  }
  return map;
}
