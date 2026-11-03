const configuredApiUrl = (import.meta as ImportMeta & {
  env?: { VITE_API_BASE_URL?: string };
}).env?.VITE_API_BASE_URL;

export const API_BASE_URL = (
  configuredApiUrl ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : window.location.hostname === "172.16.78.105"
      ? "http://172.16.78.105:3000"
      : "https://eventpulse-toa3.onrender.com")
).replace(/\/+$/, "");