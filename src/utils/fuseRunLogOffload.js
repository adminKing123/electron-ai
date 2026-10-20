/** Max characters rendered inline in run panels; full data via CDN "Open file". */
export const RUN_LOG_INLINE_PREVIEW_MAX_CHARS = 8_000;

function isRunLogOffloaded(value) {
  return (
    value &&
    typeof value === "object" &&
    value._offloaded === true &&
    typeof value.url === "string"
  );
}

function toPreviewString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/**
 * Truncate serialized JSON/text for in-panel preview.
 * Returns { preview, truncated, totalChars }.
 */
function truncateRunLogPreview(value, maxChars = RUN_LOG_INLINE_PREVIEW_MAX_CHARS) {
  const full = toPreviewString(value);
  if (full.length <= maxChars) {
    return { preview: value, truncated: false, totalChars: full.length };
  }
  const slice = full.slice(0, maxChars);
  return {
    preview: `${slice}\n\n… [truncated — ${full.length.toLocaleString()} characters total. Use Open file for full content.]`,
    truncated: true,
    totalChars: full.length,
  };
}

/**
 * Run-log field display: CDN refs are not fetched (too large); inline values are preview-truncated.
 */
export function useRunLogFieldDisplay(value, maxChars = RUN_LOG_INLINE_PREVIEW_MAX_CHARS) {
  const offloaded = isRunLogOffloaded(value);

  if (offloaded) {
    return {
      displayValue: null,
      offloaded: true,
      offloadMeta: value,
      truncated: true,
    };
  }

  const { preview, truncated, totalChars } = truncateRunLogPreview(value, maxChars);

  return {
    displayValue: preview,
    offloaded: false,
    offloadMeta: null,
    truncated,
    totalChars,
  };
}
