import { useCallback, useEffect, useRef } from "react";
import { auth } from "../firebase/index";
import { connectFuseRunSocket } from "../utils/fuseRunSocket";

/**
 * Shared mount/unmount lifecycle for Fuse live WebSocket rooms.
 * Cancels in-flight connects on unmount and always closes the socket.
 */
export default function useFuseLiveSocket({ enabled, fetchWsUrl, onEvent, onConnectionChange }) {
  const disconnectRef = useRef(null);
  const generationRef = useRef(0);
  const mountedRef = useRef(false);

  const disconnect = useCallback(() => {
    disconnectRef.current?.();
    disconnectRef.current = null;
  }, []);

  const connect = useCallback(async () => {
    if (!enabled) return;

    disconnect();
    const generation = ++generationRef.current;

    try {
      const user = auth.currentUser;
      if (!user) {
        if (mountedRef.current && generation === generationRef.current) {
          onConnectionChange?.("error");
        }
        return;
      }

      const wsUrl = await fetchWsUrl();
      const token = await user.getIdToken();

      if (!mountedRef.current || generation !== generationRef.current) return;

      const socketDisconnect = connectFuseRunSocket({
        wsUrl,
        token,
        onEvent: (msg) => {
          if (mountedRef.current) onEvent(msg);
        },
        onConnectionChange: (status) => {
          if (mountedRef.current) onConnectionChange?.(status);
        },
      });

      if (!mountedRef.current || generation !== generationRef.current) {
        socketDisconnect();
        return;
      }

      disconnectRef.current = socketDisconnect;
    } catch {
      if (mountedRef.current && generation === generationRef.current) {
        onConnectionChange?.("error");
      }
    }
  }, [enabled, fetchWsUrl, onEvent, onConnectionChange, disconnect]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      disconnect();
      onConnectionChange?.("idle");
    };
  }, [connect, disconnect, onConnectionChange]);

  return { reconnect: connect, disconnect };
}
