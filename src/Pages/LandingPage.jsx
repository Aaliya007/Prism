import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "../assets/hero-bg.png";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const intro = document.getElementById("introOverlay");
    const shell = document.getElementById("landingShell");

    const timer = setTimeout(() => {
      intro?.classList.add("hide");
      shell?.classList.add("ready");
    }, 2300);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("reveal-show");
        });
      },
      { threshold: 0.14 }
    );

    const els = document.querySelectorAll(".reveal");
    els.forEach((el) => observer.observe(el));

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  function Logo() {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-cyan-400/15 blur-xl" />
          <svg
            viewBox="0 0 64 64"
            aria-label="Prism logo"
            className="relative h-10 w-10 text-prism-accent drop-shadow-[0_0_18px_rgba(109,230,255,0.18)]"
          >
            <defs>
              <linearGradient id="prismGlowLanding" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#79e6ff" />
                <stop offset="55%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#93c5fd" />
              </linearGradient>
            </defs>
            <path
              d="M16 18 30 10l18 10v24L34 54 16 44Z"
              fill="none"
              stroke="url(#prismGlowLanding)"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path
              d="M30 10v24L16 44"
              fill="none"
              stroke="url(#prismGlowLanding)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M30 34 48 20"
              fill="none"
              stroke="url(#prismGlowLanding)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div>
          <div className="text-sm font-semibold tracking-[0.1em] text-white uppercase">
            Prism
          </div>
          <div className="text-xs tracking-[0.08em] text-prism-muted uppercase">
            Engineering intelligence
          </div>
        </div>
      </div>
    );
  }

  function NavBar() {
    return (
      <header className="sticky top-0 z-50 border-b border-violet-400/10 bg-[#071019]/80 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Logo />

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#problem" className="prism-body text-prism-muted transition hover:text-white">
              Problem
            </a>
            <a href="#features" className="prism-body text-prism-muted transition hover:text-white">
              Features
            </a>
            <a href="#workflow" className="prism-body text-prism-muted transition hover:text-white">
              How it works
            </a>
            <a href="#compare" className="prism-body text-prism-muted transition hover:text-white">
              Compare
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.07]"
            >
              Open Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate("/upload-review")}
              className="rounded-full bg-[linear-gradient(135deg,#e9d5ff_0%,#7dd3fc_40%,#67e8f9_100%)] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_12px_34px_rgba(167,139,250,0.28)] transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
            >
              Upload Review
            </button>
          </div>
        </div>
      </header>
    );
  }

  function CommandCenter() {
    return (
      <div className="reveal mt-16 w-full max-w-4xl md:mt-24">
        <div className="overflow-hidden rounded-2xl border border-violet-400/25 bg-[linear-gradient(165deg,rgba(76,29,149,0.28),rgba(13,21,31,0.96))] p-4 shadow-[0_24px_80px_rgba(109,40,217,0.2)] md:p-5">
          <div className="overflow-hidden rounded-2xl border border-cyan-400/15 bg-[#09111a]/92 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/[0.1] px-4 py-3">
              <div>
                <div className="prism-h3 text-white">PRISM Command Center</div>
                <div className="prism-label text-prism-muted">
                  org/acme-platform · PR #418
                </div>
              </div>
              <div className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 prism-eyebrow text-cyan-100 normal-case tracking-normal">
                Live
              </div>
            </div>

            <div className="grid gap-4 p-4">
              <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center justify-between prism-label">
                  <span className="text-prism-muted">Review completion</span>
                  <span className="font-semibold text-white">82%</span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full w-[82%] rounded-full bg-[linear-gradient(90deg,#67e8f9_0%,#38bdf8_50%,#c084fc_100%)] shadow-[0_0_24px_rgba(56,189,248,0.32)]" />
                  <div className="absolute inset-y-0 w-20 animate-scan bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
                <div className="mt-3 flex items-center gap-2 prism-label text-prism-muted">
                  <span className="h-2.5 w-2.5 animate-pulseSoft rounded-full bg-emerald-400" />
                  Parsing diffs, evaluating team context, drafting comments
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  ["Files changed", "14", "border-cyan-400/20", "text-cyan-200"],
                  ["Findings", "11", "border-violet-400/20", "text-violet-200"],
                  ["Risk", "Elevated", "border-amber-400/25", "text-amber-300"],
                ].map(([label, value, border, valueColor]) => (
                  <div
                    key={label}
                    className={`rounded-xl border bg-white/[0.04] p-3 text-center ${border}`}
                  >
                    <div className="prism-eyebrow text-prism-muted normal-case tracking-normal">
                      {label}
                    </div>
                    <div className={`mt-1 prism-stat ${valueColor}`}>{value}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-4">
                  <div className="mb-3 prism-label font-semibold text-white">
                    Review comments
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-white/[0.08] bg-[#0b131d] p-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-rose-400/15 px-2.5 py-1 prism-eyebrow text-rose-200 normal-case tracking-normal">
                          Critical
                        </span>
                        <span className="prism-label text-prism-muted">
                          config/bootstrap.ts:84
                        </span>
                      </div>
                      <p className="mt-2 prism-body text-slate-200">
                        Client runtime appears to expose a token source. Move
                        credential access to a server-only boundary.
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/[0.08] bg-[#0b131d] p-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-amber-400/15 px-2.5 py-1 prism-eyebrow text-amber-200 normal-case tracking-normal">
                          High
                        </span>
                        <span className="prism-label text-prism-muted">
                          review/engine.ts:211
                        </span>
                      </div>
                      <p className="mt-2 prism-body text-slate-200">
                        Parser is recreated inside the loop. Hoist initialization
                        to reduce repeated allocation cost.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-4">
                  <div className="mb-3 prism-label font-semibold text-white">
                    Agent status
                  </div>
                  <div className="space-y-2.5">
                    {[
                      ["Security", "bg-rose-400"],
                      ["Performance", "bg-amber-300"],
                      ["Maintainability", "bg-emerald-300"],
                      ["Human Risk", "bg-cyan-300"],
                    ].map(([name, dot]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#0b131d] px-3 py-2.5"
                      >
                        <span className="prism-label text-white">{name}</span>
                        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Hero() {
    return (
      <section className="relative min-h-[92vh] overflow-hidden border-b border-white/[0.1]">
        <div
          className="absolute inset-0 bg-cover bg-[center_right] bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
          role="img"
          aria-label="Prism engineering intelligence background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050810]/96 via-[#0a0618]/80 to-[#050810]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071019] via-transparent to-[#071019]/55" />
        <div className="pointer-events-none absolute left-[6%] top-28 h-52 w-52 rounded-full bg-cyan-400/14 blur-3xl" />
        <div className="pointer-events-none absolute right-[4%] top-20 h-60 w-60 rounded-full bg-fuchsia-500/14 blur-3xl" />
        <div className="pointer-events-none absolute bottom-32 left-1/3 h-40 w-40 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="noise absolute inset-0 opacity-[0.1]" />

        <div className="relative mx-auto flex w-full max-w-[1280px] flex-col items-center px-4 py-20 text-center md:px-8 md:py-28">
          <div className="reveal w-full max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-[linear-gradient(90deg,rgba(103,232,249,0.1),rgba(192,132,252,0.12))] px-3 py-1.5 prism-eyebrow text-fuchsia-100">
              <span className="h-2 w-2 animate-pulseSoft rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400 shadow-[0_0_18px_rgba(232,121,249,0.7)]" />
              AI-powered engineering intelligence
            </div>

            <h1 className="prism-display-gradient">Prism</h1>

            <p className="mx-auto mt-5 max-w-2xl prism-subhead bg-[linear-gradient(90deg,#e0f2fe,#ddd6fe,#fae8ff)] bg-clip-text text-transparent">
              AI That Understands Engineering Teams — Not Just Code.
            </p>

            <p className="mx-auto mt-4 max-w-2xl prism-body-lg text-slate-300/90">
              PRISM AI analyzes pull requests, contributor behavior, and
              organizational engineering risk before code reaches production.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/upload-review")}
                className="rounded-2xl bg-[linear-gradient(135deg,#e9d5ff_0%,#7dd3fc_42%,#67e8f9_100%)] px-6 py-3 prism-label font-semibold text-slate-950 shadow-[0_14px_40px_rgba(167,139,250,0.3)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Upload Review
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-2xl border border-violet-400/25 bg-violet-500/10 px-6 py-3 prism-label font-semibold text-violet-100 backdrop-blur-sm transition hover:border-fuchsia-300/35 hover:bg-violet-500/15"
              >
                Open Dashboard
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Pull requests analyzed",
                  value: "128k",
                  border: "border-cyan-400/25",
                  accent: "from-cyan-500/18 to-cyan-400/5",
                  valueColor: "text-cyan-200",
                },
                {
                  label: "Review hours saved",
                  value: "4.2h",
                  border: "border-violet-400/25",
                  accent: "from-violet-500/18 to-violet-400/5",
                  valueColor: "text-violet-200",
                },
                {
                  label: "Merge confidence",
                  value: "91%",
                  border: "border-fuchsia-400/25",
                  accent: "from-fuchsia-500/18 to-fuchsia-400/5",
                  valueColor: "text-fuchsia-200",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl border bg-gradient-to-br p-4 backdrop-blur-sm ${stat.border} ${stat.accent}`}
                >
                  <div className="prism-eyebrow text-prism-muted normal-case tracking-normal">
                    {stat.label}
                  </div>
                  <div className={`mt-2 prism-stat ${stat.valueColor}`}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-4 h-px w-full max-w-md bg-gradient-to-r from-transparent via-violet-400/40 to-transparent md:mt-6"
            aria-hidden="true"
          />

          <CommandCenter />
        </div>
      </section>
    );
  }

  function TrustBar() {
    const items = [
      { label: "GitHub Integration", dot: "bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.7)]", border: "border-cyan-400/20" },
      { label: "Real-time AI Review", dot: "bg-violet-400 shadow-[0_0_16px_rgba(167,139,250,0.7)]", border: "border-violet-400/20" },
      { label: "Multi-agent Analysis", dot: "bg-fuchsia-400 shadow-[0_0_16px_rgba(232,121,249,0.7)]", border: "border-fuchsia-400/20" },
      { label: "Enterprise-ready", dot: "bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.7)]", border: "border-emerald-400/20" },
    ];

    return (
      <section className="border-y border-violet-400/10 bg-[linear-gradient(180deg,#08111a,rgba(46,16,78,0.12),#08111a)]">
        <div className="mx-auto grid w-full max-w-[1280px] gap-4 px-4 py-5 md:grid-cols-4 md:px-8">
          {items.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-xl border bg-white/[0.03] px-4 py-3 prism-label text-slate-200 ${item.border}`}
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function ProblemSection() {
    const problems = [
      {
        title: "Review fatigue",
        body: "Senior engineers spend too much time re-reading patterns they have already seen hundreds of times.",
      },
      {
        title: "Missed production bugs",
        body: "Important edge cases slip through because code review happens under deadline pressure and fragmented context.",
      },
      {
        title: "Overloaded reviewers",
        body: "A handful of trusted reviewers become bottlenecks across critical pull requests and team decisions.",
      },
      {
        title: "No organizational awareness",
        body: "Most review tools understand code diffs but ignore reviewer load, contributor risk, and engineering history.",
      },
    ];

    return (
      <section id="problem" className="relative prism-section">
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
          <div className="reveal max-w-2xl">
            <div className="mb-5 prism-eyebrow text-2xl text-fuchsia-300">
              The problem
            </div>
            <h2 className="prism-h2 text-white">
              Modern code review breaks long before the code does.
            </h2>
            <p className="mt-5 prism-body-lg text-prism-muted">
              Teams do not just need better static analysis. They need visibility
              into engineering behavior, reviewer bandwidth, and systemic merge
              risk.
            </p>
          </div>

          <div className="mt-14 md:mt-16 grid gap-6 md:gap-8 lg:grid-cols-[1.05fr_.95fr]">
            <div className="reveal rounded-[30px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(13,21,31,0.95),rgba(9,16,25,0.95))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Review load signal
                  </div>
                  <div className="text-sm text-prism-muted">
                    Humans are carrying invisible system risk
                  </div>
                </div>
                <div className="rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1 text-xs text-amber-200">
                  74% overload concentration
                </div>
              </div>

              <div className="space-y-4">
                {[
                  ["Senior reviewer saturation", "89%"],
                  ["Context-switching impact", "63%"],
                  ["High-risk PRs without deep review", "41%"],
                  ["Late-cycle bug discovery", "27%"],
                ].map(([label, value], idx) => (
                  <div key={idx} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-prism-muted">{label}</span>
                      <span className="font-semibold text-white">{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.07]">
                      <div
                        className={`h-2 rounded-full ${
                          idx === 0
                            ? "w-[89%] bg-rose-400"
                            : idx === 1
                            ? "w-[63%] bg-amber-300"
                            : idx === 2
                            ? "w-[41%] bg-cyan-300"
                            : "w-[27%] bg-emerald-300"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:gap-7">
              {problems.map((item, i) => (
                <div
                  key={item.title}
                  className="reveal rounded-[26px] border border-white/[0.06] bg-white/[0.03] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <div className="prism-h3 text-white">
                    {item.title}
                  </div>
                  <p className="mt-3 prism-body text-prism-muted">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  function FeaturesSection() {
    const cards = [
      {
        title: "Human-Aware Risk Detection",
        body: "PRISM models contributor history, reviewer pressure, code ownership patterns, and change volatility before the merge happens.",
        size: "lg:col-span-2 lg:row-span-2",
      },
      {
        title: "Multi-Agent AI Review",
        body: "Security, performance, maintainability, and workflow agents review the same pull request in parallel.",
        size: "",
      },
      {
        title: "AI Debate Mode",
        body: "Agents can challenge each other on uncertain findings to reduce noisy or low-confidence suggestions.",
        size: "",
      },
      {
        title: "Engineering Timeline Intelligence",
        body: "PRISM turns review history into a readable timeline of risk, discussion, ownership, and merge readiness.",
        size: "lg:col-span-2",
      },
    ];

    return (
      <section id="features" className="relative prism-section">
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
          <div className="reveal max-w-2xl">
            <div className="mb-5 prism-eyebrow text-2xl text-violet-300">
              Core features
            </div>
            <h2 className="prism-h2 text-white">
              Built for teams shipping serious software.
            </h2>
            <p className="mt-5 prism-body-lg text-prism-muted">
              This is not a wrapper on top of linting. PRISM is an engineering
              intelligence layer designed for code review at team scale.
            </p>
          </div>

          <div className="mt-14 md:mt-16 grid auto-rows-[minmax(300px,auto)] gap-6 md:gap-8 lg:grid-cols-3">
            {cards.map((card, i) => (
              <div
                key={card.title}
                className={`reveal group relative overflow-hidden rounded-[30px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(13,21,31,0.95),rgba(9,16,25,0.95))] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.26)] ${card.size}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.08),transparent_26%)] opacity-70" />
                <div className="absolute right-6 top-6 h-20 w-20 rounded-[24px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-md transition duration-300 group-hover:scale-105" />

                <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-between gap-6">
                  <div className="max-w-[32rem] pr-24 pt-1">
                    <div className="prism-eyebrow text-cyan-200">
                      Feature {i + 1}
                    </div>
                    <h3 className="mt-3 prism-h3 text-white">
                      {card.title}
                    </h3>
                    <p className="mt-4 prism-body text-prism-muted">
                      {card.body}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm">
                    {i === 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-[#0b131d] p-3">
                          <div className="text-xs text-prism-muted">Ownership drift</div>
                          <div className="mt-1 text-lg font-semibold text-white">High</div>
                        </div>
                        <div className="rounded-xl bg-[#0b131d] p-3">
                          <div className="text-xs text-prism-muted">Reviewer load</div>
                          <div className="mt-1 text-lg font-semibold text-white">92%</div>
                        </div>
                        <div className="rounded-xl bg-[#0b131d] p-3">
                          <div className="text-xs text-prism-muted">Context gap</div>
                          <div className="mt-1 text-lg font-semibold text-white">Elevated</div>
                        </div>
                      </div>
                    )}

                    {i === 1 && (
                      <div className="space-y-2">
                        {["Security agent active", "Performance agent active", "Maintainability agent active"].map(
                          (label) => (
                            <div
                              key={label}
                              className="flex items-center justify-between rounded-xl bg-[#0b131d] px-3 py-2"
                            >
                              <span className="text-sm text-slate-200">{label}</span>
                              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.7)]"></span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {i === 2 && (
                      <div className="space-y-2">
                        <div className="rounded-xl bg-[#0b131d] p-3 text-sm text-slate-200">
                          Security agent disagrees with severity estimate.
                        </div>
                        <div className="rounded-xl bg-[#0b131d] p-3 text-sm text-slate-200">
                          Consensus updated after organizational context check.
                        </div>
                      </div>
                    )}

                    {i === 3 && (
                      <div className="grid gap-2">
                        {[
                          "09:12 PR ingested",
                          "09:15 Secret flagged",
                          "09:18 Bundle regression predicted",
                        ].map((event) => (
                          <div
                            key={event}
                            className="rounded-xl bg-[#0b131d] px-3 py-2 text-sm text-slate-200"
                          >
                            {event}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function WorkflowSection() {
    const steps = [
      "Connect GitHub",
      "Analyze Pull Request",
      "AI Risk Evaluation",
      "Actionable Engineering Insights",
    ];

    return (
      <section id="workflow" className="relative prism-section">
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
          <div className="reveal max-w-2xl">
            <div className="mb-5 prism-eyebrow text-2xl text-cyan-200">
              How it works
            </div>
            <h2 className="prism-h2 text-white">
              Four steps from pull request to engineering insight.
            </h2>
          </div>

          <div className="mt-14 md:mt-16 grid gap-6 md:gap-8 md:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step}
                className="reveal relative rounded-[28px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(13,21,31,0.94),rgba(9,16,25,0.94))] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                  0{i + 1}
                </div>
                <h3 className="prism-h3 text-white">
                  {step}
                </h3>
                <p className="mt-3 prism-body text-prism-muted">
                  {i === 0 &&
                    "Install PRISM, connect repositories, and begin streaming review intelligence in minutes."}
                  {i === 1 &&
                    "Diffs, ownership changes, dependency patterns, and contributor context are evaluated together."}
                  {i === 2 &&
                    "Specialized agents assign severity, debate uncertainty, and model hidden delivery risk."}
                  {i === 3 &&
                    "Your team gets ranked comments, merge confidence, and timeline-level engineering visibility."}
                </p>

                {i < steps.length - 1 && (
                  <div className="pointer-events-none absolute -right-3 top-10 hidden h-px w-6 bg-gradient-to-r from-cyan-300/50 to-transparent md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function ComparisonSection() {
    const rows = [
      ["Understands raw code diffs", "Yes", "Yes"],
      ["Understands engineering context", "Limited", "Deep"],
      ["Organizational awareness", "No", "Yes"],
      ["Human-aware intelligence", "No", "Yes"],
      ["Multi-agent reasoning", "Rare", "Built-in"],
      ["Reviewer load awareness", "No", "Yes"],
      ["Merge confidence scoring", "Basic", "Advanced"],
    ];

    return (
      <section id="compare" className="relative prism-section">
        <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
          <div className="reveal max-w-2xl">
            <div className="mb-5 prism-eyebrow text-2xl text-fuchsia-300">Comparison</div>
            <h2 className="prism-h2 text-white">
              Traditional AI reviewers stop at code. PRISM goes further.
            </h2>
          </div>

          <div className="reveal prism-compare-table mt-12 md:mt-14">
            <div className="compare-row bg-white/[0.03]">
              <div className="compare-cell prism-compare font-medium text-prism-muted">
                Capability
              </div>
              <div className="compare-cell prism-compare font-semibold text-white">
                Traditional AI Reviewers
              </div>
              <div className="compare-cell prism-compare font-semibold text-cyan-100">
                PRISM AI
              </div>
            </div>

            {rows.map((row) => (
              <div key={row[0]} className="compare-row">
                <div className="compare-cell prism-compare text-slate-200">
                  {row[0]}
                </div>
                <div className="compare-cell prism-compare font-semibold text-white">
                  {row[1]}
                </div>
                <div className="compare-cell prism-compare font-semibold text-cyan-100">
                  {row[2]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function FinalCTA() {
    return (
      <section className="relative prism-section">
        <div className="mx-auto w-full max-w-[1100px] px-4 md:px-8">
          <div className="reveal relative overflow-hidden rounded-[34px] border border-white/[0.06] bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.12),transparent_26%),linear-gradient(180deg,rgba(13,21,31,0.96),rgba(9,16,25,0.96))] px-6 py-14 text-center shadow-[0_28px_90px_rgba(0,0,0,0.38)] md:px-10 md:py-20">
            <div className="absolute inset-0 noise opacity-[0.14]" />
            <div className="relative">
              <div className="mb-5 prism-eyebrow text-cyan-200">
                Start now
              </div>
              <h2 className="mx-auto max-w-3xl prism-h2 text-white">
                Stop Reviewing Pull Requests Blindly.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl prism-body-lg text-prism-muted">
                Bring engineering intelligence into every merge decision.
              </p>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => navigate("/upload-review")}
                  className="rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_14px_34px_rgba(255,255,255,0.14)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(255,255,255,0.18)]"
                >
                  Upload Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function Footer() {
    return (
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-4 py-10 prism-body text-prism-muted md:flex-row md:items-center md:justify-between md:px-8">
          <Logo />
          <div>PRISM AI · Engineering intelligence for modern review workflows</div>
        </div>
      </footer>
    );
  }

  return (
    <>
      <style>{`
        body {
          background:
            radial-gradient(circle at 12% 8%, rgba(103, 232, 249, 0.09), transparent 22%),
            radial-gradient(circle at 88% 10%, rgba(192, 132, 252, 0.1), transparent 24%),
            radial-gradient(circle at 50% 100%, rgba(232, 121, 249, 0.06), transparent 28%),
            linear-gradient(180deg, #071019 0%, #0a0f18 50%, #071019 100%);
        }

        .intro-overlay {
          position: fixed;
          inset: 0;
          z-index: 70;
          display: grid;
          place-items: center;
          overflow: hidden;
          background:
            radial-gradient(circle at center, rgba(94, 234, 212, 0.08), transparent 24%),
            linear-gradient(180deg, #050b12 0%, #071019 100%);
          transition:
            opacity 700ms cubic-bezier(0.16, 1, 0.3, 1),
            visibility 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .intro-overlay.hide {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .intro-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(121,230,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(121,230,255,0.08) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at center, black, transparent 78%);
          opacity: 0.4;
          animation: gridPulse 3.2s ease-in-out infinite;
        }

        .intro-word {
          position: relative;
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.04em;
          color: #eff8ff;
          text-shadow: 0 0 40px rgba(121,230,255,0.15);
        }

        .intro-word::before {
          content: "";
          position: absolute;
          inset: -18px -30px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(121,230,255,0.16), transparent 70%);
          filter: blur(14px);
          z-index: -1;
        }

        .intro-word span {
          position: relative;
          display: inline-block;
          animation: introRise 1.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .landing-shell {
          opacity: 0;
          transform: scale(0.985);
          filter: saturate(0.92);
          transition:
            opacity 800ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 800ms cubic-bezier(0.16, 1, 0.3, 1),
            filter 800ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .landing-shell.ready {
          opacity: 1;
          transform: scale(1);
          filter: saturate(1);
        }

        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity 800ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }

        .reveal.reveal-show {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes introRise {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes gridPulse {
          0%, 100% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.45;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal,
          .reveal.reveal-show {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }

          .intro-grid,
          .intro-word span {
            animation: none !important;
          }

          .landing-shell,
          .intro-overlay {
            transition: none !important;
          }
        }
      `}</style>

      <div className="intro-overlay" id="introOverlay" aria-hidden="true">
        <div className="intro-grid"></div>
        <div className="intro-word">
          <span>Prism</span>
        </div>
      </div>

      <div className="landing-shell" id="landingShell">
        <div className="min-h-screen overflow-x-hidden bg-transparent text-white">
          <NavBar />
          <main>
            <Hero />
            <TrustBar />
            <ProblemSection />
            <FeaturesSection />
            <WorkflowSection />
            <ComparisonSection />
            <FinalCTA />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}