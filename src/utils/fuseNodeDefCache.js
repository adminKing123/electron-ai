/**
 * Node catalog loading:
 * 1. useFuseNodeCatalog — listing metadata (starter/actions list APIs)
 * 2. createFlowNodeFromListing — place node on canvas immediately
 * 3. ensureFuseNodeDef — full def when config panel opens (cached in nodeDefsByType)
 * 4. useMergeNodeConfigDefaults — apply definition defaults to canvas config once loaded
 */
import { getFuseNodeDefinitionAPI } from "../apis/fuse/queryFunctions";
import useFuseStudioStore from "../store/useFuseStudioStore";
import { createFuseNodeId } from "./helpers";
import { FUSE_DEFAULT_RUN_LOG_SAVE } from "./fuseNodeConfig";

/** @type {Map<string, Promise<object>>} */
const inflight = new Map();

/**
 * Load full node definition (config_form, defaults) once and cache in the studio store.
 * @param {string} nodeType
 * @returns {Promise<object>}
 */
export async function ensureFuseNodeDef(nodeType) {
  if (!nodeType) {
    throw new Error("nodeType is required");
  }

  const cached = useFuseStudioStore.getState().nodeDefsByType[nodeType];
  if (cached) return cached;

  const pending = inflight.get(nodeType);
  if (pending) return pending;

  const promise = getFuseNodeDefinitionAPI(nodeType)
    .then((def) => {
      useFuseStudioStore.getState().mergeNodeDef(def);
      return def;
    })
    .finally(() => {
      inflight.delete(nodeType);
    });

  inflight.set(nodeType, promise);
  return promise;
}

/** Fill config keys that are still undefined from node definition defaults. */
export function applyConfigDefaults(currentConfig, defaults) {
  if (!defaults || typeof defaults !== "object") {
    return currentConfig ?? {};
  }
  const out = { ...(currentConfig ?? {}) };
  for (const [key, value] of Object.entries(defaults)) {
    if (out[key] === undefined) out[key] = value;
  }
  return out;
}

/**
 * Picker listing row → React Flow node (immediate; full def loads in config panel).
 * @param {{ type: string, label: string, icon?: string, isStarter?: boolean }} listingMeta
 * @param {{ position: { x: number, y: number }, isStarter?: boolean }} options
 */
export function createFlowNodeFromListing(listingMeta, { position, isStarter = false }) {
  return {
    id: createFuseNodeId(),
    type: "fuse_node",
    position,
    data: {
      nodeType: listingMeta.type,
      label: listingMeta.label,
      icon: listingMeta.icon ?? null,
      config: { ...FUSE_DEFAULT_RUN_LOG_SAVE },
      isStarter: isStarter || listingMeta.isStarter === true,
    },
  };
}
