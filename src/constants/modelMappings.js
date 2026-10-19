/**
 * Centralised Comet model metadata — display names, accent colours, and
 * underlying Gemini model identifiers.
 *
 * Mirrors the model list in noney-api/routes/get_config.py; keep in sync
 * when new models are added to the backend.
 */

/** @type {Record<string, { name: string, geminiModel: string, color: string, colorAlpha: string }>} */
export const MODEL_META = {
  "noney-1.0-fast-20241001": {
    name: "Comet 1.0 Fast",
    geminiModel: "gemini-2.5-flash",
    color: "#6366f1",
    colorAlpha: "rgba(99,102,241,0.15)",
  },
  "noney-1.0-twinkle-20241001": {
    name: "Comet 1.0 Twinkle",
    geminiModel: "gemini-2.5-pro",
    color: "#8b5cf6",
    colorAlpha: "rgba(139,92,246,0.15)",
  },
  "noney-2.0-twinkle-20241001": {
    name: "Comet 2.0 Twinkle",
    geminiModel: "gemini-3-flash-preview",
    color: "#a855f7",
    colorAlpha: "rgba(168,85,247,0.15)",
  },
  "noney-code-gen-20241001": {
    name: "Comet Code Gen 1.0",
    geminiModel: "gemini-2.5-flash",
    color: "#10b981",
    colorAlpha: "rgba(16,185,129,0.15)",
  },
  "noney-code-gen-pro-20241001": {
    name: "Comet Code Gen Pro",
    geminiModel: "gemini-3-flash-preview",
    color: "#14b8a6",
    colorAlpha: "rgba(20,184,166,0.15)",
  },
  "noney-image-gen-20241001": {
    name: "Comet Image Gen 1.0",
    geminiModel: "imagen-4.0-generate-001",
    color: "#f43f5e",
    colorAlpha: "rgba(244,63,94,0.15)",
  },
  "noney-hrms-assistant-20241001": {
    name: "HRMS Assistant 1.0",
    geminiModel: "gemini-2.5-flash",
    color: "#f59e0b",
    colorAlpha: "rgba(245,158,11,0.15)",
  },
  "noney-hrms-assistant-pro-20241001": {
    name: "HRMS Assistant Pro",
    geminiModel: "gemini-3-flash-preview",
    color: "#f97316",
    colorAlpha: "rgba(249,115,22,0.15)",
  },
};

/** Fallback metadata for unknown or legacy model IDs. */
export const UNKNOWN_MODEL_META = {
  name: "Unknown Model",
  geminiModel: "",
  color: "#9ca3af",
  colorAlpha: "rgba(156,163,175,0.15)",
};

/**
 * Returns display metadata for a model ID, falling back to UNKNOWN_MODEL_META.
 * @param {string} modelId
 */
export const getModelMeta = (modelId) =>
  MODEL_META[modelId] ?? { ...UNKNOWN_MODEL_META, name: modelId || "Unknown" };

/** Returns the human-readable display name for a model ID. */
export const getModelName = (modelId) => getModelMeta(modelId).name;

/** Returns the accent colour hex string for a model ID. */
export const getModelColor = (modelId) => getModelMeta(modelId).color;
