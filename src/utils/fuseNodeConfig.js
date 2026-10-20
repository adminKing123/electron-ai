/** Default run-log persistence flags (matches backend executor). */
export const FUSE_DEFAULT_RUN_LOG_SAVE = {
  save_output: true,
  save_input: true,
  save_config: true,
  save_variables: true,
};

/** Default true when unset — field is save_output | save_input | save_config | save_variables */
export function fuseRunLogSaveEnabled(config, field) {
  return config?.[field] !== false;
}

/** @deprecated use fuseRunLogSaveEnabled(config, "save_output") */
export function fuseSaveOutputEnabled(config) {
  return fuseRunLogSaveEnabled(config, "save_output");
}
