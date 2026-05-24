import axios from "axios";
import { buildDiffText, truncateDiff } from "../geminiServer.js";
import { mergeReviewResponse } from "../lib/mergeReviewResponse.js";
import {
  getEnv,
  getIntegrationStatus,
  hasGithubToken,
} from "../config/env.js";
import { calculatePRScore } from "../lib/prScoreEngine.js";
import { enrichFilesWithRisk } from "../lib/fileRiskEngine.js";
import { generateActionLayer } from "../lib/actionEngine.js";
import { parsePrUrl } from "../lib/parsePrUrl.js";
import { runAIReview } from "./runAIReview.js";

/**
 * Full PRISM analysis pipeline (GitHub + AI + heuristics).
 * Used by POST /analyze-pr and GitHub webhooks.
 */
export async function analyzePullRequest({
  prUrl,
  branch: branchOverride,
  reviewerNotes,
  uploadedFileNames = [],
}) {
  if (!prUrl) {
    const err = new Error("Missing prUrl.");
    err.status = 400;
    throw err;
  }

  const { owner, repo, pullNumber } = parsePrUrl(prUrl);

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

  const filePatches = filesData.map((file) => ({
    name: file.filename,
    patch: file.patch ?? "",
  }));

  const filesAnalyzed = enrichFilesWithRisk(
    filesData.map((file) => ({
      name: file.filename,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      status: file.status,
    })),
    filePatches
  );

  const githubMeta = {
    repoName: repo,
    repoFullName: `${owner}/${repo}`,
    prTitle: prData.title,
    prNumber: prData.number,
    author: prData.user.login,
    authorAvatar: prData.user.avatar_url,
    branch: branchOverride?.trim() || prData.head.ref,
    createdAt: prData.created_at,
    changedFiles: prData.changed_files,
    additions: prData.additions,
    deletions: prData.deletions,
    prUrl,
  };

  const diffText = truncateDiff(buildDiffText(filesData));

  const aiReview = await runAIReview({
    githubMeta,
    filesAnalyzed,
    reviewerNotes,
    uploadedFileNames: Array.isArray(uploadedFileNames) ? uploadedFileNames : [],
    diffText,
  });

  const integrationStatus = getIntegrationStatus();

  const responseData = {
    ...mergeReviewResponse(githubMeta, aiReview, filesAnalyzed),
    integrationStatus,
    reviewMode: "ai",
    reviewError: null,
    githubApiUsed: hasGithubToken(),
    geminiApiUsed: aiReview.reviewMode === "ai",
    prUrl,
  };

  const prScore = calculatePRScore({
    githubMeta,
    filesAnalyzed,
    patches: filePatches,
  });

  const actions = generateActionLayer({
    filesAnalyzed,
    prScore,
    aiReview,
    githubMeta,
  });

  return { ...responseData, prScore, actions };
}
