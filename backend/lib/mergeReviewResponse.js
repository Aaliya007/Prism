const AGENT_FINDING_KEYS = {
  "Security Agent": "securityFindings",
  "Performance Agent": "performanceRisks",
  "Maintainability Agent": "maintainabilityIssues",
  "Human Risk Agent": "humanRisks",
};

function countFindings(review, key) {
  const list = review?.[key];
  return Array.isArray(list) ? list.length : 0;
}

function syncAgentFindings(aiAgents, review) {
  const defaults = [
    { name: "Security Agent", status: "Active", findings: 0 },
    { name: "Performance Agent", status: "Active", findings: 0 },
    { name: "Maintainability Agent", status: "Active", findings: 0 },
    { name: "Human Risk Agent", status: "Active", findings: 0 },
  ];

  const agents = Array.isArray(aiAgents) && aiAgents.length > 0 ? aiAgents : defaults;

  return agents.map((agent) => {
    const key = AGENT_FINDING_KEYS[agent.name];
    const count = key ? countFindings(review, key) : Number(agent.findings) || 0;
    return {
      name: agent.name,
      status: agent.status ?? "Active",
      findings: count,
    };
  });
}

function normalizeMergeConfidence(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  if (num > 0 && num <= 10) return Math.round(num * 10);
  return Math.min(100, Math.max(0, Math.round(num)));
}

/**
 * Merge GitHub-fetched PR facts with Gemini output. GitHub wins for
 * identity fields and file stats; AI wins for analysis content.
 */
export function mergeReviewResponse(githubMeta, aiReview, filesAnalyzed) {
  const review = aiReview && !aiReview.error ? aiReview : {};

  return {
    repoName: githubMeta.repoName ?? review.repoName ?? "",
    prTitle: githubMeta.prTitle ?? review.prTitle ?? "",
    prNumber: githubMeta.prNumber ?? review.prNumber ?? 0,
    author: githubMeta.author ?? review.author ?? "",
    authorAvatar: githubMeta.authorAvatar ?? review.authorAvatar ?? "",
    branch: githubMeta.branch ?? review.branch ?? "",
    createdAt: githubMeta.createdAt,

    changedFiles: githubMeta.changedFiles ?? 0,
    additions: githubMeta.additions ?? 0,
    deletions: githubMeta.deletions ?? 0,

    summary: review.summary ?? "",
    mergeConfidence: normalizeMergeConfidence(review.mergeConfidence),
    overallRisk: review.overallRisk ?? "Medium",

    securityFindings: review.securityFindings ?? [],
    performanceRisks: review.performanceRisks ?? [],
    maintainabilityIssues: review.maintainabilityIssues ?? [],
    humanRisks: review.humanRisks ?? [],

    reviewComments: review.reviewComments ?? [],
    topSuggestions: review.topSuggestions ?? [],
    topIssues: review.topIssues ?? [],
    timeline: review.timeline ?? [],
    filesAnalyzed,

    aiAgents: syncAgentFindings(review.aiAgents, review),
  };
}
