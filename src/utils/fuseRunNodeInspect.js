const TOKEN_RE = /\{\{([^}]+)\}\}/g;

export function collectConfigTokens(config) {
  if (config == null) return [];
  let text;
  try {
    text = typeof config === "string" ? config : JSON.stringify(config);
  } catch {
    text = String(config);
  }
  const tokens = new Set();
  for (const match of text.matchAll(TOKEN_RE)) {
    tokens.add(match[1].trim());
  }
  return [...tokens].sort();
}

function resolvePath(data, pathStr) {
  if (data == null || !pathStr) return data;
  const parts = pathStr.split(".");
  let current = data;
  for (const part of parts) {
    if (current == null) return null;
    const isArray = part.endsWith("[]");
    const key = isArray ? part.slice(0, -2) : part;
    if (Array.isArray(current)) {
      current = current.map((item) =>
        item && typeof item === "object" ? item[key] : null
      );
    } else if (typeof current === "object") {
      current = current[key];
    } else {
      return null;
    }
  }
  return current;
}

function outputsMapFromNodeStates(nodeStates) {
  const map = {};
  for (const [nodeId, st] of Object.entries(nodeStates ?? {})) {
    if (st?.output != null) map[nodeId] = st.output;
  }
  return map;
}

export function resolveToken(token, nodeOutputs) {
  const inner = token.trim();
  const dot = inner.indexOf(".");
  if (dot === -1) return nodeOutputs[inner] ?? null;

  const nodeId = inner.slice(0, dot);
  const pathStr = inner.slice(dot + 1);
  const nodeData = nodeOutputs[nodeId] ?? {};
  let value = resolvePath(nodeData, pathStr);
  if (value == null) {
    const body = nodeData.body;
    if (body && typeof body === "object") {
      value = resolvePath(body, pathStr);
    }
  }
  return value ?? null;
}

export function resolveVariablesFromConfig(config, nodeStates) {
  const outputs = outputsMapFromNodeStates(nodeStates);
  const tokens = collectConfigTokens(config);
  const variables = {};
  for (const token of tokens) {
    variables[token] = resolveToken(token, outputs);
  }
  return variables;
}

