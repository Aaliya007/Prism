/**
 * Merge recommendation from local PR score (independent of Gemini).
 */
export function getMergeDecision(prScore) {
  const score = Number(prScore?.score ?? 0);

  if (score >= 80) {
    return {
      decision: "SAFE TO MERGE",
      color: "green",
      message: "Low risk PR. Safe to merge after final checks.",
    };
  }

  if (score >= 50) {
    return {
      decision: "REVIEW BEFORE MERGE",
      color: "yellow",
      message: "Moderate risk detected. Manual review recommended.",
    };
  }

  return {
    decision: "DO NOT MERGE",
    color: "red",
    message: "High risk PR. Requires fixes before merging.",
  };
}
