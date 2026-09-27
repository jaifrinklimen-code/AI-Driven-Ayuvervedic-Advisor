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

  // If already an absolute external web URL (not pointing to local backend /data), return as is
  if (
    (url.startsWith("http://") || url.startsWith("https://")) &&
    !url.startsWith("http://localhost:8000/data/") &&
    !url.startsWith("http://127.0.0.1:8000/data/")
  ) {
    return url;
  }

  // Strip local host prefix if present
  let clean = url.replace(/^http:\/\/(localhost|127\.0\.0\.1):8000/, "");

  // Separate hash fragment (e.g. #page=10) from the path
  let hash = "";
  const hashIdx = clean.indexOf("#");
  if (hashIdx !== -1) {
    hash = clean.slice(hashIdx);
    clean = clean.slice(0, hashIdx);
  }

  // Normalize path to /data/{filename}
  let filename = clean;
  if (filename.startsWith("/data/")) {
    filename = filename.slice(6);
  } else if (filename.startsWith("data/")) {
    filename = filename.slice(5);
  } else if (filename.startsWith("/")) {
    filename = filename.slice(1);
  }

  // If it's a PDF filename, properly encode the filename while preserving extension
  if (filename.toLowerCase().includes(".pdf")) {
    // Decode first to prevent double-encoding (%20 -> %2520)
    try {
      filename = decodeURIComponent(filename);
    } catch {
      // keep as is if malformed
    }
    const encodedFilename = encodeURIComponent(filename);
    return `${getApiUrl(`/data/${encodedFilename}`)}${hash}`;
  }

  return `${getApiUrl(clean)}${hash}`;
};

