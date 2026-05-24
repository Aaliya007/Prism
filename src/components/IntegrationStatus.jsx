import { CheckCircle2, XCircle, Plug } from "lucide-react";
import { DISPLAY_API_BASE } from "../lib/api.js";
import { normalizeIntegrations } from "../lib/integrations.js";

function IntegrationCard({ integration }) {
  const configured = Boolean(integration?.configured);

  return (
    <div
      className={`rounded-xl border p-4 ${
        configured
          ? "border-emerald-300/20 bg-emerald-300/[0.06]"
          : "border-rose-300/20 bg-rose-400/[0.06]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Plug className="h-4 w-4 text-prism-muted" />
            <span className="prism-label font-semibold text-white">
              {integration?.label ?? "API"}
            </span>
          </div>
          {configured && integration?.model ? (
            <p className="mt-1 prism-label text-prism-muted">{integration.model}</p>
          ) : !configured ? (
            <p className="mt-1 prism-label text-prism-muted">
              Set <span className="font-mono text-slate-300">{integration?.envVar}</span> in{" "}
              <span className="font-mono text-slate-300">backend/.env</span>
            </p>
          ) : null}
        </div>
        {configured ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
        ) : (
          <XCircle className="h-5 w-5 shrink-0 text-rose-300" />
        )}
      </div>

      <div className="mt-3">
        <span
          className={`rounded-full px-2.5 py-1 prism-eyebrow normal-case tracking-normal ${
            configured
              ? "bg-emerald-300/15 text-emerald-200"
              : "bg-rose-400/15 text-rose-200"
          }`}
        >
          {configured ? "CONFIGURED" : "NOT CONFIGURED"}
        </span>
        {integration?.tier === "free" && configured ? (
          <span className="ml-2 rounded-full border border-white/[0.1] px-2.5 py-1 prism-eyebrow text-prism-muted normal-case tracking-normal">
            Free tier
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function IntegrationStatus({ status, loading, error, compact = false }) {
  if (loading) {
    return (
      <div className={compact ? "" : "prism-panel p-5"}>
        <p className="prism-body text-prism-muted">Checking API connections…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={compact ? "" : "prism-panel p-5"}>
        <p className="prism-body text-rose-300">{error}</p>
        <p className="mt-2 prism-label text-prism-muted">
          Is the backend running on {DISPLAY_API_BASE}?
        </p>
      </div>
    );
  }

  const integrations = normalizeIntegrations(status);

  if (!integrations) {
    return (
      <div className={compact ? "" : "prism-panel p-5"}>
        <p className="prism-body text-prism-muted">Integration status unavailable.</p>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "prism-panel p-5 md:p-6"}>
      {!compact ? (
        <div className="mb-4 border-b border-white/[0.08] pb-4">
          <h2 className="prism-h3 text-white">API integrations</h2>
          <p className="mt-1 prism-body text-prism-muted">
            Connection status for GitHub and Gemini.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <IntegrationCard integration={integrations.github} />
        <IntegrationCard integration={integrations.gemini} />
      </div>
    </div>
  );
}
