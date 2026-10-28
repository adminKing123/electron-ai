import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  TbLayoutGrid,
  TbTrash,
  TbX,
  TbSearch,
  TbCopy,
  TbCheck,
} from "react-icons/tb";
import useFuseStudioStore from "../../store/useFuseStudioStore";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "./FuseNodeIcon";
import NodePickerCard from "./NodePickerCard";
import { FUSE_NODE_ICON_WELL, FUSE_NODE_LABEL_MUTED, FUSE_PICKER_ROW } from "./fuseNodeTheme";
import FormBuilder from "./FormBuilder";
import CONFIG from "../../config";
import NotificationSettings from "./NotificationSettings";
import { createFuseNodeId, getDisplayFuseNodeId } from "../../utils/helpers";
import { FUSE_DEFAULT_RUN_LOG_SAVE } from "../../utils/fuseNodeConfig";
import RunLogSaveSettings from "./RunLogSaveSettings";
import useUserStore from "../../store/useUserStore";

/** Display order for node picker sections (integration sections last). */
const NODE_SECTION_ORDER = [
  "General",
  "Notifications",
  "AI",
  "Logic",
  "Network",
  "Webex",
  "Google",
  "Handle Files",
  "Other",
];

/** Filter by search query and group nodes into ordered sections. */
const groupNodesBySection = (nodes, query) => {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? nodes.filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          (n.description ?? "").toLowerCase().includes(q) ||
          (n.section ?? "General").toLowerCase().includes(q),
      )
    : nodes;

  const map = {};
  filtered.forEach((node) => {
    const key = node.section ?? "General";
    if (!map[key]) map[key] = [];
    map[key].push(node);
  });

  return Object.entries(map).sort(([a], [b]) => {
    const ia = NODE_SECTION_ORDER.indexOf(a);
    const ib = NODE_SECTION_ORDER.indexOf(b);
    const ra = ia === -1 ? NODE_SECTION_ORDER.length : ia;
    const rb = ib === -1 ? NODE_SECTION_ORDER.length : ib;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
};

const NodePickerSearch = ({ query, onChange, placeholder = "Search nodes..." }) => (
  <div
    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-colors ${FUSE_PICKER_ROW}`}
  >
    <TbSearch className={`w-[18px] h-[18px] flex-shrink-0 ${FUSE_NODE_LABEL_MUTED}`} />
    <input
      type="text"
      value={query}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 bg-transparent text-[15px] text-ink-875 dark:text-ink-100
        placeholder:text-ink-600 dark:placeholder:text-ink-450
        outline-none border-none"
    />
  </div>
);

const NodeSectionGrid = ({ title, nodes, onPick, isStarter }) => (
  <div className="flex flex-col gap-2.5">
    <p className={`text-[14px] font-medium px-0.5 ${FUSE_NODE_LABEL_MUTED}`}>
      {title}
    </p>
    <div className="grid grid-cols-2 gap-2">
      {nodes.map((node) => (
        <NodePickerCard
          key={node.type}
          node={node}
          onPick={onPick}
          isStarter={isStarter}
          as={isStarter ? "button" : "div"}
        />
      ))}
    </div>
  </div>
);

const StarterPanel = () => {
  const starterNodes = useFuseStudioStore((s) => s.starterNodes);
  const loadingNodes = useFuseStudioStore((s) => s.loadingNodes);
  const addFlowNode = useFuseStudioStore((s) => s.addFlowNode);
  const selectNode = useFuseStudioStore((s) => s.selectNode);
  const [query, setQuery] = React.useState("");

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
        config: { ...(node.defaults || {}), ...FUSE_DEFAULT_RUN_LOG_SAVE },
        // Mark as the workflow trigger so WorkflowCanvas and the store can
        // enforce the single-outgoing-edge rule.
        isStarter: true,
      },
    };
    addFlowNode(flowNode);
    selectNode(flowNode);
  };

  const sections = React.useMemo(
    () => groupNodesBySection(starterNodes, query),
    [starterNodes, query],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-5 pb-4 flex-shrink-0 bg-white dark:bg-void-850">
        <div className="flex items-center gap-2 mb-3">
          <TbLayoutGrid className="w-[20px] h-[20px] text-ink-600 dark:text-ink-450" />
          <span className="text-[16px] font-medium text-ink-875 dark:text-ink-100">
            Choose a starter
          </span>
        </div>
        <NodePickerSearch query={query} onChange={setQuery} placeholder="Search starters..." />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-5 pt-1 flex flex-col gap-6 bg-white dark:bg-void-850">
        {loadingNodes ? (
          ["General", "Webex"].map((sk) => (
            <div key={sk} className="flex flex-col gap-2">
              <div className="h-3 w-24 rounded bg-ink-75 dark:bg-void-875 animate-pulse" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-[52px] rounded-2xl bg-ink-50 dark:bg-void-775 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))
        ) : sections.length === 0 ? (
          <p className="text-center text-[12px] text-ink-450 dark:text-ink-600 select-none mt-6">
            {query ? "No starters match your search" : "No starter nodes available"}
          </p>
        ) : (
          sections.map(([title, nodes]) => (
            <NodeSectionGrid
              key={title}
              title={title}
              nodes={nodes}
              onPick={handlePick}
              isStarter
            />
          ))
        )}
      </div>
    </div>
  );
};

// --- AddNodePanel --------------------------------------------------------------
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
        config: { ...(node.defaults || {}), ...FUSE_DEFAULT_RUN_LOG_SAVE },
        isStarter: false,
      },
    };
    addFlowNode(flowNode);
    selectNode(flowNode);
    setAddingNode(false);
  };

  const sections = React.useMemo(
    () => groupNodesBySection(actionNodes, query),
    [actionNodes, query],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex-shrink-0 bg-white dark:bg-void-850">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[16px] font-medium text-ink-875 dark:text-ink-100">
            Add Node
          </span>
        </div>
        <NodePickerSearch query={query} onChange={setQuery} />
      </div>

      {/* Sectioned node list */}
      <div className="flex-1 overflow-y-auto px-4 pb-5 pt-1 flex flex-col gap-6 bg-white dark:bg-void-850">
        {loadingActionNodes ? (
          // Loading skeleton: two mock sections
          ["Webex", "General"].map((sk) => (
            <div key={sk} className="flex flex-col gap-2">
              <div className="h-3 w-24 rounded bg-ink-75 dark:bg-void-875 animate-pulse" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-[52px] rounded-2xl bg-ink-50 dark:bg-void-775 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))
        ) : sections.length === 0 ? (
          <p className="text-center text-[12px] text-ink-450 dark:text-ink-600 select-none mt-6">
            {query ? "No nodes match your search" : "No action nodes available"}
          </p>
        ) : (
          sections.map(([title, nodes]) => (
            <NodeSectionGrid
              key={title}
              title={title}
              nodes={nodes}
              onPick={handlePick}
            />
          ))
        )}
      </div>
    </div>
  );
};

const WEBEX_MESSAGE_OUTPUT_FIELDS = [
  { key: "message_id",   label: "message_id" },
  { key: "text",         label: "text" },
  { key: "person_id",    label: "person_id" },
  { key: "person_email", label: "person_email" },
  { key: "room_id",      label: "room_id" },
  { key: "room_type",    label: "room_type" },
  { key: "created",      label: "created" },
  { key: "is_mention",   label: "is_mention" },
];

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
      <label className="text-[12px] font-medium text-ink-650 dark:text-ink-500">
        Webhook URL
      </label>
      <div className="flex items-center gap-2">
        <code
          className="flex-1 w-full px-3 py-2.5 rounded-lg text-[13px] font-mono
            text-ink-875 dark:text-ink-200
            bg-white dark:bg-void-850
            border border-ink-200 dark:border-void-775
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
            text-ink-500 dark:text-ink-600
            hover:text-ink-975 dark:hover:text-white
            hover:bg-ink-100 dark:hover:bg-void-875
            transition-colors"
        >
          {copied ? (
            <TbCheck className="w-[15px] h-[15px] text-emerald-500" />
          ) : (
            <TbCopy className="w-[15px] h-[15px]" />
          )}
        </button>
      </div>
      <span className="text-[11px] text-ink-450 dark:text-ink-550">
        Send POST requests to this URL to trigger the workflow.
      </span>
    </div>
  );
};

/** Inline-editable node display name shown in the config panel header. */
const NodeLabelInput = ({ value, onChange, onBlur, maxLength, typeLabel }) => {
  const inputRef = React.useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Escape") inputRef.current?.blur();
  };

  return (
    <div className="flex flex-col gap-1 min-w-0 flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder={typeLabel}
        className="w-full bg-transparent px-0 py-0.5
          text-[15px] font-semibold
          text-ink-975 dark:text-ink-150
          placeholder:text-ink-450 dark:placeholder:text-ink-550
          border-none outline-none"
      />
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-[11px] text-ink-400 dark:text-ink-550 truncate">
          {typeLabel}
        </span>
        <span className="text-[11px] tabular-nums text-ink-400 dark:text-ink-600 flex-shrink-0">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
};

// --- NodeConfigView ------------------------------------------------------------
// Shown when a React Flow node is selected.
// Renders the node's config_form via FormBuilder and exposes a Delete action.
const NodeConfigView = ({ node, nodeDef, variables = [] }) => {
  const updateNodeConfig = useFuseStudioStore((s) => s.updateNodeConfig);
  const updateNodeLabel = useFuseStudioStore((s) => s.updateNodeLabel);
  const removeNode = useFuseStudioStore((s) => s.removeNode);
  const accountEmail = useUserStore((s) => s.user?.email ?? "");
  const { id: workflowId } = useParams();
  const maxLabelLength = CONFIG.MAX_NODE_LABEL_LENGTH;

  const node_type = node.data?.nodeType;
  const displayLabel = node.data?.label ?? nodeDef.label;

  const handleLabelBlur = () => {
    const trimmed = displayLabel.trim();
    const final = trimmed || nodeDef.label;
    if (final !== displayLabel) updateNodeLabel(node.id, final);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3.5 border-b border-ink-100 dark:border-void-800 flex-shrink-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-450 dark:text-ink-550">
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
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${FUSE_NODE_ICON_WELL}`}>
            <FuseNodeIcon
              iconName={nodeDef.icon}
              sizeClass={FUSE_NODE_ICON_SIZES.config}
            />
          </span>
          <NodeLabelInput
            value={displayLabel}
            onChange={(v) => updateNodeLabel(node.id, v)}
            onBlur={handleLabelBlur}
            maxLength={maxLabelLength}
            typeLabel={nodeDef.label}
          />
        </div>
        {nodeDef.description && (
          <p className="text-[12px] text-brand-500 dark:text-brand-400 mt-2 leading-relaxed">
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

        {/* Webex activation note — webhook is registered on Turn On */}
        {node_type === "webex_message" && (
          <p className="text-[12px] leading-relaxed text-ink-500 dark:text-ink-550
            px-3 py-2.5 rounded-lg bg-brand-50 dark:bg-brand-950/35
            border border-brand-200 dark:border-brand-800/55">
            When you turn the workflow on, a Webex webhook is registered automatically.
            Incoming messages matching your filters will trigger this workflow.
          </p>
        )}

        {/* Push permission banner — shown for get_notified nodes */}
        {node_type === "get_notified" && (
          <NotificationSettings nodeType={node_type} />
        )}

        {node_type === "get_notified_email" && (
          <div
            className="rounded-xl border border-ink-100 dark:border-void-850
              bg-white dark:bg-void-850 px-3 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-550 mb-1">
              To
            </p>
            <p className="text-[13px] font-medium text-ink-975 dark:text-ink-100 break-all">
              {accountEmail || "Your signed-in email"}
            </p>
            <p className="text-[11px] text-ink-500 dark:text-ink-600 mt-1.5 leading-relaxed">
              Always sent to your account email. This cannot be changed.
            </p>
          </div>
        )}

        {nodeDef.config_form ? (
          <FormBuilder
            configForm={nodeDef.config_form}
            values={node.data.config ?? {}}
            onChange={(newValues) => updateNodeConfig(node.id, newValues)}
            variables={variables}
          />
        ) : (
          <p className="text-[12px] text-ink-450 dark:text-ink-600">
            No configuration required for this node.
          </p>
        )}

        <RunLogSaveSettings
          config={node.data.config ?? {}}
          onChange={(next) => updateNodeConfig(node.id, next)}
        />
      </div>
    </div>
  );
};

// --- NodeConfigPanel -----------------------------------------------------------
/**
 * Right panel of the workflow studio canvas.
 *
 * Block nodes (fuse_block) never reach this panel — clicking a block clears
 * selectedNode so the panel stays on its current / default view.
 * All block editing (rename, colour, remove) happens in BlockNode's NodeToolbar.
 *
 * Panel states (in priority order):
 *   1. nodes.length === 0          ? StarterPanel   (no workflow started yet)
 *   2. addingNode === true          ? AddNodePanel   (user clicked "Add Node")
 *   3. selectedNode !== null        ? NodeConfigView (configure selected node)
 *   4. default                      ? AddNodePanel   (nodes exist, none selected)
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
   * This means a node at any depth (e.g. webhook ? notified ? if_else) will
   * still see variables produced by the webhook, not just its direct parent.
   *
   * Nested objects produce dot-notation paths:  <id>.body.address.street
   * Array-of-object items produce bracket paths: <id>.body.items[].userId
   */
  const upstreamVariables = useMemo(() => {
    if (!selectedNode) return [];

    /** Recursively flatten FieldNode[] into { token, label, isArray? } entries. */
    const flattenFields = (fields, basePath, baseLabel) => {
      const result = [];
      (fields ?? []).forEach((f) => {
        if (!f.key) return;
        const path = `${basePath}.${f.key}`;
        const label = `${baseLabel}.${f.key}`;
        result.push({ token: path, label, isArray: f.type === "array" });
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

      if (n.data?.nodeType === "ai_generate_text") {
        vars.push({
          token: `${n.id}.text`,
          label: `${n.data.label} ? text`,
          ...nodeMeta,
        });
      }

      if (n.data?.nodeType === "github_pull_request") {
        const fields = [
          { key: "pr_id", label: "PR ID" },
          { key: "pr_number", label: "PR Number" },
          { key: "pr_title", label: "PR Title" },
          { key: "pr_description", label: "PR Description" },
          { key: "pr_url", label: "PR URL" },
          { key: "event_type", label: "Event Type" },
          { key: "event_action", label: "Event Action" },
          { key: "user_login", label: "User Login" },
          { key: "pr_author", label: "PR Author" },
          { key: "action_taken_by", label: "Action Taken By" },
          { key: "repository_name", label: "Repository Name" },
          { key: "source_branch", label: "Source Branch" },
          { key: "target_branch", label: "Target Branch" },
          { key: "pr_state", label: "PR State" },
          { key: "merged", label: "Merged (Boolean)" },
          { key: "is_draft", label: "Is Draft (Boolean)" },
          { key: "additions", label: "Lines Added" },
          { key: "deletions", label: "Lines Deleted" },
          { key: "changed_files", label: "Changed Files" },
          { key: "commits_count", label: "Total Commits" },
          { key: "comments_count", label: "Total Comments" },
          { key: "review_comments_count", label: "Review Comments Count" },
          { key: "head_sha", label: "Head Commit SHA" },
          { key: "base_sha", label: "Base Commit SHA" },
          { key: "merge_commit_sha", label: "Merge Commit SHA" },
          { key: "pr_created_at", label: "PR Created At" },
          { key: "pr_updated_at", label: "PR Updated At" },
          { key: "pr_closed_at", label: "PR Closed At" },
          { key: "pr_merged_at", label: "PR Merged At" },
          { key: "author_association", label: "Author Association (e.g. CONTRIBUTOR)" },
          { key: "milestone", label: "Milestone" },
          { key: "maintainer_can_modify", label: "Maintainer Can Modify (Boolean)" },
          { key: "mergeable_state", label: "Mergeable State (e.g. clean, dirty)" },
          { key: "merged_by", label: "Merged By User" },
          { key: "diff_url", label: "Diff URL" },
          { key: "patch_url", label: "Patch URL" },
          { key: "repository_url", label: "Repository URL" },
          { key: "repository_visibility", label: "Repository Visibility (Public/Private)" },
          { key: "pr_author_avatar_url", label: "PR Author Avatar URL" },
          { key: "sender_avatar_url", label: "Sender Avatar URL" },
          { key: "locked", label: "Is Locked (Boolean)" },
          { key: "rebaseable", label: "Is Rebaseable (Boolean)" },
          { key: "pr_labels", label: "PR Labels (comma-separated)" },
          { key: "pr_assignees", label: "PR Assignees (comma-separated)" },
          { key: "pr_reviewers", label: "Requested Reviewers (comma-separated)" },
          { key: "pr_requested_teams", label: "Requested Teams (comma-separated)" },
          { key: "review_state", label: "Review State" },
          { key: "review_body", label: "Review Comment" },
          { key: "review_url", label: "Review URL" },
          { key: "triggered_at", label: "Triggered At" }
        ];
        fields.forEach(({ key, label }) => {
          vars.push({
            token: `${n.id}.${key}`,
            label: `${n.data.label}.${label}`,
            ...nodeMeta,
          });
        });
      }

      if (n.data?.nodeType === "webex_message") {
        const fields = WEBEX_MESSAGE_OUTPUT_FIELDS.filter(
          (f) => f.key !== "text" || n.data?.config?.include_message_body,
        );
        fields.forEach(({ key, label }) => {
          vars.push({
            token: `${n.id}.${key}`,
            label: `${n.data.label}.${label}`,
            ...nodeMeta,
          });
        });
      }

      if (n.data?.nodeType === "send_webex_message") {
        vars.push(
          {
            token: `${n.id}.success`,
            label: `${n.data.label} ? success`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.message_id`,
            label: `${n.data.label} ? message_id`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.room_id`,
            label: `${n.data.label} ? room_id`,
            ...nodeMeta,
          },
        );
      }

      if (n.data?.nodeType === "create_json_file") {
        vars.push(
          {
            token: `${n.id}.url`,
            label: `${n.data.label} ? url`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.filename`,
            label: `${n.data.label} ? filename`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.path`,
            label: `${n.data.label} ? path`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.size_bytes`,
            label: `${n.data.label} ? size_bytes`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.content_type`,
            label: `${n.data.label} ? content_type`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.original_name`,
            label: `${n.data.label} ? original_name`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.success`,
            label: `${n.data.label} ? success`,
            ...nodeMeta,
          },
        );
      }

      // http_request: expose status_code, success, and response body fields.
      // Response data lives under "body" only — same pattern as webhook.
      if (n.data?.nodeType === "http_request") {
        vars.push(
          {
            token: `${n.id}.status_code`,
            label: `${n.data.label} ? status_code`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.success`,
            label: `${n.data.label} ? success`,
            ...nodeMeta,
          },
        );

        const responseSchema = n.data?.config?.response_schema;
        if (
          responseSchema?.mode === "visual" &&
          responseSchema.fields?.length
        ) {
          vars.push(
            ...flattenFields(
              responseSchema.fields,
              `${n.id}.body`,
              n.data.label,
            ).map((v) => ({ ...v, ...nodeMeta })),
          );
        } else {
          vars.push({
            token: `${n.id}.body`,
            label: `${n.data.label} ? body`,
            ...nodeMeta,
          });
        }
      }

      if (n.data?.nodeType === "for_each") {
        // Always expose the loop iteration primitives
        vars.push(
          {
            token: `${n.id}.current_item`,
            label: `${n.data.label} ? current item`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.current_index`,
            label: `${n.data.label} ? current index`,
            ...nodeMeta,
          },
          {
            token: `${n.id}.items`,
            label: `${n.data.label} ? items (full array)`,
            isArray: true,
            ...nodeMeta,
          },
          {
            token: `${n.id}.count`,
            label: `${n.data.label} ? count`,
            ...nodeMeta,
          },
        );

        // If the array variable points to a schema-defined array-of-objects, also
        // expose each object field as current_item.<field> so users can pick them
        // directly from the @ picker instead of typing the path manually.
        const arrayVarToken = (n.data?.config?.array_variable || "").trim();
        // Token format: {{sourceNodeId.path.to.field}}
        const tokenMatch = arrayVarToken.match(/^\{\{([^.}]+)\.(.+?)\}\}$/);
        if (tokenMatch) {
          const [, srcId, srcPath] = tokenMatch;
          const srcNode = nodes.find((x) => x.id === srcId);
          if (srcNode) {
            // Recursively find a field at an arbitrary dot-separated path inside a
            // flat field list (handles nested objects like pagination.items).
            const findFieldAtPath = (fields, parts) => {
              if (!Array.isArray(fields) || parts.length === 0) return null;
              const head = parts[0].replace("[]", "");
              const rest = parts.slice(1);
              const field = fields.find((f) => f.key === head);
              if (!field) return null;
              if (rest.length === 0) return field;
              if (field.type === "object" && Array.isArray(field.fields)) {
                return findFieldAtPath(field.fields, rest);
              }
              return null;
            };

            // Each schema type uses a different prefix for the variable token path.
            // Strip the prefix, then walk the remaining path through the schema tree.
            const schemaSets = [
              { schema: srcNode.data?.config?.response_schema, prefix: "body." },
              { schema: srcNode.data?.config?.body_schema,     prefix: "body." },
              { schema: srcNode.data?.config?.output_schema,   prefix: "result." },
              { schema: srcNode.data?.config?.variables,       prefix: "" },
            ].filter(({ schema }) => schema?.mode === "visual" && Array.isArray(schema.fields));

            for (const { schema, prefix } of schemaSets) {
              if (prefix && !srcPath.startsWith(prefix)) continue;
              const schemaPath = prefix ? srcPath.slice(prefix.length) : srcPath;
              const pathParts  = schemaPath.split(".");

              const arrField = findFieldAtPath(schema.fields, pathParts);
              if (arrField?.type === "array" && arrField.items?.type === "object") {
                // Expose every object property as current_item.<fieldName>
                flattenFields(
                  arrField.items.fields || [],
                  `${n.id}.current_item`,
                  `${n.data.label} ? item`,
                ).forEach((v) => vars.push({ ...v, ...nodeMeta }));
                break;
              }
            }
          }
        }
      }

      if (n.data?.nodeType === "set_variables") {
        const variablesConfig = n.data?.config?.variables;
        if (variablesConfig && variablesConfig.mode === "visual") {
          vars.push(
            ...flattenFields(variablesConfig.fields, `${n.id}`, n.data.label)
              .map((v) => ({ ...v, ...nodeMeta }))
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
    // A workflow node is selected — show its config form.
    // Block nodes (fuse_block) never reach here; WorkflowCanvas clears
    // selectedNode before they could be set.
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
        <p className="text-[12px] text-ink-450 dark:text-ink-600 select-none">
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
