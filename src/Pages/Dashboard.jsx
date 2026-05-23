import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import IntegrationStatus from "../components/IntegrationStatus.jsx";
import { fetchIntegrationStatus } from "../lib/api.js";

const TIMELINE_TONES = ["accent", "danger", "warn", "success", "accent2"];

const AGENT_STYLES = [
  {
    color: "from-rose-500/14 via-rose-400/6 to-transparent",
    dot: "bg-rose-400",
    ring: "shadow-[0_0_28px_rgba(251,113,133,0.45)]",
  },
  {
    color: "from-amber-400/14 via-amber-300/6 to-transparent",
    dot: "bg-amber-300",
    ring: "shadow-[0_0_28px_rgba(252,211,77,0.35)]",
  },
  {
    color: "from-emerald-400/14 via-emerald-300/6 to-transparent",
    dot: "bg-emerald-300",
    ring: "shadow-[0_0_28px_rgba(52,211,153,0.35)]",
  },
  {
    color: "from-cyan-400/14 via-sky-300/6 to-transparent",
    dot: "bg-cyan-300",
    ring: "shadow-[0_0_28px_rgba(103,232,249,0.35)]",
  },
];

function loadPrismData() {
  try {
    const raw = localStorage.getItem("prismData");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatMergeConfidence(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  if (num <= 10) return `${Math.round(num * 10)}%`;
  return `${num}%`;
}

function analysisCompletionPercent(value) {
  if (value == null || value === "") return 82;
  const num = Number(value);
  if (Number.isNaN(num)) return 82;
  if (num <= 10) return Math.min(100, Math.round(num * 10));
  return Math.min(100, Math.round(num));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [liveIntegrations, setLiveIntegrations] = useState(null);
  const [integrationLoading, setIntegrationLoading] = useState(true);
  const [integrationError, setIntegrationError] = useState("");

  const data = useMemo(() => loadPrismData(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadIntegrations() {
      setIntegrationLoading(true);
      setIntegrationError("");
      try {
        const status = await fetchIntegrationStatus();
        if (!cancelled) setLiveIntegrations(status);
      } catch (err) {
        if (!cancelled) {
          setIntegrationError(err.message || "Could not reach the backend.");
        }
      } finally {
        if (!cancelled) setIntegrationLoading(false);
      }
    }

    loadIntegrations();
    return () => {
      cancelled = true;
    };
  }, []);

  const integrationStatus = liveIntegrations ?? data?.integrationStatus ?? null;

  const comments = data?.reviewComments ?? [];

  const timeline = useMemo(() => {
    const items = data?.timeline ?? [];
    return items.map((item, index) => ({
      time: item?.time ?? "—",
      title: item?.title ?? "Event",
      detail: item?.detail ?? "",
      tone: item?.tone ?? TIMELINE_TONES[index % TIMELINE_TONES.length],
    }));
  }, [data]);

  const agents = useMemo(() => {
    const items = data?.aiAgents ?? [];
    return items.map((agent, index) => {
      const style = AGENT_STYLES[index % AGENT_STYLES.length];
      const findings = agent?.findings ?? 0;
      return {
        name: agent?.name ?? "AI Agent",
        score: `${findings} finding${findings === 1 ? "" : "s"}`,
        sub: agent?.status ?? "Active",
        ...style,
      };
    });
  }, [data]);

  const findingsCount = useMemo(() => {
    if (comments.length > 0) return comments.length;
    return (data?.aiAgents ?? []).reduce(
      (sum, agent) => sum + (Number(agent?.findings) || 0),
      0
    );
  }, [data, comments.length]);

  const criticalCount = useMemo(
    () =>
      comments.filter((c) => String(c?.severity).toLowerCase() === "critical")
        .length,
    [comments]
  );

  const mergeConfidenceLabel = formatMergeConfidence(data?.mergeConfidence);
  const analysisPercent = analysisCompletionPercent(data?.mergeConfidence);

  const metrics = useMemo(
    () => [
      {
        label: "Changed files",
        value: data?.changedFiles != null ? String(data.changedFiles) : "—",
        delta: data?.additions != null ? `+${data.additions}` : "—",
      },
      {
        label: "Critical issues caught",
        value: data ? String(criticalCount) : "—",
        delta: data ? `${comments.length} total` : "—",
      },
      {
        label: "Additions / deletions",
        value:
          data?.additions != null && data?.deletions != null
            ? `+${data.additions} / -${data.deletions}`
            : "—",
        delta: data?.repoName ?? "—",
      },
      {
        label: "Merge confidence",
        value: mergeConfidenceLabel,
        delta: data?.overallRisk ?? "—",
      },
    ],
    [data, criticalCount, comments.length, mergeConfidenceLabel]
  );

  const prLabel = data?.prNumber
    ? `PR #${data.prNumber}`
    : "PR #—";
  const branchLabel = data?.branch ?? "—";
  const repoLabel = data?.repoName ?? "—";
  const prTitle = data?.prTitle ?? "No pull request loaded";
  const summaryText =
    data?.summary ??
    "Paste a GitHub PR URL on the upload page to run an AI review and populate this dashboard.";

  function Logo({ compact = false }) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-cyan-400/15 blur-xl" />
          <svg
            viewBox="0 0 64 64"
            aria-label="Prism logo"
            className={`relative text-prism-accent drop-shadow-[0_0_18px_rgba(109,230,255,0.18)] ${compact ? "h-8 w-8" : "h-9 w-9"}`}
          >
            <defs>
              <linearGradient id="prismGlowDash" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#79e6ff" />
                <stop offset="55%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#93c5fd" />
              </linearGradient>
            </defs>
            <path
              d="M16 18 30 10l18 10v24L34 54 16 44Z"
              fill="none"
              stroke="url(#prismGlowDash)"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M30 10v24L16 44"
              fill="none"
              stroke="url(#prismGlowDash)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M30 34 48 20"
              fill="none"
              stroke="url(#prismGlowDash)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {!compact && (
          <div>
            <div className="prism-label font-semibold tracking-[0.1em] text-white uppercase">
              Prism
            </div>
            <div className="prism-eyebrow text-prism-muted normal-case tracking-[0.08em]">
              AI code review cockpit
            </div>
          </div>
        )}
      </div>
    );
  }

  function Sidebar() {
    const items = [
      "Overview",
      "Pull Requests",
      "Agents",
      "Risk Graph",
      "Teams",
      "Settings",
    ];

    return (
      <aside className="flex h-full flex-col border-r border-white/[0.1] bg-[linear-gradient(180deg,#09111a_0%,#0a121b_100%)] px-4 py-5">
        <div className="mb-8">
          <Logo />
        </div>

        <nav className="space-y-2">
          {items.map((item, idx) => (
            <button
              key={item}
              type="button"
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left prism-label font-medium transition duration-200 ${
                idx === 0
                  ? "border-cyan-300/15 bg-cyan-300/[0.08] text-white shadow-[0_10px_28px_rgba(41,181,255,0.08)]"
                  : "border-transparent text-prism-muted hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span>{item}</span>
              {idx === 0 && (
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.8)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-8 prism-panel-muted p-4">
          <div className="prism-eyebrow text-prism-muted">Current queue</div>
          <div className="mt-2 prism-stat text-white tabular-nums">27</div>
          <p className="mt-2 prism-body text-prism-muted">
            Open pull requests waiting for AI pre-review.
          </p>
        </div>
      </aside>
    );
  }

  function Header() {
    return (
      <header className="sticky top-0 z-30 border-b border-white/[0.1] bg-[#071019]/85 px-4 py-3.5 backdrop-blur-2xl md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-prism-muted transition hover:border-cyan-300/25 hover:bg-white/[0.07] hover:text-white"
              aria-label={sidebarOpen ? "Hide navigation menu" : "Show navigation menu"}
              title={sidebarOpen ? "Hide menu" : "Show menu"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-[18px] w-[18px]" />
              ) : (
                <PanelLeftOpen className="h-[18px] w-[18px]" />
              )}
            </button>
            {!sidebarOpen && <Logo compact />}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 prism-label font-medium text-prism-muted transition hover:border-cyan-300/30 hover:text-white"
            >
              GitHub Live
            </button>
            <button
              type="button"
              onClick={() => navigate("/upload-review")}
              className="rounded-full bg-[linear-gradient(135deg,#b8f3ff_0%,#7dd3fc_32%,#67e8f9_100%)] px-4 py-2 prism-label font-semibold text-slate-950 shadow-[0_12px_34px_rgba(77,208,255,0.22)] transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Upload Review
            </button>
          </div>
        </div>
      </header>
    );
  }

  function EmptyState() {
    return (
      <section className="prism-panel p-8 text-center md:p-12">
        <div className="mx-auto max-w-lg">
          <div className="mb-3 prism-eyebrow text-cyan-200 normal-case tracking-normal">
            No analysis loaded
          </div>
          <h2 className="prism-h2 text-white">Run your first PR review</h2>
          <p className="mt-4 prism-body-lg text-prism-muted">
            Upload a GitHub pull request URL to analyze risk, review comments,
            and agent insights. Results will appear here automatically.
          </p>
          <button
            type="button"
            onClick={() => navigate("/upload-review")}
            className="mt-8 rounded-xl bg-white px-6 py-3 prism-label font-semibold text-slate-950 shadow-[0_14px_32px_rgba(255,255,255,0.14)] transition hover:-translate-y-0.5"
          >
            Upload Review
          </button>
        </div>
      </section>
    );
  }

  function Hero() {
    return (
      <section className="prism-panel relative overflow-hidden p-6 md:p-8">
        <div className="noise absolute inset-0 opacity-[0.16]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_30%)]" />
        <div className="absolute -left-16 top-[-50px] h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute right-[-20px] top-10 h-36 w-36 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-3 py-1.5 prism-eyebrow text-cyan-100">
              <span className="h-2 w-2 animate-pulseSoft rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.8)]" />
              Real-time pull request intelligence
            </div>

            <h1 className="prism-h1 max-w-xl text-white">
              {data ? prTitle : "Merge faster with AI reviews your team can actually trust."}
            </h1>

            <p className="mt-4 max-w-xl prism-body-lg text-prism-muted">
              {summaryText}
            </p>

            {data?.author ? (
              <div className="mt-4 flex items-center gap-3">
                {data.authorAvatar ? (
                  <img
                    src={data.authorAvatar}
                    alt={data.author}
                    className="h-9 w-9 rounded-full border border-white/[0.1]"
                  />
                ) : null}
                <div className="prism-label text-slate-200">
                  <span className="text-prism-muted">Author </span>
                  {data.author}
                  {repoLabel !== "—" ? (
                    <span className="text-prism-muted"> · {repoLabel}</span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/upload-review")}
                className="rounded-xl bg-white px-5 py-2.5 prism-label font-semibold text-slate-950 shadow-[0_14px_32px_rgba(255,255,255,0.14)] transition hover:-translate-y-0.5"
              >
                Upload Review
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 prism-label font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/[0.07]"
              >
                Open agent insights
              </button>
            </div>
          </div>

          <div className="prism-panel-muted relative p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="prism-h3 text-white">Review orchestration</div>
                <div className="prism-label text-prism-muted">
                  {prLabel} · {branchLabel}
                </div>
              </div>
              <div className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 prism-eyebrow text-cyan-100 normal-case tracking-normal">
                Live
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                <div className="mb-2 flex items-center justify-between prism-label">
                  <span className="text-prism-muted">Analysis completion</span>
                  <span className="font-semibold text-white">{analysisPercent}%</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9_0%,#38bdf8_50%,#93c5fd_100%)] shadow-[0_0_24px_rgba(56,189,248,0.32)]"
                    style={{ width: `${analysisPercent}%` }}
                  />
                  <div className="absolute inset-y-0 w-20 animate-scan bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  ["Files", data?.changedFiles != null ? String(data.changedFiles) : "—"],
                  ["Findings", String(findingsCount)],
                  ["Risk", data?.overallRisk ?? "—"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-center"
                  >
                    <div className="prism-eyebrow text-prism-muted normal-case tracking-normal">
                      {label}
                    </div>
                    <div
                      className={`mt-1 prism-stat ${label === "Risk" ? "text-amber-300" : "text-white"}`}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function Timeline() {
    const toneClass = {
      accent: "bg-cyan-300 shadow-[0_0_22px_rgba(103,232,249,0.6)]",
      accent2: "bg-sky-300 shadow-[0_0_22px_rgba(147,197,253,0.55)]",
      success: "bg-emerald-300 shadow-[0_0_22px_rgba(110,231,183,0.45)]",
      warn: "bg-amber-300 shadow-[0_0_22px_rgba(252,211,77,0.45)]",
      danger: "bg-rose-400 shadow-[0_0_22px_rgba(251,113,133,0.45)]",
    };

    return (
      <section className="prism-panel p-6 md:p-7">
        <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="prism-h3 text-white">Activity timeline</h2>
            <p className="mt-1 prism-body text-prism-muted">
              Live events from the current review session
            </p>
          </div>
          <div className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 prism-eyebrow text-prism-muted normal-case tracking-normal">
            Updated 12s ago
          </div>
        </div>

        <div className="space-y-4">
          {timeline.length === 0 ? (
            <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-6 text-center prism-body text-prism-muted">
              No timeline events yet. Run a PR analysis to populate activity.
            </div>
          ) : null}
          {timeline.map((item, index) => (
            <div
              key={`${item.time}-${item.title}-${index}`}
              className="grid grid-cols-[56px_14px_1fr] items-start gap-3"
            >
              <div className="pt-0.5 font-mono text-xs text-prism-muted tabular-nums">
                {item.time}
              </div>
              <div className="relative flex justify-center">
                <span className={`mt-1 h-3 w-3 rounded-full ${toneClass[item.tone]}`} />
                {index < timeline.length - 1 && (
                  <span className="absolute top-5 h-12 w-px bg-gradient-to-b from-white/20 to-transparent" />
                )}
              </div>
              <div className="rounded-xl border border-white/[0.1] bg-white/[0.035] p-4 transition hover:border-white/[0.14] hover:bg-white/[0.05]">
                <div className="prism-label font-semibold text-white">{item.title}</div>
                <div className="mt-1 prism-body text-prism-muted">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function ReviewPanel() {
    return (
      <section className="prism-panel p-6 md:p-7">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="prism-h3 text-white">Code review panel</h2>
            <p className="mt-1 prism-body text-prism-muted">
              GitHub-inspired suggestions with actionable context
            </p>
          </div>
          <div className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 prism-eyebrow text-emerald-200 normal-case tracking-normal">
            {comments.length} comment{comments.length === 1 ? "" : "s"} ready
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#09111a]">
          <div className="flex items-center justify-between border-b border-white/[0.1] px-4 py-3 prism-label">
            <div className="flex items-center gap-3">
              <span className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 font-mono text-xs text-white/90">
                pull_request.diff
              </span>
              <span className="text-prism-muted">Suggested review comments</span>
            </div>
            <span className="text-prism-muted">AI reviewer</span>
          </div>

          <div className="grid gap-4 p-4">
            {comments.length === 0 ? (
              <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-6 text-center prism-body text-prism-muted">
                No review comments yet. Analyze a pull request to generate
                suggestions.
              </div>
            ) : null}
            {comments.map((comment, index) => (
              <div
                key={`${comment?.file ?? "file"}-${comment?.line ?? index}-${index}`}
                className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 prism-eyebrow normal-case tracking-normal ${
                      comment?.severity === "Critical"
                        ? "bg-rose-400/15 text-rose-200"
                        : comment?.severity === "High"
                          ? "bg-amber-400/15 text-amber-200"
                          : "bg-cyan-300/15 text-cyan-200"
                    }`}
                  >
                    {comment?.severity ?? "Note"}
                  </span>
                  <span className="rounded-full border border-white/[0.1] px-2.5 py-1 prism-label text-prism-muted">
                    {comment?.tag ?? "Review"}
                  </span>
                  <span className="font-mono text-xs text-prism-muted">
                    {comment?.file ?? "unknown"}:{comment?.line ?? "—"}
                  </span>
                </div>
                <p className="mt-3 prism-body text-slate-200">
                  {comment?.body ?? "No comment body provided."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-white px-3 py-2 prism-label font-semibold text-slate-950 transition hover:-translate-y-0.5"
                  >
                    Apply suggestion
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 prism-label font-semibold text-white transition hover:border-cyan-300/25"
                  >
                    Open file
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function AgentStatus() {
    return (
      <section className="prism-panel p-6 md:p-7">
        <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="prism-h3 text-white">AI agent status</h2>
            <p className="mt-1 prism-body text-prism-muted">
              Specialized reviewers running in parallel
            </p>
          </div>
          <div className="flex items-center gap-2 prism-label text-prism-muted">
            <span className="h-2.5 w-2.5 animate-pulseSoft rounded-full bg-emerald-400" />
            {agents.length} agent{agents.length === 1 ? "" : "s"} active
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {agents.length === 0 ? (
            <div className="col-span-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-6 text-center prism-body text-prism-muted">
              No agent activity yet. Run a PR analysis to activate AI reviewers.
            </div>
          ) : null}
          {agents.map((agent) => (
            <div
              key={agent.name}
              className={`rounded-xl border border-white/[0.1] bg-gradient-to-br ${agent.color} p-4 transition hover:-translate-y-1 hover:border-white/[0.15]`}
            >
              <div className="flex items-center justify-between">
                <span className={`h-2.5 w-2.5 rounded-full ${agent.dot} ${agent.ring}`} />
                <span className="prism-label text-prism-muted">Active</span>
              </div>
              <div className="mt-4 prism-label font-semibold text-white">{agent.name}</div>
              <div className="mt-1 prism-h3 text-white">{agent.score}</div>
              <div className="mt-2 prism-body text-prism-muted">{agent.sub}</div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        html, body, #root { height: 100%; margin: 0; }
        body {
          background:
            radial-gradient(circle at top left, rgba(72, 223, 255, 0.08), transparent 18%),
            radial-gradient(circle at 80% 10%, rgba(192, 132, 252, 0.06), transparent 22%),
            linear-gradient(180deg, #071019 0%, #08111a 48%, #071019 100%);
        }
      `}</style>

      <div
        className={`grid h-screen grid-cols-1 transition-[grid-template-columns] duration-300 ${
          sidebarOpen ? "lg:grid-cols-[250px_1fr]" : "lg:grid-cols-1"
        }`}
      >
        {sidebarOpen && (
          <div className="hidden min-h-0 lg:block">
            <Sidebar />
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-col">
          <Header />

          <main className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-7 px-4 py-6 md:gap-8 md:px-6 md:py-8">
              {!data ? <EmptyState /> : null}
              <Hero />

              <IntegrationStatus
                status={integrationStatus}
                loading={integrationLoading}
                error={integrationError}
              />

              {data?.reviewMode && data.reviewMode !== "ai" ? (
                <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 prism-body text-amber-100">
                  Last review ran in <span className="font-mono">{data.reviewMode}</span> mode
                  {data.reviewError ? `: ${data.reviewError}` : ""}. Re-run analysis after keys
                  are connected.
                </div>
              ) : null}

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="prism-panel p-5 transition hover:-translate-y-0.5 hover:border-white/[0.14]"
                  >
                    <div className="prism-label text-prism-muted">{metric.label}</div>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div className="prism-stat text-white tabular-nums">{metric.value}</div>
                      <div className="rounded-full bg-emerald-300/10 px-2.5 py-1 prism-eyebrow text-emerald-200 normal-case tracking-normal">
                        {metric.delta}
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              <div className="flex flex-col gap-7 md:gap-8">
                <Timeline />
                <ReviewPanel />
              </div>

              <AgentStatus />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
