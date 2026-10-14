/**
 * fuseRunSocket.js
 * Connects to a per-run WebSocket room (URL includes run_id).
 * Auth: first message is `{ type: "auth", token }` only.
 */

const AUTH_TIMEOUT_MS = 30_000;

/**
 * @param {{ wsUrl: string, token: string, onEvent: (msg: object) => void, onConnectionChange?: (status: string) => void }} opts
 * @returns {() => void} disconnect
 */
export function connectFuseRunSocket({
  wsUrl,
  token,
  onEvent,
  onConnectionChange,
}) {
  let ws = null;
  let closed = false;
  let authTimer = null;

  const setStatus = (status) => {
    onConnectionChange?.(status);
  };

  const cleanup = () => {
    closed = true;
    if (authTimer) clearTimeout(authTimer);
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      ws = null;
    }
  };

  try {
    setStatus("connecting");
    ws = new WebSocket(wsUrl);

    authTimer = setTimeout(() => {
      if (!closed) {
        setStatus("error");
        cleanup();
      }
    }, AUTH_TIMEOUT_MS);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "auth", token }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (authTimer) {
          clearTimeout(authTimer);
          authTimer = null;
          setStatus("connected");
        }
        onEvent(msg);
      } catch {
        // ignore malformed frames
      }
    };

    ws.onerror = () => {
      if (!closed) setStatus("error");
    };

    ws.onclose = () => {
      if (!closed) setStatus("disconnected");
      cleanup();
    };
  } catch {
    setStatus("error");
    cleanup();
  }

  return cleanup;
}
