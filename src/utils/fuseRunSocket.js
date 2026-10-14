/**
 * fuseRunSocket.js
 * Low-level Fuse live WebSocket client. Returns an idempotent disconnect().
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
  let disposed = false;
  let authTimer = null;

  const setStatus = (status) => {
    if (!disposed) onConnectionChange?.(status);
  };

  const disconnect = () => {
    if (disposed) return;
    disposed = true;

    if (authTimer) {
      clearTimeout(authTimer);
      authTimer = null;
    }

    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, "client disconnect");
      }
      ws = null;
    }

    setStatus("disconnected");
  };

  try {
    setStatus("connecting");
    ws = new WebSocket(wsUrl);

    authTimer = setTimeout(() => {
      if (!disposed) {
        setStatus("error");
        disconnect();
      }
    }, AUTH_TIMEOUT_MS);

    ws.onopen = () => {
      if (disposed) return;
      ws.send(JSON.stringify({ type: "auth", token }));
    };

    ws.onmessage = (event) => {
      if (disposed) return;
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
      if (!disposed) setStatus("error");
    };

    ws.onclose = () => {
      if (!disposed) setStatus("disconnected");
      disconnect();
    };
  } catch {
    setStatus("error");
    disconnect();
  }

  return disconnect;
}
