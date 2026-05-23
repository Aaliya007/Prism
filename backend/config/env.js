import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_FREE_MODEL, FREE_TIER_MODELS } from "./geminiModels.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, "..");
const projectRoot = path.resolve(backendDir, "..");

dotenv.config({ path: path.join(backendDir, ".env") });
dotenv.config({ path: path.join(projectRoot, ".env") });

export function getEnv(name) {
  const value = process.env[name];
  if (value == null) return "";
  return String(value).trim();
}

export function hasGeminiKey() {
  return getEnv("GEMINI_API_KEY").length > 0;
}

export function hasGithubToken() {
  return getEnv("GITHUB_TOKEN").length > 0;
}

export function getGeminiModelLabel() {
  const configured = getEnv("GEMINI_MODEL");
  if (configured) return configured;
  return `${DEFAULT_FREE_MODEL} (free tier)`;
}

export function getIntegrationStatus() {
  return {
    github: {
      configured: hasGithubToken(),
      label: "GitHub API",
      envVar: "GITHUB_TOKEN",
    },
    gemini: {
      configured: hasGeminiKey(),
      label: "Gemini API",
      envVar: "GEMINI_API_KEY",
      model: getGeminiModelLabel(),
      tier: "free",
      fallbackModels: FREE_TIER_MODELS,
    },
  };
}
