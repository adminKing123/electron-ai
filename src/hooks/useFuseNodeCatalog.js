import { useEffect } from "react";
import { getStarterNodesAPI, getActionNodesAPI } from "../apis/fuse/queryFunctions";
import useFuseStudioStore from "../store/useFuseStudioStore";

/** Loads starter + action node definitions into the Fuse studio store. */
export default function useFuseNodeCatalog() {
  const setStarterNodes = useFuseStudioStore((s) => s.setStarterNodes);
  const setLoadingNodes = useFuseStudioStore((s) => s.setLoadingNodes);
  const setActionNodes = useFuseStudioStore((s) => s.setActionNodes);
  const setLoadingActionNodes = useFuseStudioStore((s) => s.setLoadingActionNodes);

  useEffect(() => {
    let cancelled = false;

    setLoadingNodes(true);
    getStarterNodesAPI()
      .then((nodes) => { if (!cancelled) setStarterNodes(nodes); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingNodes(false); });

    setLoadingActionNodes(true);
    getActionNodesAPI()
      .then((nodes) => { if (!cancelled) setActionNodes(nodes); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingActionNodes(false); });

    return () => {
      cancelled = true;
    };
  // Zustand setters are stable; run once per mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
