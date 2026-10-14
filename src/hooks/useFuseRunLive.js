import { useCallback, useEffect, useRef, useState } from "react";
import { auth } from "../firebase/index";
import { getRunLiveConfigAPI } from "../apis/fuse/queryFunctions";
import { connectFuseRunSocket } from "../utils/fuseRunSocket";

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
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [error, setError] = useState(null);

  const disconnectRef = useRef(null);
  const reconnectTokenRef = useRef(0);

  const applyEvent = useCallback((msg) => {
    switch (msg.type) {
      case "snapshot":
        setRun(msg.run ?? null);
        setNodeStates(msg.node_states ?? {});
        setActiveNodeId(msg.active_node_id ?? null);
        break;
      case "run_update":
      case "run_finished":
        if (msg.run) setRun(msg.run);
        if (msg.type === "run_finished") setActiveNodeId(null);
        break;
      case "node_started":
        setActiveNodeId(msg.node_id);
        setNodeStates((prev) =>
          mergeNodeState(prev, msg.node_id, {
            node_type: msg.node_type,
            node_label: msg.node_label,
            status: "running",
            started_at: msg.started_at,
            finished_at: null,
            duration_ms: null,
          })
        );
        break;
      case "node_log":
        if (msg.log?.node_id) {
          setNodeStates((prev) => ({
            ...prev,
            [msg.log.node_id]: msg.log,
          }));
          setActiveNodeId((current) =>
            current === msg.log.node_id ? null : current
          );
        }
        break;
      default:
        break;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!runId) return;

    disconnectRef.current?.();
    disconnectRef.current = null;

    const tokenGen = ++reconnectTokenRef.current;
    setError(null);
    setConnectionStatus("connecting");

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Sign in required to watch this run.");
        setConnectionStatus("error");
        return;
      }

      const { ws_url: wsUrl } = await getRunLiveConfigAPI(runId);
      const token = await user.getIdToken();

      if (tokenGen !== reconnectTokenRef.current) return;

      disconnectRef.current = connectFuseRunSocket({
        wsUrl,
        token,
        onEvent: applyEvent,
        onConnectionChange: setConnectionStatus,
      });
    } catch {
      if (tokenGen !== reconnectTokenRef.current) return;
      setError("Could not connect to live run updates.");
      setConnectionStatus("error");
    }
  }, [runId, applyEvent]);

  useEffect(() => {
    connect();
    return () => {
      reconnectTokenRef.current += 1;
      disconnectRef.current?.();
      disconnectRef.current = null;
    };
  }, [connect]);

  return {
    run,
    nodeStates,
    activeNodeId,
    connectionStatus,
    error,
    reconnect: connect,
  };
}
