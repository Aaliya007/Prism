export const API_BASE = import.meta.env.VITE_API_BASE;
export const DISPLAY_API_BASE = import.meta.env.VITE_API_BASE || window.location.origin;

console.log("[PRISM] VITE_API_BASE", import.meta.env.VITE_API_BASE);

export function apiUrl(path) {
  const trimmed = String(path || "").trim();

  if (!trimmed) {
    throw new Error("Invalid API path");
  }

  if (API_BASE) {
    const base = API_BASE.replace(/\/+$/, "");
    return `${base}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(apiUrl(path), options);

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API request failed: ${response.status}`);
  }

  if (!contentType.includes("application/json")) {
    const bodyText = await response.text();
    throw new Error(
      `Expected JSON response from API but got ${contentType}: ${bodyText.slice(0, 200)}`
    );
  }

  return response.json();
}

export async function fetchIntegrationStatus() {
  return apiFetch("/api/integrations");
}

export async function fetchGithubLiveStatus() {
  return apiFetch("/github/live-status");
}
