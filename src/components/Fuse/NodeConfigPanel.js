import React from "react";
import { TbLayoutGrid } from "react-icons/tb";
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
  const addStep      = useFuseStudioStore((s) => s.addStep);
  const selectNode   = useFuseStudioStore((s) => s.selectNode);

  const handlePick = (node) => {
    const step = {
      id: `step_${Date.now()}`,
      type: node.type,
      label: node.label,
      config: {},
    };
    addStep(step);
    selectNode(step);
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
// Shown when a step is selected. Renders the node's config_form via FormBuilder.
// The entire form schema (fields, presets, layout) comes from the backend.
const NodeConfigView = ({ stepIndex, step, nodeDef }) => {
  const updateStepConfig = useFuseStudioStore((s) => s.updateStepConfig);
  const Icon = getNodeIcon(nodeDef.icon);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3.5 border-b border-[#e8e8e8] dark:border-[#2a2a2a] flex-shrink-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#bbb] dark:text-[#555] mb-2">
          Step {stepIndex + 1}
        </p>
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
            values={step.config ?? {}}
            onChange={(newValues) => updateStepConfig(step.id, newValues)}
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
  // Keep ?? [] OUTSIDE the selector — returning a new [] literal inside
  // causes useSyncExternalStore to see a changed snapshot every render → infinite loop.
  const rawSteps     = useFuseStudioStore((s) => s.workflow?.steps);
  const steps        = rawSteps ?? [];
  const selectedNode = useFuseStudioStore((s) => s.selectedNode);
  const starterNodes = useFuseStudioStore((s) => s.starterNodes);

  let content;

  if (steps.length === 0) {
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
    const nodeDef   = starterNodes.find((n) => n.type === selectedNode.type);
    const stepIndex = steps.findIndex((s) => s.id === selectedNode.id);

    content = nodeDef ? (
      <NodeConfigView stepIndex={stepIndex} step={selectedNode} nodeDef={nodeDef} />
    ) : (
      <div className="flex items-center justify-center h-full">
        <p className="text-[12px] text-[#bbb] dark:text-[#444] select-none">
          Unknown node type: {selectedNode.type}
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

