export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function fetchIntegrationStatus() {
  const response = await fetch(`${API_BASE}/api/integrations`);
  if (!response.ok) {
    throw new Error("Failed to load API integration status");
  }
  return response.json();
}

export async function fetchGithubLiveStatus() {
  const response = await fetch(`${API_BASE}/github/live-status`);
  if (!response.ok) {
    throw new Error("Failed to load GitHub live status");
  }
  return response.json();
}
