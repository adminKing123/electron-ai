/**
 * Run-detail canvas: which nodes ran and which edges were taken.
 */

/** All nodes currently in-flight (parallel fork branches, etc.). */
export function collectRunningNodeIds(nodeStates, activeNodeIds = null) {
  const ids = new Set();
  if (Array.isArray(activeNodeIds)) {
    activeNodeIds.forEach((id) => {
      if (id) ids.add(id);
    });
  }
  for (const [id, st] of Object.entries(nodeStates ?? {})) {
    if (st?.status === "running") ids.add(id);
  }
  return ids;
}

export function nodeHasRunActivity(nodeId, nodeStates, runningNodeIds) {
  if (!nodeId) return false;
  if (runningNodeIds?.has?.(nodeId)) return true;
  const st = nodeStates?.[nodeId];
  if (st?.status === "running") return true;
  return Boolean(st);
}

export function runVisualsActive(nodeStates, runningNodeIds) {
  if (runningNodeIds?.size > 0) return true;
  return Object.keys(nodeStates ?? {}).length > 0;
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
export function isRunEdgeTraversed(edge, nodeStates, runningNodeIds, nodeById) {
  const { source, target } = edge;
  if (!nodeHasRunActivity(target, nodeStates, runningNodeIds)) return false;

  const sourceState = nodeStates?.[source];
  const sourceRunning =
    runningNodeIds?.has(source) || sourceState?.status === "running";
  const targetRunning =
    runningNodeIds?.has(target) || nodeStates?.[target]?.status === "running";

  const sourceNode = nodeById?.[source];

  if (sourceRunning) {
    if (targetRunning) return true;
    if (
      sourceNode?.data?.nodeType === "for_each" &&
      edge.sourceHandle === "item" &&
      nodeHasRunActivity(target, nodeStates, runningNodeIds)
    ) {
      return true;
    }
    return false;
  }

  if (!sourceState && !sourceRunning) return false;

  if (!sourceAllowsEdge(edge, sourceNode, sourceState)) return false;

  return nodeHasRunActivity(target, nodeStates, runningNodeIds);
}

export function buildNodeLookup(nodes) {
  const map = Object.create(null);
  for (const n of nodes ?? []) {
    map[n.id] = n;
  }
  return map;
}
