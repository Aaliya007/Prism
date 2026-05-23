const BREAKDOWN_META = [
  { key: "sizeScore", label: "Size", max: 30 },
  { key: "changeRiskScore", label: "Files", max: 20 },
  { key: "fileRiskScore", label: "File risk", max: 25 },
  { key: "complexityScore", label: "Complexity", max: 15 },
  { key: "securityPenalty", label: "Security", max: 30 },
  { key: "maintainabilityPenalty", label: "Maintainability", max: 10 },
];

function scoreRingColor(score) {
  if (score >= 80) return "#34d399";
  if (score >= 50) return "#fbbf24";
  return "#fb7185";
}

function riskBadgeClass(riskLevel) {
  if (riskLevel === "Low") return "bg-emerald-300/15 text-emerald-200";
  if (riskLevel === "High") return "bg-rose-400/15 text-rose-200";
  return "bg-amber-300/15 text-amber-200";
}

export default function PRScoreCard({ prScore }) {
  if (!prScore || prScore.score == null) return null;

  const score = Number(prScore.score);
  const breakdown = prScore.breakdown ?? {};
  const flags = prScore.flags ?? [];
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const ringColor = scoreRingColor(score);

  return (
    <section className="prism-panel p-6 md:p-7">
      <div className="mb-5 border-b border-white/[0.08] pb-4">
        <h2 className="prism-h3 text-white">PR Score Engine</h2>
        <p className="mt-1 prism-body text-prism-muted">
          Deterministic heuristics from GitHub diff metadata — works offline from Gemini
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-700"
              style={{ filter: `drop-shadow(0 0 12px ${ringColor}88)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="prism-stat text-4xl text-white tabular-nums">{score}</span>
            <span className="prism-eyebrow text-prism-muted normal-case tracking-normal">
              / 100
            </span>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 prism-eyebrow normal-case tracking-normal ${riskBadgeClass(prScore.riskLevel)}`}
            >
              {prScore.riskLevel} risk
            </span>
            <span className="prism-label text-prism-muted">Local heuristic layer</span>
          </div>

          <div className="mt-5 space-y-3">
            {BREAKDOWN_META.map(({ key, label, max }) => {
              const penalty = Number(breakdown[key]) || 0;
              const pct = max > 0 ? Math.min(100, Math.round((penalty / max) * 100)) : 0;
              return (
                <div key={key}>
                  <div className="mb-1 flex justify-between prism-label">
                    <span className="text-prism-muted">{label}</span>
                    <span className="font-mono text-xs text-slate-300">
                      −{penalty}
                      <span className="text-prism-muted"> / {max}</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 70
                          ? "bg-rose-400"
                          : pct >= 40
                            ? "bg-amber-300"
                            : "bg-cyan-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {flags.length > 0 ? (
        <div className="mt-6 border-t border-white/[0.08] pt-5">
          <div className="prism-label font-semibold text-white">Flags</div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {flags.map((flag) => (
              <li
                key={flag}
                className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 prism-label text-slate-200"
              >
                {flag}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
