import { getMergeDecision } from "../lib/mergeDecision.js";

const BANNER_STYLES = {
  green: {
    border: "border-emerald-300/25",
    bg: "bg-emerald-400/[0.08]",
    title: "text-emerald-200",
    badge: "bg-emerald-300/15 text-emerald-100",
    dot: "bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.6)]",
  },
  yellow: {
    border: "border-amber-300/25",
    bg: "bg-amber-400/[0.08]",
    title: "text-amber-100",
    badge: "bg-amber-300/15 text-amber-100",
    dot: "bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.5)]",
  },
  red: {
    border: "border-rose-400/25",
    bg: "bg-rose-400/[0.08]",
    title: "text-rose-100",
    badge: "bg-rose-400/15 text-rose-100",
    dot: "bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.55)]",
  },
};

export default function MergeDecisionBanner({ prScore }) {
  if (!prScore || prScore.score == null) return null;

  const merge = getMergeDecision(prScore);
  const styles = BANNER_STYLES[merge.color] ?? BANNER_STYLES.yellow;

  return (
    <section
      className={`rounded-xl border px-5 py-4 md:px-6 md:py-5 ${styles.border} ${styles.bg}`}
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${styles.dot}`} />
          <div>
            <div className="prism-eyebrow text-prism-muted normal-case tracking-normal">
              Heuristic merge decision
            </div>
            <h2 className={`mt-1 prism-h3 ${styles.title}`}>{merge.decision}</h2>
            <p className="mt-2 max-w-2xl prism-body text-slate-200">{merge.message}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1.5 prism-label font-semibold ${styles.badge}`}
          >
            PR Score {prScore.score}/100
          </span>
          <span className="rounded-full border border-white/[0.1] px-3 py-1.5 prism-label text-prism-muted">
            Risk: {prScore.riskLevel}
          </span>
        </div>
      </div>
    </section>
  );
}
