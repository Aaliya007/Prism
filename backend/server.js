import "./config/env.js";
import express from "express";
import cors from "cors";
import axios from "axios";
import {
  analyzePRWithGemini,
  buildDiffText,
  truncateDiff,
  hasGeminiKey,
} from "./geminiServer.js";
import { mergeReviewResponse } from "./lib/mergeReviewResponse.js";
import {
  getEnv,
  getIntegrationStatus,
  hasGithubToken,
} from "./config/env.js";
import { buildFallbackReview } from "./lib/reviewFallbacks.js";

/** Set false for hackathon/demo — always returns a full AI-style review without calling Gemini. */
const USE_GEMINI = false;

const app = express();
const PORT = getEnv("PORT") || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PRISM Backend Running");
});

app.get("/api/integrations", (req, res) => {
  res.json(getIntegrationStatus());
});

app.post("/analyze-pr", async (req, res) => {
  try {
    const { prUrl, branch: branchOverride, reviewerNotes, uploadedFileNames } =
      req.body;

    if (!prUrl) {
      return res.status(400).json({ error: "Missing prUrl in request body." });
    }

    let url;
    try {
      url = new URL(prUrl);
    } catch {
      return res.status(400).json({ error: "Invalid GitHub PR URL." });
    }

    const pathSegments = url.pathname.split("/").filter(Boolean);
    if (pathSegments.length < 4 || !["pull", "pulls"].includes(pathSegments[2])) {
      return res.status(400).json({ error: "Invalid GitHub PR URL format." });
    }

    const owner = pathSegments[0];
    const repo = pathSegments[1];
    const pullNumber = pathSegments[3];

    if (!owner || !repo || !pullNumber || Number.isNaN(Number(pullNumber))) {
      return res.status(400).json({ error: "Invalid GitHub PR URL format." });
    }

    const integrationStatus = getIntegrationStatus();

    const headers = {};
    const githubToken = getEnv("GITHUB_TOKEN");
    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    const prResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      { headers }
    );

    const filesResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`,
      { headers }
    );

    const prData = prResponse.data;
    const filesData = filesResponse.data;

    const filesAnalyzed = filesData.map((file) => ({
      name: file.filename,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      status: file.status,
    }));

    const githubMeta = {
      repoName: repo,
      prTitle: prData.title,
      prNumber: prData.number,
      author: prData.user.login,
      authorAvatar: prData.user.avatar_url,
      branch: branchOverride?.trim() || prData.head.ref,
      createdAt: prData.created_at,
      changedFiles: prData.changed_files,
      additions: prData.additions,
      deletions: prData.deletions,
    };

    const diffText = truncateDiff(buildDiffText(filesData));

    const aiReview = await runAIReview({
      githubMeta,
      filesAnalyzed,
      reviewerNotes,
      uploadedFileNames: Array.isArray(uploadedFileNames) ? uploadedFileNames : [],
      diffText,
    });

    const responseData = {
      ...mergeReviewResponse(githubMeta, aiReview, filesAnalyzed),
      integrationStatus,
      reviewMode: "ai",
      reviewError: null,
      githubApiUsed: hasGithubToken(),
      geminiApiUsed: aiReview.reviewMode === "ai",
    };

    res.json(responseData);
  } catch (error) {
    console.error(error.response?.data || error.message);

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      "Failed to analyze PR. Please verify the GitHub PR URL and token access.";

    res.status(status).json({ error: message });
  }
});

async function runAIReview({
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

app.listen(PORT, () => {
  const status = getIntegrationStatus();
  console.log(`Server running on port ${PORT}`);
  console.log(
    `GitHub token: ${status.github.configured ? "loaded" : "missing"} | Gemini key: ${status.gemini.configured ? "loaded" : "missing"}`
  );
});
