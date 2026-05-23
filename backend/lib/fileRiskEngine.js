const HIGH_RISK_PATH =
  /\.env|config|auth|security|credential|secret|token|password|jwt|oauth/i;
const BACKEND_PATH = /\.(js|ts|jsx|tsx|mjs|cjs)$/i;
const TEST_PATH = /\.(test|spec)\.(js|ts|jsx|tsx)$|__tests__|\/test\//i;
const UI_PATH = /\.(css|scss|sass|less|html|svg|vue|svelte)$/i;

const SECURITY_KEYWORDS = [
  "password",
  "token",
  "secret",
  "jwt",
  "auth",
  "api_key",
  "apikey",
  "database",
];

function sizeImpact(lines) {
  if (lines <= 50) return { points: 10, reason: "Small change footprint" };
  if (lines <= 200) return { points: 30, reason: "Moderate diff size" };
  if (lines <= 500) return { points: 60, reason: "Large diff in file" };
  return { points: 90, reason: "Very large diff in file" };
}

function fileTypeImpact(name) {
  if (HIGH_RISK_PATH.test(name)) {
    return { points: 80, reason: "Sensitive path (config/auth/security)" };
  }
  if (TEST_PATH.test(name)) {
    return { points: -10, reason: "Test file (lower production risk)" };
  }
  if (BACKEND_PATH.test(name)) {
    return { points: 30, reason: "Backend source file" };
  }
  if (UI_PATH.test(name)) {
    return { points: 10, reason: "UI/style asset" };
  }
  return { points: 0, reason: null };
}

function statusImpact(status) {
  const s = String(status ?? "").toLowerCase();
  if (s === "added") return { points: 40, reason: "New file added" };
  if (s === "removed") return { points: 70, reason: "File removed" };
  if (s === "modified" || s === "changed") {
    return { points: 30, reason: "Existing file modified" };
  }
  if (s === "renamed") return { points: 35, reason: "File renamed" };
  return { points: 20, reason: "File status change" };
}

function securityKeywordImpact(name, patch) {
  const text = `${name}\n${patch ?? ""}`.toLowerCase();
  let hits = 0;
  const matched = [];

  for (const keyword of SECURITY_KEYWORDS) {
    const re = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const found = text.match(re);
    if (found?.length) {
      hits += found.length;
      matched.push(keyword);
    }
  }

  const points = Math.min(40, hits * 15);
  const reason =
    points > 0
      ? `Security keywords detected (${[...new Set(matched)].join(", ")})`
      : null;

  return { points, reason };
}

export function getFileRiskLevel(riskScore) {
  if (riskScore <= 30) return "LOW";
  if (riskScore <= 70) return "MEDIUM";
  return "HIGH";
}

/**
 * @param {{ name: string, additions?: number, deletions?: number, status?: string, patch?: string }} file
 */
export function computeFileRisk(file) {
  const lines = (Number(file.additions) || 0) + (Number(file.deletions) || 0);
  const reasons = [];

  const size = sizeImpact(lines);
  let total = size.points;
  if (size.reason) reasons.push(size.reason);

  const type = fileTypeImpact(file.name ?? "");
  total += type.points;
  if (type.reason) reasons.push(type.reason);

  const status = statusImpact(file.status);
  total += status.points;
  if (status.reason) reasons.push(status.reason);

  const security = securityKeywordImpact(file.name ?? "", file.patch ?? "");
  total += security.points;
  if (security.reason) reasons.push(security.reason);

  const riskScore = Math.max(0, Math.min(100, total));
  const riskLevel = getFileRiskLevel(riskScore);

  return {
    riskScore,
    riskLevel,
    riskReasons: reasons.length > 0 ? reasons : ["No elevated risk signals"],
  };
}

/**
 * Attach per-file risk to filesAnalyzed (deterministic, no AI).
 */
export function enrichFilesWithRisk(files, patches = []) {
  const patchByName = Object.fromEntries(
    patches.map((p) => [p.name, p.patch ?? ""])
  );

  return files.map((file) => {
    const patch = patchByName[file.name] ?? "";
    const risk = computeFileRisk({ ...file, patch });
    return {
      ...file,
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      riskReasons: risk.riskReasons,
    };
  });
}
