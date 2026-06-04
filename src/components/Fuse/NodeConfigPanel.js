import React from "react";
import { TbLayoutGrid, TbTrash } from "react-icons/tb";
import useFuseStudioStore from "../../store/useFuseStudioStore";
import { getNodeIcon } from "./iconRegistry";
import FormBuilder from "./FormBuilder";

const StarterNodeCard = ({ node, onPick }) => {
  const Icon = getNodeIcon(node.icon);
  return (
    <button
      type="button"
      onClick={() => onPick(node)}
      className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-left w-full
        bg-white dark:bg-[#1c1c1c]
        border border-[#e8e8e8] dark:border-[#272727]
        hover:bg-[#f5f7ff] dark:hover:bg-[#202030]
        hover:border-[#c7cfe8] dark:hover:border-[#363660]
        transition-colors"
    >
      <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full
        bg-[#eef0fb] dark:bg-[#252540]">
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
  const addFlowNode  = useFuseStudioStore((s) => s.addFlowNode);
  const selectNode   = useFuseStudioStore((s) => s.selectNode);

  const handlePick = (node) => {
    // Build a React Flow-compatible node so WorkflowCanvas can render it immediately.
    const flowNode = {
      id: `node_${Date.now()}`,
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
      <div className="flex items-center gap-2 px-5 pt-4 pb-3.5
        border-b border-[#ebebeb] dark:border-[#252525] flex-shrink-0">
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
              <StarterNodeCard key={node.type} node={node} onPick={handlePick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── NodeConfigView ────────────────────────────────────────────────────────────
// Shown when a React Flow node is selected.
// Renders the node's config_form via FormBuilder and exposes a Delete action.
const NodeConfigView = ({ nodeIndex, node, nodeDef }) => {
  const updateNodeConfig = useFuseStudioStore((s) => s.updateNodeConfig);
  const removeNode       = useFuseStudioStore((s) => s.removeNode);
  const Icon = getNodeIcon(nodeDef.icon);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3.5 border-b border-[#e8e8e8] dark:border-[#2a2a2a] flex-shrink-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#bbb] dark:text-[#555]">
            {node.data.isStarter ? "Starter" : "Node"} {nodeIndex + 1}
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
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {nodeDef.config_form ? (
          <FormBuilder
            configForm={nodeDef.config_form}
            values={node.data.config ?? {}}
            onChange={(newValues) => updateNodeConfig(node.id, newValues)}
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
 * States:
 *   steps empty            → StarterPanel (pick a starter node to begin)
 *   steps present, none selected → prompt to select a node
 *   steps present, selected      → NodeConfigView (config form from API schema)
 */
const NodeConfigPanel = ({ className = "" }) => {
  // Read nodes from the flat React Flow array in the store (not from workflow.steps).
  const nodes        = useFuseStudioStore((s) => s.nodes);
  const selectedNode = useFuseStudioStore((s) => s.selectedNode);
  const starterNodes = useFuseStudioStore((s) => s.starterNodes);

  let content;

  if (nodes.length === 0) {
    // No nodes placed yet — show the starter picker.
    content = <StarterPanel />;
  } else if (!selectedNode) {
    content = (
      <div className="flex items-center justify-center h-full">
        <p className="text-[12px] text-[#bbb] dark:text-[#444] select-none">
          Select a node to configure it
        </p>
      </div>
    );
  } else {
    // selectedNode is a React Flow node — type info is under selectedNode.data.nodeType.
    const nodeDef   = starterNodes.find((n) => n.type === selectedNode.data.nodeType);
    const nodeIndex = nodes.findIndex((n) => n.id === selectedNode.id);

    content = nodeDef ? (
      <NodeConfigView nodeIndex={nodeIndex} node={selectedNode} nodeDef={nodeDef} />
    ) : (
      <div className="flex items-center justify-center h-full">
        <p className="text-[12px] text-[#bbb] dark:text-[#444] select-none">
          Unknown node type: {selectedNode.data?.nodeType}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col overflow-hidden ${className}`}>
      {content}
    </div>
  );
};

export default NodeConfigPanel;

