import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../api/client";

export function useSocket(token) {
  const socket = useMemo(() => {
    if (!token) return null;
    return io(API_URL, { auth: { token }, transports: ["websocket", "polling"] });
  }, [token]);

  useEffect(() => () => socket?.disconnect(), [socket]);

  return socket;
}
