import { useState } from "react";

function getColor(score) {
  if (score <= 30) return "bg-green-500/20 border-green-400/50";
  if (score <= 70) return "bg-yellow-500/20 border-yellow-400/50";
  return "bg-red-500/20 border-red-400/50";
}

function barColor(score) {
  if (score <= 30) return "bg-emerald-400";
  if (score <= 70) return "bg-amber-300";
  return "bg-rose-400";
}

function fileNameShort(name) {
  if (!name) return "unknown";
  const parts = name.split("/");
  return parts.length > 2 ? `…/${parts.slice(-2).join("/")}` : name;
}

function HeatmapCell({ file }) {
  const [hover, setHover] = useState(false);
  const score = Number(file.riskScore) || 0;

  return (
    <div
      className={`relative rounded-xl border p-3 transition hover:-translate-y-0.5 hover:border-white/30 ${getColor(score)}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      tabIndex={0}
    >
      <div className="truncate text-sm font-semibold text-white" title={file.name}>
        {fileNameShort(file.name)}
      </div>

      <div className="mt-1 text-xs text-slate-300/90">
        Risk: <span className="font-mono tabular-nums">{score}</span> ({file.riskLevel})
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded bg-white/10">
        <div
          className={`h-1 rounded ${barColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-prism-muted">
          +{file.additions ?? 0}
        </span>
        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-prism-muted">
          −{file.deletions ?? 0}
        </span>
        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-prism-muted capitalize">
          {file.status ?? "—"}
        </span>
      </div>

      {hover && (file.riskReasons?.length > 0 || file.name) ? (
        <div
          className="absolute left-0 right-0 top-full z-20 mt-2 rounded-lg border border-white/[0.12] bg-[#0c141c]/95 p-3 shadow-xl backdrop-blur-md"
          role="tooltip"
        >
          <div className="mb-1 truncate font-mono text-xs text-cyan-200">{file.name}</div>
          <div className="text-xs text-prism-muted">
            +{file.additions ?? 0} / −{file.deletions ?? 0} lines · {file.status}
          </div>
          <ul className="mt-2 space-y-1 text-xs text-slate-200">
            {(file.riskReasons ?? []).map((reason) => (
              <li key={reason} className="flex gap-1.5">
                <span className="text-cyan-400">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function PRHeatmap({ files }) {
  const list = Array.isArray(files) ? files : [];

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-8 text-center prism-body text-prism-muted">
        No files to map. Run a PR analysis to populate the heatmap.
      </div>
    );
  }

  const highCount = list.filter((f) => f.riskLevel === "HIGH").length;
  const medCount = list.filter((f) => f.riskLevel === "MEDIUM").length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <p className="prism-body text-prism-muted">
          {list.length} file{list.length === 1 ? "" : "s"} ·{" "}
          <span className="text-rose-300">{highCount} high</span>
          {" · "}
          <span className="text-amber-200">{medCount} medium</span>
        </p>
        <div className="flex gap-3 prism-label text-prism-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-300" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> High
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {list.map((file) => (
          <HeatmapCell key={file.name} file={file} />
        ))}
      </div>
    </div>
  );
}
