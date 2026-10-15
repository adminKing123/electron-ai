import { useCallback, useState } from "react";
import { getRunLiveConfigAPI } from "../apis/fuse/queryFunctions";
import { auth } from "../firebase/index";
import useFuseLiveSocket from "./useFuseLiveSocket";

function mergeNodeState(prev, nodeId, patch) {
  return {
    ...prev,
    [nodeId]: {
      ...(prev[nodeId] || {}),
      node_id: nodeId,
      ...patch,
    },
  };
}

/**
 * Live Fuse run state over WebSocket (snapshot + streaming updates).
 */
export default function useFuseRunLive(runId) {
  const [run, setRun] = useState(null);
  const [nodeStates, setNodeStates] = useState({});
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [activeNodeIds, setActiveNodeIds] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [error, setError] = useState(null);

  const fetchWsUrl = useCallback(async () => {
    const { ws_url: wsUrl } = await getRunLiveConfigAPI(runId);
    return wsUrl;
  }, [runId]);

  const applyEvent = useCallback((msg) => {
    switch (msg.type) {
      case "snapshot": {
        setRun(msg.run ?? null);
        const ids = Array.isArray(msg.active_node_ids)
          ? msg.active_node_ids
          : msg.active_node_id
            ? [msg.active_node_id]
            : [];
        const states = { ...(msg.node_states ?? {}) };
        for (const id of ids) {
          if (!states[id] || states[id].status === "running") {
            states[id] = {
              ...(states[id] || {}),
              node_id: id,
              status: "running",
            };
          }
        }
        setNodeStates(states);
        setActiveNodeId(msg.active_node_id ?? ids[ids.length - 1] ?? null);
        setActiveNodeIds(ids);
        setError(null);
        break;
      }
      case "run_update":
      case "run_finished":
        if (msg.run) setRun(msg.run);
        if (msg.type === "run_finished") {
          setActiveNodeId(null);
          setActiveNodeIds([]);
        }
        break;
      case "node_started":
        setActiveNodeId(msg.node_id);
        setActiveNodeIds((prev) =>
          prev.includes(msg.node_id) ? prev : [...prev, msg.node_id]
        );
        setNodeStates((prev) =>
          mergeNodeState(prev, msg.node_id, {
            node_type: msg.node_type,
            node_label: msg.node_label,
            status: "running",
            started_at: msg.started_at,
            finished_at: null,
            duration_ms: null,
            ...(msg.config != null ? { config: msg.config } : {}),
            ...(msg.variables != null ? { variables: msg.variables } : {}),
          })
        );
        break;
      case "node_log":
        if (msg.log?.node_id) {
          setNodeStates((prev) => ({
            ...prev,
            [msg.log.node_id]: msg.log,
          }));
          const terminal =
            msg.log.status && msg.log.status !== "running";
          if (terminal) {
            setActiveNodeIds((prev) =>
              prev.filter((id) => id !== msg.log.node_id)
            );
            setActiveNodeId((current) =>
              current === msg.log.node_id ? null : current
            );
          }
        }
        break;
      default:
        break;
    }
  }, []);

  const handleConnectionChange = useCallback((status) => {
    setConnectionStatus(status);
    if (status === "error") {
      setError(
        auth.currentUser
          ? "Could not connect to live run updates."
          : "Sign in required to watch this run."
      );
    } else if (status === "connected") {
      setError(null);
    }
  }, []);

  const { reconnect } = useFuseLiveSocket({
    enabled: Boolean(runId),
    fetchWsUrl,
    onEvent: applyEvent,
    onConnectionChange: handleConnectionChange,
  });

  return {
    run,
    nodeStates,
    activeNodeId,
    activeNodeIds,
    connectionStatus,
    error,
    reconnect,
  };
}
