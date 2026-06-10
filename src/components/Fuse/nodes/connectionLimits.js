// ─── Connection limits ────────────────────────────────────────────────────────
/**
 * Maximum number of outgoing edges allowed per node type.
 *
 * Any type NOT listed here defaults to 1 (single linear connection).
 * To enable multi-branch behaviour for a future node (e.g. "if_else"),
 * simply add an entry — no other code needs to change.
 *
 * Examples:
 *   if_else: 2   → exactly two outgoing branches (true / false)
 *   fork:    Infinity  → unlimited outgoing edges
 */
export const NODE_OUTGOING_LIMIT = {
  if_else: 2, // true + false branch, one edge each
};

/** Returns the maximum outgoing edges allowed for the given node type. */
export const getOutgoingLimit = (nodeType) =>
  NODE_OUTGOING_LIMIT[nodeType] ?? 1;
