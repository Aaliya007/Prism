const HIGH_RISK_PATH =
  /\.env|config|auth|security|credential|secret|token|password|jwt|oauth/i;
const BACKEND_PATH = /\.(js|ts|jsx|tsx|mjs|cjs)$/i;
const UI_PATH = /\.(css|scss|sass|less|html|svg|png|jpg|jpeg|gif|woff)$/i;

const SECURITY_KEYWORDS = [
  "password",
  "token",
  "secret",
  "jwt",
  "auth",
  "api_key",
  "apikey",
  "private_key",
  "bearer",
];

function sizePenalty(totalLines) {
  if (totalLines <= 50) return 0;
  if (totalLines <= 200) return 10;
  if (totalLines <= 500) return 20;
  return 30;
}

function fileCountPenalty(fileCount) {
  if (fileCount <= 3) return 0;
  if (fileCount <= 10) return 10;
  if (fileCount <= 20) return 15;
  return 20;
}

function fileRiskPenalty(files) {
  let penalty = 0;
  for (const file of files) {
    const name = file.name ?? "";
    if (HIGH_RISK_PATH.test(name)) {
      penalty += 5;
    } else if (BACKEND_PATH.test(name)) {
      penalty += 2;
    } else if (UI_PATH.test(name)) {
      penalty += 0.5;
    }
  }
  return Math.min(25, penalty);
}

function complexityPenalty(files) {
  const largeFiles = files.filter(
    (f) => (f.additions ?? 0) + (f.deletions ?? 0) > 300
  ).length;

  if (largeFiles >= 2) return 15;
  if (largeFiles === 1) return 8;

  const mediumFiles = files.filter((f) => {
    const lines = (f.additions ?? 0) + (f.deletions ?? 0);
    return lines > 100 && lines <= 300;
  }).length;

  if (mediumFiles >= 3) return 8;
  return 0;
}

function computeSecurityPenalty(patches) {
  let hits = 0;
  const text = patches
    .map((p) => `${p.name ?? ""}\n${p.patch ?? ""}`)
    .join("\n")
    .toLowerCase();

  for (const keyword of SECURITY_KEYWORDS) {
    const re = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = text.match(re);
    if (matches) hits += matches.length;
  }

  return Math.min(30, hits * 10);
}

function computeMaintainabilityPenalty(files) {
  const hasTests = files.some((f) => /test|spec|__tests__/i.test(f.name ?? ""));
  const uiOnly =
    files.length > 0 &&
    files.every((f) => UI_PATH.test(f.name ?? "") || /\.(md|json)$/i.test(f.name ?? ""));

  let penalty = 0;
  if (!hasTests && files.length >= 4) penalty += 5;
  if (uiOnly && files.length >= 3) penalty += 3;
  return Math.min(10, penalty);
}

function riskLevelFromScore(score) {
  if (score >= 80) return "Low";
  if (score >= 50) return "Medium";
  return "High";
}

function buildFlags({
  totalLines,
  fileCount,
  sizePen,
  fileRiskPen,
  securityPen,
  complexityPen,
  files,
}) {
  const flags = [];

  if (totalLines > 500 || sizePen >= 20) flags.push("Large PR detected");
  if (fileCount > 10) flags.push("Too many files changed");
  if (files.some((f) => HIGH_RISK_PATH.test(f.name ?? ""))) {
    flags.push("Sensitive file modified");
  }
  if (securityPen >= 10) flags.push("High security risk");
  if (complexityPen >= 8) flags.push("Complex refactor detected");

  return [...new Set(flags)];
}

/**
 * Deterministic PR score from GitHub metadata + file stats (no AI).
 * @param {{ githubMeta: object, filesAnalyzed: object[], patches?: { name: string, patch?: string }[] }} input
 */
export function calculatePRScore({ githubMeta = {}, filesAnalyzed = [], patches = [] }) {
  const additions = Number(githubMeta.additions) || 0;
  const deletions = Number(githubMeta.deletions) || 0;
  const totalLines = additions + deletions;
  const fileCount = filesAnalyzed.length || Number(githubMeta.changedFiles) || 0;

  const sizeScore = sizePenalty(totalLines);
  const changeRiskScore = fileCountPenalty(fileCount);
  const fileRiskScore = fileRiskPenalty(filesAnalyzed);
  const complexityScore = complexityPenalty(filesAnalyzed);
  const securityPenalty = resolveSecurityPenalty(patches, filesAnalyzed);
  const maintainabilityPenalty = computeMaintainabilityPenalty(filesAnalyzed);

  const totalPenalties =
    sizeScore +
    changeRiskScore +
    fileRiskScore +
    complexityScore +
    securityPenalty +
    maintainabilityPenalty;

  const score = Math.max(0, 100 - totalPenalties);
  const riskLevel = riskLevelFromScore(score);
  const flags = buildFlags({
    totalLines,
    fileCount,
    sizePen: sizeScore,
    fileRiskPen: fileRiskScore,
    securityPen: securityPenalty,
    complexityPen: complexityScore,
    files: filesAnalyzed,
  });

  return {
    score,
    riskLevel,
    breakdown: {
      sizeScore,
      complexityScore,
      fileRiskScore,
      changeRiskScore,
      securityPenalty,
      maintainabilityPenalty,
    },
    flags,
  };
}

function resolveSecurityPenalty(patches, filesAnalyzed) {
  if (patches.length > 0) {
    return computeSecurityPenalty(patches);
  }
  return computeSecurityPenalty(
    filesAnalyzed.map((f) => ({ name: f.name, patch: f.name ?? "" }))
  );
}
