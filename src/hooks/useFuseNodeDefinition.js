import { useEffect, useState } from "react";
import useFuseStudioStore from "../store/useFuseStudioStore";
import {
  applyConfigDefaults,
  ensureFuseNodeDef,
} from "../utils/fuseNodeDefCache";

function findListingMeta(nodeType, starterNodes, actionNodes) {
  if (!nodeType) return null;
  for (const n of starterNodes) {
    if (n.type === nodeType) return n;
  }
  for (const n of actionNodes) {
    if (n.type === nodeType) return n;
  }
  return null;
}

/** Header + form shell when catalog/detail is not available yet (e.g. legacy canvas types). */
export function nodeDefForConfigPanel(catalogNodeDef, canvasNode) {
  if (catalogNodeDef) return catalogNodeDef;
  if (!canvasNode?.data) return null;
  return {
    type: canvasNode.data.nodeType,
    label: canvasNode.data.label ?? canvasNode.data.nodeType,
    icon: canvasNode.data.icon,
  };
}

/**
 * After full definition loads, fill undefined config keys from node defaults.
 */
export function useMergeNodeConfigDefaults(selectedNodeId, isDetailLoaded, fullDef) {
  const updateNodeConfig = useFuseStudioStore((s) => s.updateNodeConfig);

  useEffect(() => {
    if (!selectedNodeId || !isDetailLoaded || !fullDef?.defaults) return;

    const node = useFuseStudioStore
      .getState()
      .nodes.find((n) => n.id === selectedNodeId);
    if (!node) return;

    const current = node.data.config ?? {};
    const merged = applyConfigDefaults(current, fullDef.defaults);
    const changed = Object.keys(merged).some((k) => merged[k] !== current[k]);
    if (changed) updateNodeConfig(selectedNodeId, merged);
  }, [selectedNodeId, isDetailLoaded, fullDef, updateNodeConfig]);
}

/**
 * Listing metadata from catalog + lazily loaded full definition (config_form, defaults).
 */
export default function useFuseNodeDefinition(nodeType) {
  const cached = useFuseStudioStore((s) =>
    nodeType ? s.nodeDefsByType[nodeType] : null,
  );
  const listingMeta = useFuseStudioStore((s) =>
    findListingMeta(nodeType, s.starterNodes, s.actionNodes),
  );

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!nodeType || cached) {
      setError(null);
      return;
    }

    let cancelled = false;
    setError(null);

    ensureFuseNodeDef(nodeType).catch((err) => {
      if (!cancelled) setError(err);
    });

    return () => {
      cancelled = true;
    };
  }, [nodeType, cached]);

  const isDetailLoaded = Boolean(cached);
  const catalogNodeDef = cached ?? listingMeta;

  return {
    catalogNodeDef,
    fullDef: cached,
    isDetailLoaded,
    /** True while detail is not cached yet and no error (show config panel skeleton). */
    loadingConfigForm: !isDetailLoaded && !error,
    error,
  };
}
