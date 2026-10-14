import { useCallback, useRef } from "react";
import { getWorkflowRunsLiveConfigAPI } from "../apis/fuse/queryFunctions";
import { applyRunListEvent } from "../utils/fuseRunListMerge";
import useFuseLiveSocket from "./useFuseLiveSocket";

/**
 * Live run-list updates for /fuse/studio/:id/runs (workflow room).
 */
export default function useFuseWorkflowRunsLive(workflowId, pageIndex, setRuns) {
  const pageRef = useRef(pageIndex);
  pageRef.current = pageIndex;

  const fetchWsUrl = useCallback(async () => {
    const { ws_url: wsUrl } = await getWorkflowRunsLiveConfigAPI(workflowId);
    return wsUrl;
  }, [workflowId]);

  const applyEvent = useCallback(
    (msg) => {
      if (!msg?.run && msg?.type !== "run_started" && msg?.type !== "run_finished") {
        return;
      }
      setRuns((prev) => applyRunListEvent(prev, msg, pageRef.current));
    },
    [setRuns]
  );

  const { reconnect: reconnectLive } = useFuseLiveSocket({
    enabled: Boolean(workflowId),
    fetchWsUrl,
    onEvent: applyEvent,
  });

  return { reconnectLive };
}
