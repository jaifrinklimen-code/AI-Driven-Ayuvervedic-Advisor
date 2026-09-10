/**
 * Centralized API Gateway configuration for IP-SAKTI Sahayak
 */

export const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};
