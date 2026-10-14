import React from "react";
import BlockNode             from "./BlockNode";
import ScheduleNode          from "./ScheduleNode";
import WebhookNode           from "./WebhookNode";
import WebexMessageNode      from "./WebexMessageNode";
import GithubPullRequestNode from "./GithubPullRequestNode";
import IfElseNode            from "./IfElseNode";
import ForEachNode           from "./ForEachNode";
import GetNotifiedNode       from "./GetNotifiedNode";
import AiStructuredOutputNode from "./AiStructuredOutputNode";
import AiGenerateTextNode     from "./AiGenerateTextNode";
import HttpRequestNode       from "./HttpRequestNode";
import SendGmailNode         from "./SendGmailNode";
import SendWebexMessageNode  from "./SendWebexMessageNode";
import DefaultFlowNode       from "./DefaultFlowNode";

const FuseRunRunningBadge = () => (
  <span
    className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-[1]
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full
      text-[10px] font-semibold uppercase tracking-wide
      bg-[#1a73e8] text-white dark:bg-[#8ab4f8] dark:text-[#202124]
      shadow-sm animate-pulse"
    aria-hidden
  >
    <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#202124] opacity-90" />
    Running
  </span>
);

const withRunHighlight = (node, props) => {
  if (props.data?.runStatus !== "running") return node;
  return (
    <div className="relative">
      <FuseRunRunningBadge />
      {node}
    </div>
  );
};

// ─── FuseFlowNode ─────────────────────────────────────────────────────────────
// Top-level dispatcher rendered for every node on the Fuse canvas.
// Delegates to the node-specific component based on data.nodeType so each
// node type can have a completely independent look, feel, and logic.
//
// To add a new node variant:
//   1. Create nodes/<YourNode>.js
//   2. Import it here
//   3. Add a case to the switch below
const FuseFlowNode = (props) => {
  const { data } = props;

  let inner;
  switch (data.nodeType) {
    // ── Starter nodes ───────────────────────────────────────────────────────
    case "schedule":
      inner = <ScheduleNode {...props} />;
      break;
    case "webhook":
      inner = <WebhookNode {...props} />;
      break;
    case "webex_message":
      inner = <WebexMessageNode {...props} />;
      break;
    case "github_pull_request":
      inner = <GithubPullRequestNode {...props} />;
      break;

    // ── Action nodes ────────────────────────────────────────────────────────
    case "if_else":
      inner = <IfElseNode {...props} />;
      break;
    case "for_each":
      inner = <ForEachNode {...props} />;
      break;
    case "get_notified":
      inner = <GetNotifiedNode {...props} />;
      break;
    case "ai_structured_output":
      inner = <AiStructuredOutputNode {...props} />;
      break;
    case "ai_generate_text":
      inner = <AiGenerateTextNode {...props} />;
      break;
    case "http_request":
      inner = <HttpRequestNode {...props} />;
      break;
    case "send_gmail":
      inner = <SendGmailNode {...props} />;
      break;
    case "send_webex_message":
      inner = <SendWebexMessageNode {...props} />;
      break;

    // ── Fallback for any future / unknown node types ─────────────────────────
    default:
      inner = <DefaultFlowNode {...props} />;
  }

  return withRunHighlight(inner, props);
};

export default FuseFlowNode;

/** Map of all custom node types registered with React Flow. */
export const NODE_TYPES = {
  fuse_node:  FuseFlowNode,
  fuse_block: BlockNode,
};
