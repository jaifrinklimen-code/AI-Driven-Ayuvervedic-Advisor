/**
 * Centralized API Gateway configuration for IP-SAKTI Sahayak
 * Configures the backend API URL. In development, defaults to localhost:8000.
 * In production builds, avoids hardcoded localhost and defaults to current host or VITE_BACKEND_URL.
 */

const getInitialBase = (): string => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "");
  }
  // In dev mode, default to the local FastAPI dev port
  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }
  // In production without an explicit VITE_BACKEND_URL, use relative origin or window.location.origin
  return typeof window !== "undefined" ? window.location.origin : "";
};

export const API_BASE = getInitialBase();

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};


export const formatCitationUrl = (url: string | undefined | null): string => {
  if (!url) return "#";

  if (url.startsWith("http://localhost:8000/data/") || url.startsWith("http://127.0.0.1:8000/data/")) {
    const relativePath = url.replace(/^http:\/\/(localhost|127\.0\.0\.1):8000/, "");
    return getApiUrl(relativePath);
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/data/")) {
    return getApiUrl(url);
  }
  if (url.startsWith("data/")) {
    return getApiUrl(`/${url}`);
  }

  if (url.toLowerCase().includes(".pdf")) {
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return getApiUrl(`/data${cleanPath}`);
  }

  return url;
};
