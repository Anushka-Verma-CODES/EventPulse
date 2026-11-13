
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "./apiConfig";

export function connectNotificationSocket(): Socket | null {
  const token = sessionStorage.getItem("eventpulse_access_token");

  if (!token) {
    return null;
  }

  const socket = io(`${API_BASE_URL}/notifications`, {
    auth: {
      token,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return socket;
}
