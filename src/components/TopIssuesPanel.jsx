const SEVERITY_STYLES = {
  HIGH: "bg-rose-500/20 text-rose-200 border-rose-400/30",
  MEDIUM: "bg-amber-500/20 text-amber-100 border-amber-400/30",
  LOW: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
};

export default function TopIssuesPanel({ topIssues }) {
  const issues = Array.isArray(topIssues) ? topIssues : [];

  if (issues.length === 0) return null;

  return (
    <section className="prism-panel h-full p-6 md:p-7">
      <div className="mb-1 prism-eyebrow text-rose-200/90 normal-case tracking-normal">
        Priority queue
      </div>
      <h2 className="prism-h3 text-white">Top 3 issues to fix right away</h2>
      <p className="mt-1 mb-5 prism-body text-prism-muted">
        Highest-risk files ranked by heuristic score
      </p>

      <div className="space-y-3">
        {issues.map((issue, i) => (
          <div
            key={`${issue.file}-${i}`}
            className="rounded-xl border border-white/[0.1] bg-white/[0.04] p-4 transition hover:border-white/[0.16]"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="prism-label font-semibold text-white">{issue.title}</h3>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 prism-eyebrow normal-case tracking-normal ${
                  SEVERITY_STYLES[issue.severity] ?? SEVERITY_STYLES.MEDIUM
                }`}
              >
                {issue.severity}
              </span>
            </div>

            {issue.file ? (
              <p className="mt-2 truncate font-mono text-xs text-cyan-200/90">{issue.file}</p>
            ) : null}

            <p className="mt-2 prism-body text-slate-300">{issue.reason}</p>

            <p className="mt-3 prism-body text-cyan-300">
              <span className="text-prism-muted">Suggestion: </span>
              {issue.suggestion}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
