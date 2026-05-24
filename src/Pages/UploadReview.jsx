import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Shield,
  Zap,
  GitBranch,
  Upload,
  FileCode2,
  X,
} from "lucide-react";
import IntegrationStatus from "../components/IntegrationStatus.jsx";
import { API_BASE, fetchIntegrationStatus } from "../lib/api.js";

export default function UploadReview() {
  const navigate = useNavigate();
  const [prUrl, setPrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [branch, setBranch] = useState("main");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [integrationLoading, setIntegrationLoading] = useState(true);
  const [integrationError, setIntegrationError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadIntegrations() {
      setIntegrationLoading(true);
      setIntegrationError("");
      try {
        const status = await fetchIntegrationStatus();
        if (!cancelled) setIntegrationStatus(status);
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

  async function handleAnalyze() {
    const trimmed = prUrl.trim();
    if (!trimmed) {
      setError("Please enter a GitHub pull request URL.");
      return;
    }
    if (!/^https?:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+(?:[/?#].*)?$/i.test(trimmed)) {
      setError(
        "Please enter a valid GitHub PR URL (e.g. https://github.com/org/repo/pull/123)."
      );
      return;
    }

    if (!integrationStatus?.gemini?.configured) {
      setError(
        "Gemini API key is not loaded on the server."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/analyze-pr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prUrl: trimmed,
          branch: branch.trim() || undefined,
          reviewerNotes: notes.trim() || undefined,
          uploadedFileNames: files.map((f) => f.name),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze PR");
      }

      localStorage.setItem("prismData", JSON.stringify(data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(
    () => [
      {
        label: "Supported checks",
        value: "Security, bugs, quality",
        icon: Shield,
        accent: "from-rose-500/20 to-rose-400/5",
        border: "border-rose-400/20",
        iconColor: "text-rose-300",
      },
      {
        label: "Accepted inputs",
        value: "GitHub links + source files",
        icon: GitBranch,
        accent: "from-violet-500/20 to-violet-400/5",
        border: "border-violet-400/20",
        iconColor: "text-violet-300",
      },
      {
        label: "Output",
        value: "Risk, comments, merge insight",
        icon: Sparkles,
        accent: "from-cyan-500/20 to-cyan-400/5",
        border: "border-cyan-400/20",
        iconColor: "text-cyan-300",
      },
    ],
    []
  );

  const quickChecks = [
    { label: "Bug risk detection", tone: "cyan" },
    { label: "Code quality review", tone: "violet" },
    { label: "Maintainability analysis", tone: "emerald" },
    { label: "Security findings", tone: "rose" },
    { label: "Performance hotspots", tone: "amber" },
    { label: "Architecture signal review", tone: "fuchsia" },
  ];

  const toneDot = {
    cyan: "bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.7)]",
    violet: "bg-violet-400 shadow-[0_0_14px_rgba(167,139,250,0.7)]",
    emerald: "bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.7)]",
    rose: "bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.7)]",
    amber: "bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.7)]",
    fuchsia: "bg-fuchsia-400 shadow-[0_0_14px_rgba(232,121,249,0.7)]",
  };

  function handleFiles(selectedFiles) {
    const arr = Array.from(selectedFiles || []);
    setFiles((prev) => [...prev, ...arr]);
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }

  function Logo() {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-fuchsia-400/15 blur-xl" />
          <svg
            viewBox="0 0 64 64"
            aria-label="Prism logo"
            className="relative h-9 w-9 text-prism-accent drop-shadow-[0_0_18px_rgba(109,230,255,0.18)]"
          >
            <defs>
              <linearGradient id="prismGlowUpload" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#79e6ff" />
                <stop offset="55%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <path
              d="M16 18 30 10l18 10v24L34 54 16 44Z"
              fill="none"
              stroke="url(#prismGlowUpload)"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M30 10v24L16 44"
              fill="none"
              stroke="url(#prismGlowUpload)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M30 34 48 20"
              fill="none"
              stroke="url(#prismGlowUpload)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <div className="prism-label font-semibold tracking-[0.1em] text-white uppercase">
            Prism
          </div>
          <div className="prism-eyebrow text-prism-muted normal-case tracking-[0.08em]">
            Review intake
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        body {
          background:
            radial-gradient(circle at 12% 8%, rgba(103, 232, 249, 0.1), transparent 22%),
            radial-gradient(circle at 88% 12%, rgba(192, 132, 252, 0.12), transparent 24%),
            radial-gradient(circle at 50% 100%, rgba(232, 121, 249, 0.08), transparent 30%),
            linear-gradient(180deg, #071019 0%, #0a0f18 50%, #071019 100%);
        }
      `}</style>

      <div className="min-h-screen overflow-x-hidden text-white">
        <header className="sticky top-0 z-30 border-b border-white/[0.1] bg-[#071019]/88 backdrop-blur-2xl">
          <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between px-4 py-3.5 md:px-8">
            <Logo />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 prism-label font-medium text-prism-muted transition hover:border-violet-300/30 hover:text-white"
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="rounded-full bg-[linear-gradient(135deg,#e9d5ff_0%,#7dd3fc_40%,#67e8f9_100%)] px-4 py-2 prism-label font-semibold text-slate-950 shadow-[0_12px_34px_rgba(167,139,250,0.25)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Analyzing..." : "Start Review"}
              </button>
            </div>
          </div>
        </header>

        <main className="relative">
          <div className="noise absolute inset-0 opacity-[0.12]" />
          <div className="absolute left-[8%] top-24 h-48 w-48 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute right-[6%] top-32 h-56 w-56 rounded-full bg-fuchsia-500/12 blur-3xl" />
          <div className="absolute bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative mx-auto w-full max-w-[1380px] space-y-8 px-4 py-8 md:space-y-10 md:px-8 md:py-10">
            <section className="prism-panel relative overflow-hidden p-6 md:p-8">
              <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(192,132,252,0.22),transparent_68%)]" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(103,232,249,0.18),transparent_70%)]" />

              <div className="relative grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-1.5 prism-eyebrow text-fuchsia-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    Upload code for AI review
                  </div>

                  <h1 className="prism-h1 max-w-2xl text-white">
                    Bring in a repository or files. Let PRISM inspect risk before merge.
                  </h1>

                  <p className="mt-4 max-w-2xl prism-body-lg text-prism-muted">
                    Upload code files, paste a GitHub repository URL, and start a
                    structured review for bugs, quality issues, maintainability
                    concerns, and engineering risk.
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    {stats.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={`rounded-xl border bg-gradient-to-br p-4 ${item.border} ${item.accent}`}
                        >
                          <Icon className={`mb-2 h-5 w-5 ${item.iconColor}`} />
                          <div className="prism-eyebrow text-prism-muted normal-case tracking-normal">
                            {item.label}
                          </div>
                          <div className="mt-2 prism-label font-semibold text-white">
                            {item.value}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-violet-400/20 bg-[linear-gradient(160deg,rgba(46,16,78,0.45),rgba(13,21,31,0.95))] p-5 shadow-[0_20px_70px_rgba(109,40,217,0.18)]">
                  <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-4">
                    <div>
                      <div className="prism-h3 text-white">Review preparation</div>
                      <div className="prism-label text-prism-muted">
                        Choose one or both input methods
                      </div>
                    </div>
                    <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 prism-eyebrow text-cyan-100 normal-case tracking-normal">
                      Intake ready
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {quickChecks.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 transition hover:border-white/[0.14] hover:bg-white/[0.06]"
                      >
                        <span className="prism-label text-slate-200">{item.label}</span>
                        <span className={`h-2.5 w-2.5 rounded-full ${toneDot[item.tone]}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <IntegrationStatus
              status={integrationStatus}
              loading={integrationLoading}
              error={integrationError}
            />

            <section className="grid gap-7 xl:grid-cols-2">
              <div className="prism-panel p-6 md:p-7">
                <div className="mb-5 flex items-center gap-3 border-b border-white/[0.08] pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-400/10">
                    <GitBranch className="h-5 w-5 text-violet-300" />
                  </div>
                  <div>
                    <h2 className="prism-h3 text-white">Connect repository</h2>
                    <p className="prism-body text-prism-muted">
                      Paste a GitHub repository or pull request URL.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block prism-label font-medium text-slate-200">
                      Repository or PR URL
                    </label>
                    <input
                      value={prUrl}
                      onChange={(e) => setPrUrl(e.target.value)}
                      placeholder="https://github.com/org/repo/pull/123"
                      disabled={loading}
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 prism-body text-white outline-none placeholder:text-prism-muted focus:border-violet-300/40 focus:ring-2 focus:ring-violet-400/15 disabled:opacity-60"
                    />
                    {error ? (
                      <p className="mt-2 prism-label text-rose-300">{error}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-2 block prism-label font-medium text-slate-200">
                      Branch
                    </label>
                    <input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 prism-body text-white outline-none placeholder:text-prism-muted focus:border-violet-300/40 focus:ring-2 focus:ring-violet-400/15"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block prism-label font-medium text-slate-200">
                      Review notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={5}
                      placeholder="Focus on authentication flow, API security, performance regressions..."
                      className="w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 prism-body text-white outline-none placeholder:text-prism-muted focus:border-violet-300/40 focus:ring-2 focus:ring-violet-400/15"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      className="rounded-xl bg-white px-5 py-2.5 prism-label font-semibold text-slate-950 shadow-[0_14px_32px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5"
                    >
                      Validate Repository
                    </button>
                    <button
                      type="button"
                      className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 prism-label font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/[0.07]"
                    >
                      Import Metadata
                    </button>
                  </div>
                </div>
              </div>

              <div className="prism-panel p-6 md:p-7">
                <div className="mb-5 flex items-center gap-3 border-b border-white/[0.08] pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10">
                    <Upload className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <h2 className="prism-h3 text-white">Upload source files</h2>
                    <p className="prism-body text-prism-muted">
                      Drag and drop code files, folders, or archives.
                    </p>
                  </div>
                </div>

                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`group flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
                    dragActive
                      ? "border-cyan-300/50 bg-cyan-300/[0.08] shadow-[0_0_40px_rgba(103,232,249,0.15)]"
                      : "border-violet-400/25 bg-[linear-gradient(180deg,rgba(109,40,217,0.08),rgba(255,255,255,0.02))] hover:border-fuchsia-300/35 hover:bg-fuchsia-400/[0.06]"
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(103,232,249,0.15),rgba(192,132,252,0.15))] shadow-[0_0_30px_rgba(167,139,250,0.2)] transition group-hover:scale-105">
                    <Upload className="h-8 w-8 text-cyan-100" />
                  </div>
                  <div className="prism-h3 text-white">Drop files here or click to browse</div>
                  <p className="mt-2 max-w-md prism-body text-prism-muted">
                    .js, .ts, .tsx, .jsx, .py, .cpp, .java, config files, or archives.
                  </p>
                </label>

                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="prism-label font-semibold text-white">Uploaded files</div>
                    <div className="prism-label text-prism-muted">{files.length} selected</div>
                  </div>
                  <div className="space-y-2.5">
                    {files.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-6 text-center prism-body text-prism-muted">
                        No files added yet.
                      </div>
                    ) : (
                      files.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between rounded-xl border border-white/[0.1] bg-[linear-gradient(90deg,rgba(103,232,249,0.06),rgba(192,132,252,0.04))] px-4 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <FileCode2 className="h-5 w-5 shrink-0 text-violet-300" />
                            <div className="min-w-0">
                              <div className="truncate prism-label font-medium text-white">
                                {file.name}
                              </div>
                              <div className="text-xs text-prism-muted">
                                {(file.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04] text-prism-muted transition hover:border-rose-300/30 hover:text-rose-200"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="prism-panel overflow-hidden p-6 md:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(232,121,249,0.08),transparent_40%)]" />
              <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 prism-eyebrow text-fuchsia-200">
                    <Zap className="h-3.5 w-3.5" />
                    Final step
                  </div>
                  <h2 className="prism-h2 text-white">Review configuration</h2>
                  <p className="mt-3 max-w-3xl prism-body-lg text-prism-muted">
                    PRISM will inspect uploaded sources or repository context for bug
                    risks, quality regressions, maintainability issues, security
                    concerns, and performance hotspots.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      "Security",
                      "Performance",
                      "Maintainability",
                      "Bug risk",
                      "Code smell",
                      "Review summary",
                    ].map((pill) => (
                      <span
                        key={pill}
                        className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 prism-label font-medium text-slate-200"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-2.5 prism-label font-semibold text-white transition hover:border-white/[0.18]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="rounded-xl bg-[linear-gradient(135deg,#e9d5ff_0%,#7dd3fc_42%,#67e8f9_100%)] px-5 py-2.5 prism-label font-semibold text-slate-950 shadow-[0_14px_40px_rgba(167,139,250,0.28)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Analyzing..." : "Run AI Review"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
