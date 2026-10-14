/**
 * Merge workflow run-list WebSocket events into the current table page (newest first).
 */
export function applyRunListEvent(runs, event, pageIndex, pageSize = 20) {
  const run = event?.run;
  if (!run?.run_id) return runs;

  const idx = runs.findIndex((r) => r.run_id === run.run_id);
  if (idx >= 0) {
    const next = [...runs];
    next[idx] = { ...next[idx], ...run };
    return next;
  }

  if (pageIndex !== 0) return runs;

  if (event.type === "run_started") {
    return [run, ...runs].slice(0, pageSize);
  }

  if (event.type === "run_finished") {
    return [run, ...runs.filter((r) => r.run_id !== run.run_id)].slice(0, pageSize);
  }

  if (event.type === "run_update") {
    return [run, ...runs.filter((r) => r.run_id !== run.run_id)].slice(0, pageSize);
  }

  return runs;
}
