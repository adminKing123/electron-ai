/** Default true when unset — matches backend executor._should_persist_output. */
export function fuseSaveOutputEnabled(config) {
  return config?.save_output !== false;
}
