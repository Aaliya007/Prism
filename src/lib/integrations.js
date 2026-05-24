/**
 * Normalize /api/integrations payload for UI (reads `configured` only).
 */
export function normalizeIntegrations(raw) {
  if (!raw || typeof raw !== "object") return null;

  const githubConfigured = Boolean(raw.github?.configured);
  const geminiConfigured = Boolean(raw.gemini?.configured);

  return {
    github: {
      ...raw.github,
      configured: githubConfigured,
      label: raw.github?.label ?? "GitHub API",
      envVar: raw.github?.envVar ?? "GITHUB_TOKEN",
    },
    gemini: {
      ...raw.gemini,
      configured: geminiConfigured,
      label: raw.gemini?.label ?? "Gemini API",
      envVar: raw.gemini?.envVar ?? "GEMINI_API_KEY",
    },
  };
}
