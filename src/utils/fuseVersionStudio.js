/** React Flow selection/drag flags must not persist into read-only views. */
function stripEphemeralFlowNodeState(nodes) {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node) => {
    if (!node || typeof node !== "object") return node;
    const { selected, dragging, ...rest } = node;
    return rest;
  });
}

/**
 * Build React Flow canvas state from a fuse_versions document.
 * Returns null when the version has no studio snapshot (legacy versions).
 */
function studioGraphFromVersion(version) {
  if (!version) return null;
  const nodes = version.studio_nodes;
  const edges = version.studio_edges;
  const blocks = version.studio_blocks;
  if (!Array.isArray(nodes)) return null;
  return {
    nodes: stripEphemeralFlowNodeState([...(blocks ?? []), ...nodes]),
    edges: edges ?? [],
  };
}

function draftGraphFromWorkflow(wf) {
  return {
    nodes: stripEphemeralFlowNodeState([...(wf.blocks ?? []), ...(wf.nodes ?? [])]),
    edges: wf.edges ?? [],
  };
}

/**
 * Load canvas + workflow name for the read-only version studio route.
 * Always fetches the workflow once (for the title).
 */
export async function loadVersionStudioById(versionId, { getVersionAPI, getWorkflowByIdAPI }) {
  const version = await getVersionAPI(versionId);
  const workflowId = version.workflow_id;
  if (!workflowId) {
    const err = new Error("Version is missing a workflow reference.");
    err.code = "missing_workflow";
    throw err;
  }

  const wf = await getWorkflowByIdAPI(workflowId);
  const workflowName = wf.name ?? "Untitled Workflow";
  const versionCreatedAt = version.created_at ?? null;
  const studio = studioGraphFromVersion(version);

  if (studio) {
    return {
      workflowId,
      workflowName,
      versionCreatedAt,
      usedDraftFallback: false,
      ...studio,
    };
  }

  return {
    workflowId,
    workflowName,
    versionCreatedAt,
    usedDraftFallback: true,
    ...draftGraphFromWorkflow(wf),
  };
}

/**
 * Load canvas for a run detail view: prefer version snapshot, else workflow draft.
 */
export async function loadRunDetailCanvas(
  { versionId, workflowId },
  { getVersionAPI, getWorkflowByIdAPI },
) {
  if (versionId) {
    try {
      const version = await getVersionAPI(versionId);
      const studio = studioGraphFromVersion(version);
      if (studio) {
        const wf = await getWorkflowByIdAPI(workflowId);
        return {
          workflowName: wf.name ?? null,
          nodes: studio.nodes,
          edges: studio.edges,
        };
      }
    } catch {
      /* use workflow draft below */
    }
  }

  const wf = await getWorkflowByIdAPI(workflowId);
  return {
    workflowName: wf.name ?? null,
    ...draftGraphFromWorkflow(wf),
  };
}
