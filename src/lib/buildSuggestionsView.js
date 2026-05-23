const CRITICAL_SEVERITIES = new Set(["CRITICAL", "HIGH"]);
const FINDING_POOLS = [
  { key: "securityFindings", tag: "Security" },
  { key: "performanceRisks", tag: "Performance" },
  { key: "maintainabilityIssues", tag: "Maintainability" },
];

function normalizeSeverity(value) {
  const s = String(value ?? "Medium").toUpperCase();
  if (s === "CRITICAL" || s === "HIGH" || s === "MEDIUM" || s === "LOW") return s;
  return "MEDIUM";
}

function isCriticalSeverity(severity) {
  return CRITICAL_SEVERITIES.has(normalizeSeverity(severity));
}

function hasLine(line) {
  const n = Number(line);
  return Number.isFinite(n) && n > 0;
}

function dedupeKey(item) {
  return `${item.file ?? ""}|${item.line ?? 0}|${item.title ?? ""}|${item.suggestion ?? ""}`;
}

function pushUnique(map, item) {
  const key = dedupeKey(item);
  if (map.has(key)) return;
  map.set(key, item);
}

function findingToItem(finding, tag, source) {
  return {
    file: finding.file ?? "",
    line: hasLine(finding.line) ? Number(finding.line) : 0,
    severity: normalizeSeverity(finding.severity),
    tag,
    title: finding.title ?? "Finding",
    suggestion: finding.description ?? finding.fix ?? "",
    source,
  };
}

function commentToItem(comment) {
  return {
    file: comment.file ?? "",
    line: hasLine(comment.line) ? Number(comment.line) : 0,
    severity: normalizeSeverity(comment.severity),
    tag: comment.tag ?? "Review",
    title: comment.tag ? `${comment.tag} review note` : "Review comment",
    suggestion: comment.body ?? "",
    source: "reviewComments",
  };
}

function topSuggestionToItem(suggestion) {
  const priority = suggestion.priority ?? suggestion.severity ?? "Medium";
  return {
    file: suggestion.file ?? "",
    line: hasLine(suggestion.line) ? Number(suggestion.line) : 0,
    severity: normalizeSeverity(priority),
    tag: "Suggestion",
    title: suggestion.title ?? "Suggested fix",
    suggestion:
      suggestion.fix ??
      suggestion.problem ??
      suggestion.impact ??
      "",
    source: "topSuggestions",
  };
}

function groupByFile(items) {
  const groups = new Map();

  for (const item of items) {
    const file = item.file || "Repository-wide";
    if (!groups.has(file)) {
      groups.set(file, []);
    }
    groups.get(file).push(item);
  }

  return [...groups.entries()].map(([file, fileItems]) => ({
    file: file === "Repository-wide" ? "" : file,
    items: fileItems.sort((a, b) => (b.line || 0) - (a.line || 0)),
    maxSeverity: fileItems.reduce(
      (max, it) =>
        isCriticalSeverity(it.severity) ? "HIGH" : max === "HIGH" ? max : it.severity,
      "LOW"
    ),
  }));
}

/**
 * Transform PRISM API payload into structured suggestions for the dashboard.
 * @param {object} aiData — full prismData from /analyze-pr (merged response)
 */
export function buildSuggestionsView(aiData) {
  if (!aiData) {
    return {
      criticalFixes: { lineLevel: [], byFile: [] },
      generalImprovements: { highLevel: [], byFile: [] },
      meta: { criticalCount: 0, generalCount: 0 },
    };
  }

  const allItems = new Map();

  for (const { key, tag } of FINDING_POOLS) {
    for (const finding of aiData[key] ?? []) {
      pushUnique(allItems, findingToItem(finding, tag, key));
    }
  }

  for (const comment of aiData.reviewComments ?? []) {
    pushUnique(allItems, commentToItem(comment));
  }

  for (const suggestion of aiData.topSuggestions ?? []) {
    pushUnique(allItems, topSuggestionToItem(suggestion));
  }

  for (const risk of aiData.humanRisks ?? []) {
    pushUnique(allItems, {
      file: risk.file ?? "",
      line: hasLine(risk.line) ? Number(risk.line) : 0,
      severity: normalizeSeverity(risk.severity),
      tag: "Human Risk",
      title: risk.title ?? "Human risk",
      suggestion: risk.description ?? "",
      source: "humanRisks",
    });
  }

  const items = [...allItems.values()];
  const criticalLine = [];
  const criticalFile = [];
  const generalLine = [];
  const generalFile = [];
  const generalHigh = [];

  for (const item of items) {
    const critical = isCriticalSeverity(item.severity);
    const lined = Boolean(item.file) && hasLine(item.line);
    const filed = Boolean(item.file) && !hasLine(item.line);

    if (critical && lined) {
      criticalLine.push(item);
    } else if (critical && filed) {
      criticalFile.push(item);
    } else if (critical && !item.file) {
      generalHigh.push({ ...item, category: "risk" });
    } else if (!critical && lined) {
      generalLine.push(item);
    } else if (!critical && filed) {
      generalFile.push(item);
    } else {
      generalHigh.push({ ...item, category: "improvement" });
    }
  }

  for (const text of aiData.actions?.quickFixSuggestions ?? []) {
    if (!text) continue;
    generalHigh.push({
      file: "",
      line: 0,
      severity: "LOW",
      tag: "Heuristic",
      title: "PR workflow",
      suggestion: text,
      source: "heuristic",
      category: "process",
    });
  }

  const criticalFixes = {
    lineLevel: criticalLine.sort(
      (a, b) =>
        severityRank(b.severity) - severityRank(a.severity) || (a.line || 0) - (b.line || 0)
    ),
    byFile: groupByFile(criticalFile),
  };

  const generalImprovements = {
    highLevel: generalHigh.map((item) => ({
      title: item.title,
      suggestion: item.suggestion,
      category: item.category ?? item.tag?.toLowerCase() ?? "improvement",
      severity: item.severity,
      tag: item.tag,
    })),
    lineLevel: generalLine.sort((a, b) => (a.line || 0) - (b.line || 0)),
    byFile: groupByFile([...generalFile, ...generalLine.filter((i) => !hasLine(i.line))]),
  };

  const criticalCount =
    criticalFixes.lineLevel.length +
    criticalFixes.byFile.reduce((n, g) => n + g.items.length, 0);
  const generalCount =
    generalImprovements.highLevel.length +
    generalImprovements.lineLevel.length +
    generalImprovements.byFile.reduce((n, g) => n + g.items.length, 0);

  return {
    criticalFixes,
    generalImprovements,
    meta: { criticalCount, generalCount },
  };
}

function severityRank(severity) {
  const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  return order[normalizeSeverity(severity)] ?? 0;
}
