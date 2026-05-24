import { analyzePRWithGemini, hasGeminiKey } from "../geminiServer.js";
import { buildFallbackReview } from "../lib/reviewFallbacks.js";

/** Set false for hackathon/demo — always returns a full AI-style review without calling Gemini. */
export const USE_GEMINI = false;

export async function runAIReview({
  githubMeta,
  filesAnalyzed,
  reviewerNotes,
  uploadedFileNames,
  diffText,
}) {
  const fallbackCtx = { filesAnalyzed, githubMeta, reviewerNotes };

  if (!USE_GEMINI) {
    return buildFallbackReview(fallbackCtx);
  }

  try {
    if (!hasGeminiKey()) {
      return buildFallbackReview(fallbackCtx);
    }

    const result = await analyzePRWithGemini({
      repoName: githubMeta.repoName,
      prTitle: githubMeta.prTitle,
      prNumber: githubMeta.prNumber,
      author: githubMeta.author,
      authorAvatar: githubMeta.authorAvatar,
      branch: githubMeta.branch,
      changedFiles: filesAnalyzed,
      reviewerNotes,
      uploadedFileNames,
      diffText,
    });

    if (result?.error) {
      console.warn(
        "[PRISM] Gemini unavailable, using simulated review:",
        result.details ?? result.error
      );
      return buildFallbackReview(fallbackCtx);
    }

    return result;
  } catch (error) {
    console.warn("[PRISM] Gemini threw, using simulated review:", error.message);
    return buildFallbackReview(fallbackCtx);
  }
}
