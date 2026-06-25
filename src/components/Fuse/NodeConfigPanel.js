import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  TbLayoutGrid,
  TbTrash,
  TbX,
  TbSearch,
  TbCopy,
  TbCheck,
  TbBell,
  TbBellOff,
} from "react-icons/tb";
import useFuseStudioStore from "../../store/useFuseStudioStore";
import { getNodeIcon } from "./iconRegistry";
import FormBuilder from "./FormBuilder";
import CONFIG from "../../config";
import usePushNotification from "../../hooks/usePushNotification";
import NotificationSettings from "./NotificationSettings";
import { createFuseNodeId, getDisplayFuseNodeId } from "../../utils/helpers";

const StarterNodeCard = ({ node, onPick }) => {
  const Icon = getNodeIcon(node.icon);

  const handleDragStart = (e) => {
    // Tag the payload as a starter node so WorkflowCanvas sets isStarter correctly.
    e.dataTransfer.setData(
      "application/fuse-node",
      JSON.stringify({ ...node, isStarter: true }),
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <button
      type="button"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onPick(node)}
      className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-left w-full
        bg-white dark:bg-[#1c1c1c]
        border border-[#e8e8e8] dark:border-[#272727]
        hover:bg-[#f5f7ff] dark:hover:bg-[#202030]
        hover:border-[#c7cfe8] dark:hover:border-[#363660]
        transition-colors cursor-grab active:cursor-grabbing"
    >
      <span
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full
        bg-[#eef0fb] dark:bg-[#252540]"
      >
        {Icon ? (
          <Icon className="w-[15px] h-[15px] text-[#4a6cf7] dark:text-[#6b8aff]" />
        ) : (
          <span className="w-3.5 h-3.5 rounded-full bg-[#c0c8e8] dark:bg-[#444]" />
        )}
      </span>
      <span className="text-[12.5px] font-medium leading-snug text-[#222] dark:text-[#d8d8d8]">
        {node.label}
      </span>
    </button>
  );
};

const StarterPanel = () => {
  const starterNodes = useFuseStudioStore((s) => s.starterNodes);
  const loadingNodes = useFuseStudioStore((s) => s.loadingNodes);
  const addFlowNode = useFuseStudioStore((s) => s.addFlowNode);
  const selectNode = useFuseStudioStore((s) => s.selectNode);

  const handlePick = (node) => {
    // Build a React Flow-compatible node so WorkflowCanvas can render it immediately.
    const flowNode = {
      id: `${createFuseNodeId()}`,
      type: "fuse_node",
      position: { x: 250, y: 100 },
      data: {
        nodeType: node.type,
        label: node.label,
        icon: node.icon ?? null,
        config: {},
        // Mark as the workflow trigger so WorkflowCanvas and the store can
        // enforce the single-outgoing-edge rule.
        isStarter: true,
      },
    };
    addFlowNode(flowNode);
    selectNode(flowNode);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className="flex items-center gap-2 px-5 pt-4 pb-3.5
        border-b border-[#ebebeb] dark:border-[#252525] flex-shrink-0"
      >
        <TbLayoutGrid className="w-[18px] h-[18px] text-[#888] dark:text-[#555]" />
        <span className="text-[13px] font-semibold text-[#444] dark:text-[#bbb]">
          Choose a starter
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        {loadingNodes ? (
          <div className="grid grid-cols-2 gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-12 rounded-xl bg-[#f0f0f0] dark:bg-[#1e1e1e] animate-pulse"
              />
            ))}
          </div>
        ) : starterNodes.length === 0 ? (
          <p className="text-center text-[12px] text-[#bbb] dark:text-[#444] select-none">
            No starter nodes available
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {starterNodes.map((node) => (
              <StarterNodeCard
                key={node.type}
                node={node}
                onPick={handlePick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ActionNodeCard ────────────────────────────────────────────────────────────
// Draggable card displayed inside the 2-column section grid of AddNodePanel.
// Supports both drag-and-drop onto the canvas and a single click to add at a
// default position (same UX as StarterNodeCard).
const ActionNodeCard = ({ node, onPick }) => {
  const Icon = getNodeIcon(node.icon);

  const handleDragStart = (e) => {
    e.dataTransfer.setData("application/fuse-node", JSON.stringify(node));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onPick(node)}
      title={node.description ?? node.label}
      className="flex items-center gap-2 px-3 py-3 rounded-xl
        cursor-grab active:cursor-grabbing
        bg-white dark:bg-[#1c1c1c]
        border border-[#e8e8e8] dark:border-[#272727]
        hover:bg-[#f5f7ff] dark:hover:bg-[#202030]
        hover:border-[#c7cfe8] dark:hover:border-[#363660]
        transition-colors select-none"
    >
      <span
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full
        bg-[#eef0fb] dark:bg-[#252540]"
      >
        {Icon ? (
          <Icon className="w-[15px] h-[15px] text-[#4a6cf7] dark:text-[#6b8aff]" />
        ) : (
          <span className="w-3.5 h-3.5 rounded-full bg-[#c0c8e8] dark:bg-[#444]" />
        )}
      </span>
      <span className="text-[12px] font-medium leading-snug text-[#222] dark:text-[#d8d8d8] truncate">
        {node.label}
      </span>
    </div>
  );
};

// ─── AddNodePanel ──────────────────────────────────────────────────────────────
// Shown when the user clicks "Add Node" in the header.
// Groups action nodes by their `section` field and renders each group with a
// section heading + 2-column grid of draggable ActionNodeCards.
const AddNodePanel = () => {
  const actionNodes = useFuseStudioStore((s) => s.actionNodes);
  const loadingActionNodes = useFuseStudioStore((s) => s.loadingActionNodes);
  const setAddingNode = useFuseStudioStore((s) => s.setAddingNode);
  const addFlowNode = useFuseStudioStore((s) => s.addFlowNode);
  const selectNode = useFuseStudioStore((s) => s.selectNode);
  const canvasNodes = useFuseStudioStore((s) => s.nodes);
  const [query, setQuery] = React.useState("");

  /**
   * Click-to-add: place the node at a slightly offset position so successive
   * click-adds don't stack exactly on top of each other.
   */
  const handlePick = (node) => {
    const offset = canvasNodes.length * 40;
    const flowNode = {
      id: `${createFuseNodeId()}`,
      type: "fuse_node",
      position: { x: 350 + offset, y: 200 + offset },
      data: {
        nodeType: node.type,
        label: node.label,
        icon: node.icon ?? null,
        config: {},
        isStarter: false,
      },
    };
    addFlowNode(flowNode);
    selectNode(flowNode);
    setAddingNode(false);
  };

  // Filter nodes by search query, then group them by `section`.
  const sections = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? actionNodes.filter(
          (n) =>
            n.label.toLowerCase().includes(q) ||
            (n.description ?? "").toLowerCase().includes(q),
        )
      : actionNodes;

    // Preserve insertion order of sections.
    const map = {};
    filtered.forEach((node) => {
      const key = node.section ?? "Other";
      if (!map[key]) map[key] = [];
      map[key].push(node);
    });
    return Object.entries(map); // [[sectionTitle, [nodes...]], ...]
  }, [actionNodes, query]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[#ebebeb] dark:border-[#252525] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-semibold text-[#444] dark:text-[#bbb]">
            Add Node
          </span>
          <button
            type="button"
            onClick={() => setAddingNode(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              text-[#888] dark:text-[#555]
              hover:text-[#111] dark:hover:text-[#ddd]
              hover:bg-[#f0f0f0] dark:hover:bg-[#272727]
              transition-colors"
            aria-label="Close"
          >
            <TbX className="w-[15px] h-[15px]" />
          </button>
        </div>
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg
          bg-[#f5f5f5] dark:bg-[#1e1e1e]
          border border-[#e8e8e8] dark:border-[#2a2a2a]"
        >
          <TbSearch className="w-[14px] h-[14px] text-[#aaa] dark:text-[#555] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes…"
            className="flex-1 bg-transparent text-[12.5px] text-[#333] dark:text-[#ccc]
              placeholder:text-[#bbb] dark:placeholder:text-[#444]
              outline-none border-none"
          />
        </div>
      </div>

      {/* Sectioned node list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        {loadingActionNodes ? (
          // Loading skeleton: two mock sections
          ["Section A", "Section B"].map((sk) => (
            <div key={sk} className="flex flex-col gap-2">
              <div className="h-3 w-24 rounded bg-[#efefef] dark:bg-[#222] animate-pulse" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl bg-[#f0f0f0] dark:bg-[#1e1e1e] animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))
        ) : sections.length === 0 ? (
          <p className="text-center text-[12px] text-[#bbb] dark:text-[#444] select-none mt-6">
            {query ? "No nodes match your search" : "No action nodes available"}
          </p>
        ) : (
          sections.map(([title, nodes]) => (
            <div key={title} className="flex flex-col gap-2">
              {/* Section heading */}
              <p
                className="text-[10.5px] font-semibold uppercase tracking-wider
                text-[#bbb] dark:text-[#484848]"
              >
                {title}
              </p>
              {/* 2-column grid of node cards */}
              <div className="grid grid-cols-2 gap-2">
                {nodes.map((node) => (
                  <ActionNodeCard
                    key={node.type}
                    node={node}
                    onPick={handlePick}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── WebhookUrlDisplay ────────────────────────────────────────────────────────
// Read-only row shown in the webhook node config panel, so the user can copy
// the exact URL they need to send requests to.
const WebhookUrlDisplay = ({ workflowId }) => {
  const [copied, setCopied] = React.useState(false);
  const base = (CONFIG.API_BASE_URL || "").replace(/\/$/, "");
  const url = `${base}/fuse/webhook/${workflowId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-[#555] dark:text-[#888]">
        Webhook URL
      </label>
      <div className="flex items-center gap-2">
        <code
          className="flex-1 w-full px-3 py-2.5 rounded-lg text-[13px] font-mono
            text-[#222] dark:text-[#d0d0d0]
            bg-white dark:bg-[#1a1a1a]
            border border-[#ddd] dark:border-[#2e2e2e]
            truncate"
          title={url}
        >
          {url}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy URL"}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
            text-[#888] dark:text-[#666]
            hover:text-[#111] dark:hover:text-white
            hover:bg-[#ebebeb] dark:hover:bg-[#222]
            transition-colors"
        >
          {copied ? (
            <TbCheck className="w-[15px] h-[15px] text-emerald-500" />
          ) : (
            <TbCopy className="w-[15px] h-[15px]" />
          )}
        </button>
      </div>
      <span className="text-[11px] text-[#bbb] dark:text-[#555]">
        Send POST requests to this URL to trigger the workflow.
      </span>
    </div>
  );
};

// ─── NodeConfigView ────────────────────────────────────────────────────────────
// Shown when a React Flow node is selected.
// Renders the node's config_form via FormBuilder and exposes a Delete action.
const NodeConfigView = ({ node, nodeDef, variables = [] }) => {
  const updateNodeConfig = useFuseStudioStore((s) => s.updateNodeConfig);
  const removeNode = useFuseStudioStore((s) => s.removeNode);
  const { id: workflowId } = useParams();
  const Icon = getNodeIcon(nodeDef.icon);

  const node_type = node.data?.nodeType;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3.5 border-b border-[#e8e8e8] dark:border-[#2a2a2a] flex-shrink-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#bbb] dark:text-[#555]">
            {node.data.isStarter ? "Starter" : "Node"} {getDisplayFuseNodeId(node.id)}
          </p>
          {/* Delete node button */}
          <button
            type="button"
            onClick={() => removeNode(node.id)}
            title="Delete this node"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium
              text-[#e05c5c] dark:text-[#c26060]
              hover:bg-[#fef2f2] dark:hover:bg-[#2a1a1a]
              transition-colors"
          >
            <TbTrash className="w-[13px] h-[13px]" />
            Delete
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#f3f3f3] dark:bg-[#2a2a2a]">
              <Icon className="w-[18px] h-[18px] text-[#555] dark:text-[#aaa]" />
            </span>
          )}
          <p className="text-[15px] font-semibold text-[#111] dark:text-[#e0e0e0]">
            {nodeDef.label}
          </p>
        </div>
        {nodeDef.description && (
          <p className="text-[12px] text-[#5b8fc9] dark:text-[#4a7ab5] mt-2 leading-relaxed">
            {nodeDef.description}
          </p>
        )}
      </div>

      {/* Scrollable config form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Webhook URL — always shown for webhook starter nodes */}
        {node_type === "webhook" && (
          <WebhookUrlDisplay workflowId={workflowId} />
        )}

        {/* Push permission banner — shown for get_notified nodes */}
        {node_type === "get_notified" && (
          <NotificationSettings nodeType={node_type} />
        )}

        {nodeDef.config_form ? (
          <FormBuilder
            configForm={nodeDef.config_form}
            values={node.data.config ?? {}}
            onChange={(newValues) => updateNodeConfig(node.id, newValues)}
            variables={variables}
          />
        ) : (
          <p className="text-[12px] text-[#bbb] dark:text-[#444]">
            No configuration required for this node.
          </p>
        )}
      </div>
    </div>
  );
};

// ─── NodeConfigPanel ───────────────────────────────────────────────────────────
/**
 * Right panel of the workflow studio canvas.
 *
 * Panel states (in priority order):
 *   1. nodes.length === 0          → StarterPanel   (no workflow started yet)
 *   2. addingNode === true          → AddNodePanel   (user clicked "Add Node")
 *   3. selectedNode !== null        → NodeConfigView (configure selected node)
 *   4. default                      → idle prompt    (nodes exist, none selected)
 */
const NodeConfigPanel = ({ className = "" }) => {
  const nodes = useFuseStudioStore((s) => s.nodes);
  const edges = useFuseStudioStore((s) => s.edges);
  const selectedNode = useFuseStudioStore((s) => s.selectedNode);
  const starterNodes = useFuseStudioStore((s) => s.starterNodes);
  const actionNodes = useFuseStudioStore((s) => s.actionNodes);
  const addingNode = useFuseStudioStore((s) => s.addingNode);
  const loading = useFuseStudioStore((s) => s.loading);

  const hasStarterNode = nodes.some((n) => n.data?.isStarter === true);

  // Combined lookup across both node definition lists.
  const allNodeDefs = [...starterNodes, ...actionNodes];

  /**
   * Walk the entire ancestor chain backwards from `selectedNode` via BFS,
   * collecting variables from every upstream node that exposes a `body_schema`.
   *
   * This means a node at any depth (e.g. webhook → notified → if_else) will
   * still see variables produced by the webhook, not just its direct parent.
   *
   * Nested objects produce dot-notation paths:  <id>.body.address.street
   * Array-of-object items produce bracket paths: <id>.body.items[].userId
   */
  const upstreamVariables = useMemo(() => {
    if (!selectedNode) return [];

    /** Recursively flatten FieldNode[] into { token, label } entries. */
    const flattenFields = (fields, basePath, baseLabel) => {
      const result = [];
      (fields ?? []).forEach((f) => {
        if (!f.key) return;
        const path = `${basePath}.${f.key}`;
        const label = `${baseLabel}.${f.key}`;
        result.push({ token: path, label });
        if (f.type === "object") {
          result.push(...flattenFields(f.fields, path, label));
        } else if (f.type === "array" && f.items?.type === "object") {
          result.push(
            ...flattenFields(f.items.fields, `${path}[]`, `${label}[]`),
          );
        }
      });
      return result;
    };

    /**
     * BFS up the edge graph from startId.
     * Returns IDs of every ancestor node (excluding startId itself).
     */
    const getAllAncestorIds = (startId) => {
      const visited = new Set();
      const queue = [startId];
      while (queue.length) {
        const current = queue.shift();
        edges
          .filter((e) => e.target === current)
          .forEach((e) => {
            if (!visited.has(e.source)) {
              visited.add(e.source);
              queue.push(e.source);
            }
          });
      }
      return [...visited];
    };

    const ancestorIds = getAllAncestorIds(selectedNode.id);
    const vars = [];

    ancestorIds.forEach((nid) => {
      const n = nodes.find((x) => x.id === nid);
      if (!n) return;

      const nodeMeta = {
        nodeId: n.id,
        nodeName: n.data.label,
        isStarter: n.data.isStarter === true,
      };

      const bodySchema = n.data?.config?.body_schema;
      const outputSchema = n.data?.config?.output_schema;

      if (bodySchema && bodySchema.mode === "visual") {
        vars.push(
          ...flattenFields(bodySchema.fields, `${n.id}.body`, n.data.label)
            .map((v) => ({ ...v, ...nodeMeta })),
        );
      }

      if (outputSchema && outputSchema.mode === "visual") {
        vars.push(
          ...flattenFields(outputSchema.fields, `${n.id}.result`, n.data.label)
            .map((v) => ({ ...v, ...nodeMeta })),
        );
      }

      // http_request: expose status_code, success, body + every declared
      // response_schema field (flattened to top-level of the node output).
      if (n.data?.nodeType === "http_request") {
        vars.push(
          {
            token: `${n.id}.status_code`,
            label: `${n.data.label} → status_code`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.success`,
            label: `${n.data.label} → success`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.body`,
            label: `${n.data.label} → body (full)`,
            ...nodeMeta,
          },
        );
        const responseSchema = n.data?.config?.response_schema;
        if (
          responseSchema?.mode === "visual" &&
          responseSchema.fields?.length
        ) {
          // Fields are flattened to top-level in the node output, so the token
          // path is just  node_id.fieldKey  (no "body." prefix).
          vars.push(
            ...flattenFields(responseSchema.fields, n.id, n.data.label)
              .map((v) => ({ ...v, ...nodeMeta })),
          );
        }
      }
    });

    return vars;
  }, [selectedNode, nodes, edges]);

  let content;
  if (loading) {
    content = null;
  } else if (nodes.length === 0 || !hasStarterNode) {
    // No nodes placed yet — must choose a starter first.
    content = <StarterPanel />;
  } else if (addingNode) {
    // User opened the "Add Node" picker via the header button.
    content = <AddNodePanel />;
  } else if (selectedNode) {
    // A canvas node is selected — show its config form.
    const nodeDef = allNodeDefs.find(
      (n) => n.type === selectedNode.data.nodeType,
    );

    content = nodeDef ? (
      <NodeConfigView
        node={selectedNode}
        nodeDef={nodeDef}
        variables={upstreamVariables}
      />
    ) : (
      <div className="flex items-center justify-center h-full">
        <p className="text-[12px] text-[#bbb] dark:text-[#444] select-none">
          Unknown node type: {selectedNode.data?.nodeType}
        </p>
      </div>
    );
  } else {
    // Nodes exist but none is selected.
    content = <AddNodePanel />;
  }

  return (
    <div className={`flex flex-col overflow-hidden ${className}`}>
      {content}
    </div>
  );
};

export default NodeConfigPanel;
