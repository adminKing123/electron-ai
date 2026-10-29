/**
 * Shared helpers for body_builder / json_value_builder envelopes.
 */

export const ROOT_JSON_TYPES = ["object", "array", "string", "number", "boolean"];

export const JSON_NESTED_FIELD_TYPES = [
  "string",
  "number",
  "boolean",
  "array",
  "object",
];

export const JSON_ENVELOPE_FIELD_TYPES = new Set([
  "body_builder",
  "json_value_builder",
]);

export const coerceRootType = (raw) =>
  ROOT_JSON_TYPES.includes(raw) ? raw : "object";

export const patchVisualEnvelope = (value, rootType, patch) => ({
  mode: "visual",
  rootType: coerceRootType(rootType ?? value?.rootType),
  ...patch,
});

export const applyJsonEnvelopeRootType = (
  value,
  newRoot,
  { isValueBuilder = false } = {},
) => {
  const current = value && typeof value === "object" ? value : { mode: "visual" };
  const next = { mode: "visual", rootType: newRoot };
  if (newRoot === "object") {
    next.fields = current.fields ?? [];
  } else if (newRoot === "array") {
    if (isValueBuilder) next.elements = current.elements ?? [];
    else next.items = current.items ?? { type: "string" };
  } else {
    next.value = current.value ?? "";
  }
  return next;
};

function rootValueVariable(token, baseLabel, { isArray = false } = {}) {
  return {
    token,
    label: `${baseLabel} · body`,
    isRoot: true,
    isArray,
  };
}

/**
 * Map visual envelopes to @-picker entries (includes a body row when applicable).
 */
export function collectEnvelopeVariables(envelope, opts) {
  const {
    basePath,
    baseLabel,
    flattenFields,
    scalarPath,
    exposeEmptyObject = true,
    includeRootWhenObjectHasFields = true,
  } = opts;
  if (!envelope || envelope.mode !== "visual") return [];

  const root = coerceRootType(envelope.rootType);
  const scalarToken = scalarPath ?? basePath;

  if (root === "object") {
    const fields = envelope.fields ?? [];
    if (!fields.length) {
      if (!exposeEmptyObject) return [];
      return [rootValueVariable(basePath, baseLabel)];
    }
    const nested = flattenFields(fields, basePath, baseLabel);
    if (!includeRootWhenObjectHasFields) return nested;
    return [rootValueVariable(basePath, baseLabel), ...nested];
  }

  if (root === "array") {
    const out = [rootValueVariable(scalarToken, baseLabel, { isArray: true })];
    const items = envelope.items;
    if (items?.type === "object" && (items.fields ?? []).length) {
      out.push(
        ...flattenFields(items.fields, `${basePath}[]`, `${baseLabel}[]`),
      );
    }
    return out;
  }

  return [rootValueVariable(scalarToken, baseLabel)];
}
