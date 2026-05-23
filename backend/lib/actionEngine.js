const SECURITY_KEYWORD_RE =
  /password|token|secret|jwt|auth|api_key|apikey|database/i;

function fileLines(file) {
  return (Number(file.additions) || 0) + (Number(file.deletions) || 0);
}

function hasSecuritySignals(file) {
  const name = file.name ?? "";
  if (SECURITY_KEYWORD_RE.test(name)) return true;
  return (file.riskReasons ?? []).some((r) => /security keyword/i.test(r));
}

function issueTitle(file) {
  const score = Number(file.riskScore) || 0;
  const name = file.name ?? "unknown file";

  if (score > 80) return `Critical file change detected in ${name}`;
  if (hasSecuritySignals(file)) {
    return `Potential security exposure in ${name}`;
  }
  if (fileLines(file) > 300) {
    return `Large refactor risk in ${name}`;
  }
  return `High-risk change requires review in ${name}`;
}

function issueReason(file) {
  const parts = [];
  const score = Number(file.riskScore) || 0;

  parts.push(`Risk score ${score}/100 (${file.riskLevel ?? "—"})`);

  if (file.riskReasons?.length) {
    parts.push(file.riskReasons.slice(0, 2).join("; "));
  }

  if (hasSecuritySignals(file)) {
    parts.push("Security-sensitive path or keyword signals detected");
  }

  if (fileLines(file) > 500) {
    parts.push("Large diff increases chance of hidden regressions");
  }

  return parts.join(" · ");
}

function getSuggestion(file) {
  const name = (file.name ?? "").toLowerCase();

  if (name.includes("auth") || name.includes("login")) {
    return "Use hashed passwords (bcrypt) and avoid storing raw tokens";
  }

  if (fileLines(file) > 500) {
    return "Split into smaller modules to improve maintainability";
  }

  if (name.includes(".env") || name.includes("config")) {
    return "Move secrets to environment variables (.env)";
  }

  if (hasSecuritySignals(file)) {
    return "Review authentication and API key exposure risks";
  }

  if (Number(file.riskScore) > 70) {
    return "Manually review this file for hidden bugs or security risks";
  }

  return "Review logic carefully for unintended side effects";
}

function severityFromScore(riskScore) {
  if (riskScore > 80) return "HIGH";
  if (riskScore > 50) return "MEDIUM";
  return "LOW";
}

function collectQuickFixSuggestions({ filesAnalyzed, githubMeta, prScore }) {
  const suggestions = new Set();
  const totalLines =
    (Number(githubMeta?.additions) || 0) + (Number(githubMeta?.deletions) || 0);
  const fileCount = filesAnalyzed.length;

  if (totalLines > 500) {
    suggestions.add("Split into smaller modules to improve maintainability");
  }

  if (fileCount > 10) {
    suggestions.add("Break PR into smaller focused changes");
  }

  for (const file of filesAnalyzed) {
    const name = (file.name ?? "").toLowerCase();

    if (name.includes("auth") || name.includes("login")) {
      suggestions.add("Use secure authentication (bcrypt + JWT best practices)");
    }

    if (name.includes(".env") || name.includes("config")) {
      suggestions.add("Move sensitive data to environment variables");
    }

    if (hasSecuritySignals(file)) {
      suggestions.add("Review authentication and API key exposure risks");
    }
  }

  if (prScore?.flags?.includes("Large PR detected")) {
    suggestions.add("Reduce PR scope before merge to lower blast radius");
  }

  if (prScore?.flags?.includes("High security risk")) {
    suggestions.add("Run a security pass on auth, config, and API surfaces");
  }

  if (suggestions.size === 0) {
    suggestions.add("Run tests and request a second reviewer before merging");
  }

  return [...suggestions].slice(0, 6);
}

function issuesFromAiReview(aiReview, limit) {
  if (!aiReview || aiReview.error) return [];

  const pools = [
    ...(aiReview.securityFindings ?? []).map((f) => ({ ...f, pool: "Security" })),
    ...(aiReview.performanceRisks ?? []).map((f) => ({ ...f, pool: "Performance" })),
    ...(aiReview.maintainabilityIssues ?? []).map((f) => ({ ...f, pool: "Maintainability" })),
  ];

  const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  return pools
    .sort(
      (a, b) =>
        (order[a.severity] ?? 9) - (order[b.severity] ?? 9)
    )
    .slice(0, limit)
    .map((f) => ({
      title: f.title ?? `${f.pool} finding`,
      severity: String(f.severity ?? "Medium").toUpperCase(),
      file: f.file ?? "",
      reason: f.description ?? "Flagged by AI review agents",
      suggestion:
        f.description?.includes("fix")
          ? f.description
          : "Address this finding before merge",
    }));
}

/**
 * @param {{ filesAnalyzed: object[], prScore?: object, aiReview?: object, githubMeta?: object }} input
 */
export function generateActionLayer({
  filesAnalyzed = [],
  prScore,
  aiReview,
  githubMeta = {},
}) {
  const sorted = [...filesAnalyzed].sort(
    (a, b) => (Number(b.riskScore) || 0) - (Number(a.riskScore) || 0)
  );

  const fileIssues = sorted.slice(0, 3).map((file, idx) => ({
    title: issueTitle(file),
    severity: severityFromScore(Number(file.riskScore) || 0),
    file: file.name,
    reason: issueReason(file),
    suggestion: getSuggestion(file),
    rank: idx + 1,
  }));

  const aiIssues = issuesFromAiReview(aiReview, Math.max(0, 3 - fileIssues.length));
  const topIssues = [...fileIssues, ...aiIssues].slice(0, 3);

  const quickFixSuggestions = collectQuickFixSuggestions({
    filesAnalyzed,
    githubMeta,
    prScore,
  });

  return {
    topIssues,
    quickFixSuggestions,
  };
}
