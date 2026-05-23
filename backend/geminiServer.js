import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "./prompts/systemPrompt.js";
import { buildReviewUserPrompt } from "./lib/buildReviewUserPrompt.js";
import { getEnv, hasGeminiKey } from "./config/env.js";
import { DEFAULT_FREE_MODEL, FREE_TIER_MODELS } from "./config/geminiModels.js";
const MAX_DIFF_CHARS = 48_000;

function resolveModelChain() {
  const preferred = getEnv("GEMINI_MODEL");
  if (!preferred) return [...FREE_TIER_MODELS];
  return [preferred, ...FREE_TIER_MODELS.filter((m) => m !== preferred)];
}

function buildDiffText(filesData) {
  return filesData
    .map((file) => {
      const header = `--- ${file.filename} (${file.status}) +${file.additions}/-${file.deletions}`;
      const patch = file.patch ?? "(patch unavailable — file may be binary or too large)";
      return `${header}\n${patch}`;
    })
    .join("\n\n");
}

function truncateDiff(diffText) {
  if (diffText.length <= MAX_DIFF_CHARS) return diffText;
  return `${diffText.slice(0, MAX_DIFF_CHARS)}\n\n[diff truncated for free-tier context limit]`;
}

function parseGeminiJson(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

function isRetryableGeminiError(error) {
  const msg = String(error?.message ?? error).toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource_exhausted") ||
    msg.includes("not found") ||
    msg.includes("404")
  );
}

function parseRetryDelayMs(error) {
  const match = String(error?.message ?? "").match(/retry in ([\d.]+)s/i);
  if (!match) return 2000;
  return Math.min(30_000, Math.ceil(Number(match[1]) * 1000) + 500);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithModel(genAI, modelName, userPrompt) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
  });
  const result = await model.generateContent(userPrompt);
  const response = await result.response;
  return response.text();
}

export { buildDiffText, truncateDiff, hasGeminiKey, DEFAULT_FREE_MODEL };

export async function analyzePRWithGemini({
  repoName,
  prTitle,
  prNumber,
  author,
  authorAvatar,
  branch,
  changedFiles,
  reviewerNotes,
  uploadedFileNames,
  diffText,
}) {
  if (!hasGeminiKey()) {
    return {
      error: "GEMINI_API_KEY is not configured",
      code: "gemini_key_missing",
    };
  }

  const userPrompt = buildReviewUserPrompt({
    repoName,
    prTitle,
    prNumber,
    author,
    authorAvatar,
    branch,
    changedFiles,
    reviewerNotes,
    uploadedFileNames,
    diffText: truncateDiff(diffText),
  });

  const apiKey = getEnv("GEMINI_API_KEY");
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = resolveModelChain();
  const failures = [];

  for (const modelName of modelsToTry) {
    try {
      const text = await generateWithModel(genAI, modelName, userPrompt);
      const parsed = parseGeminiJson(text);
      return {
        ...parsed,
        reviewMode: "ai",
        geminiModel: modelName,
        geminiTier: "free",
      };
    } catch (error) {
      failures.push({ model: modelName, message: error.message });
      console.warn(`[Gemini] ${modelName} failed:`, error.message);

      if (isRetryableGeminiError(error)) {
        await sleep(parseRetryDelayMs(error));
        continue;
      }

      return {
        error: "Failed to analyze PR with Gemini",
        code: "gemini_api_error",
        details: error.message,
        modelsAttempted: failures,
      };
    }
  }

  const last = failures[failures.length - 1]?.message ?? "All free-tier models failed";
  const quotaHit = failures.some((f) => /429|quota/i.test(f.message));

  return {
    error: "Failed to analyze PR with Gemini",
    code: quotaHit ? "gemini_quota_exceeded" : "gemini_api_error",
    details: quotaHit
      ? "Free-tier quota exceeded. Wait ~1 minute and try again, or enable billing in Google AI Studio."
      : last,
    modelsAttempted: failures,
  };
}
