import { Globe, GitBranch } from "lucide-react";
import { formatRelativeTime } from "../lib/formatRelativeTime.js";

const STATUS_LABELS = {
  received: "Webhook received",
  analyzing: "Analysis in progress",
  completed: "Analysis completed",
  failed: "Analysis failed",
};

function statusTone(status) {
  if (status === "completed") return "text-emerald-300";
  if (status === "failed") return "text-rose-300";
  if (status === "analyzing") return "text-amber-200";
  return "text-cyan-200";
}

export default function GitHubLivePanel({
  open,
  onClose,
  liveStatus,
  lastSyncedAt,
}) {
  if (!open) return null;

  const event = liveStatus?.latestEvent;
  const isLive = liveStatus?.connected;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm transition-opacity duration-300 md:p-8 md:pt-24"
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-live-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="prism-panel relative w-full max-w-lg overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(103,232,249,0.06),transparent_40%,rgba(192,132,252,0.08))]" />

        {/* HEADER */}
        <div className="relative border-b border-white/[0.08] px-5 py-4 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04]">
                <Globe className="h-5 w-5 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                  </span>

                  <span className="prism-eyebrow text-emerald-200 normal-case tracking-normal">
                    LIVE
                  </span>
                </div>

                <h2
                  id="github-live-title"
                  className="prism-h3 text-white"
                >
                  GitHub Live Monitoring
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 prism-label text-prism-muted transition hover:text-white"
            >
              Close
            </button>
          </div>

          <p className="mt-2 prism-body text-sm text-prism-muted">
            {isLive ? "Webhook connected" : "Monitoring unavailable"}

            {lastSyncedAt ? (
              <span className="text-prism-muted">
                {" "}
                · Last synced {formatRelativeTime(lastSyncedAt)}
              </span>
            ) : null}
          </p>
        </div>

        {/* BODY */}
        <div className="relative space-y-4 px-5 py-5 md:px-6">
          {!event ? (
            <div className="rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-8 text-center">
              <p className="prism-body text-prism-muted">
                Waiting for the first{" "}
                <span className="font-mono text-slate-300">
                  pull_request
                </span>{" "}
                webhook event.
              </p>

              <p className="mt-2 prism-label text-prism-muted">
                Point your GitHub webhook to{" "}
                <span className="font-mono text-cyan-200/90">
                  POST /github/webhook
                </span>
              </p>
            </div>
          ) : (
            <>
              {/* TOP GRID */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <div className="prism-eyebrow text-prism-muted normal-case tracking-normal">
                    Latest PR
                  </div>

                  <p className="mt-1 prism-label font-semibold text-white">
                    {event.prTitle ?? "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <div className="prism-eyebrow text-prism-muted normal-case tracking-normal">
                    Repository
                  </div>

                  <p className="mt-1 font-mono text-sm text-cyan-200">
                    {event.repo ?? "—"}
                  </p>
                </div>
              </div>

              {/* SECOND GRID */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <div className="prism-eyebrow text-prism-muted normal-case tracking-normal">
                    Author
                  </div>

                  <p className="mt-1 prism-label text-white">
                    @{event.author ?? "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <div className="prism-eyebrow text-prism-muted normal-case tracking-normal">
                    Event
                  </div>

                  <p className="mt-1 prism-label capitalize text-white">
                    {event.eventType ?? "pull_request"} ·{" "}
                    {event.action ?? "—"}
                  </p>
                </div>
              </div>

              {/* STATUS CARD */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="prism-eyebrow text-prism-muted normal-case tracking-normal">
                      Last event
                    </div>

                    <p className="mt-1 prism-label text-white">
                      {formatRelativeTime(event.receivedAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="prism-eyebrow text-prism-muted normal-case tracking-normal">
                      Status
                    </div>

                    <p
                      className={`mt-1 prism-label font-semibold ${statusTone(
                        event.status
                      )}`}
                    >
                      {STATUS_LABELS[event.status] ??
                        event.status ??
                        "—"}
                    </p>
                  </div>
                </div>

                {event.branch ? (
                  <div className="mt-3 flex items-center gap-2 text-xs text-prism-muted">
                    <GitBranch className="h-3.5 w-3.5" />

                    <span className="font-mono">
                      {event.branch}
                    </span>
                  </div>
                ) : null}

                {event.error ? (
                  <p className="mt-3 prism-body text-sm text-rose-300">
                    {event.error}
                  </p>
                ) : null}
              </div>

              {/* PR URL */}
              {event.prUrl ? (
                <a
                  href={event.prUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-2.5 font-mono text-xs text-cyan-200 transition hover:border-cyan-300/35"
                >
                  {event.prUrl}
                </a>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
