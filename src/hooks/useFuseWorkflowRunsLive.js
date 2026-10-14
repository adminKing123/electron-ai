import { useCallback, useEffect, useRef } from "react";
import { auth } from "../firebase/index";
import { getWorkflowRunsLiveConfigAPI } from "../apis/fuse/queryFunctions";
import { connectFuseRunSocket } from "../utils/fuseRunSocket";
import { applyRunListEvent } from "../utils/fuseRunListMerge";

/**
 * Live run-list updates for /fuse/studio/:id/runs (workflow room).
 */
export default function useFuseWorkflowRunsLive(workflowId, pageIndex, setRuns) {
  const disconnectRef = useRef(null);
  const reconnectTokenRef = useRef(0);
  const pageRef = useRef(pageIndex);

  pageRef.current = pageIndex;

  const applyEvent = useCallback(
    (msg) => {
      if (!msg?.run && msg?.type !== "run_started" && msg?.type !== "run_finished") {
        return;
      }
      setRuns((prev) => applyRunListEvent(prev, msg, pageRef.current));
    },
    [setRuns]
  );

  const connect = useCallback(async () => {
    if (!workflowId) return;

    disconnectRef.current?.();
    disconnectRef.current = null;

    const tokenGen = ++reconnectTokenRef.current;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const { ws_url: wsUrl } = await getWorkflowRunsLiveConfigAPI(workflowId);
      const token = await user.getIdToken();

      if (tokenGen !== reconnectTokenRef.current) return;

      disconnectRef.current = connectFuseRunSocket({
        wsUrl,
        token,
        onEvent: applyEvent,
      });
    } catch {
      // list still works via REST; live updates are best-effort
    }
  }, [workflowId, applyEvent]);

  useEffect(() => {
    connect();
    return () => {
      reconnectTokenRef.current += 1;
      disconnectRef.current?.();
      disconnectRef.current = null;
    };
  }, [connect]);

  return { reconnectLive: connect };
}
