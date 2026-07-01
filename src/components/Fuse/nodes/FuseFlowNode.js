import React from "react";
import ScheduleNode          from "./ScheduleNode";
import WebhookNode           from "./WebhookNode";
import WebexMessageNode      from "./WebexMessageNode";
import IfElseNode            from "./IfElseNode";
import GetNotifiedNode       from "./GetNotifiedNode";
import AiStructuredOutputNode from "./AiStructuredOutputNode";
import AiGenerateTextNode     from "./AiGenerateTextNode";
import HttpRequestNode       from "./HttpRequestNode";
import SendGmailNode         from "./SendGmailNode";
import SendWebexMessageNode  from "./SendWebexMessageNode";
import DefaultFlowNode       from "./DefaultFlowNode";

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

  switch (data.nodeType) {
    // ── Starter nodes ───────────────────────────────────────────────────────
    case "schedule":
      return <ScheduleNode {...props} />;
    case "webhook":
      return <WebhookNode {...props} />;
    case "webex_message":
      return <WebexMessageNode {...props} />;

    // ── Action nodes ────────────────────────────────────────────────────────
    case "if_else":
      return <IfElseNode {...props} />;
    case "get_notified":
      return <GetNotifiedNode {...props} />;
    case "ai_structured_output":
      return <AiStructuredOutputNode {...props} />;
    case "ai_generate_text":
      return <AiGenerateTextNode {...props} />;
    case "http_request":
      return <HttpRequestNode {...props} />;
    case "send_gmail":
      return <SendGmailNode {...props} />;
    case "send_webex_message":
      return <SendWebexMessageNode {...props} />;

    // ── Fallback for any future / unknown node types ─────────────────────────
    default:
      return <DefaultFlowNode {...props} />;
  }
};

export default FuseFlowNode;

/** Map of all custom node types registered with React Flow. */
export const NODE_TYPES = { fuse_node: FuseFlowNode };
