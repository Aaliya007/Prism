import { useMemo } from "react";
import { buildSuggestionsView } from "../lib/buildSuggestionsView.js";

const SEVERITY_STYLES = {
  CRITICAL: "bg-rose-500/20 text-rose-200",
  HIGH: "bg-rose-500/15 text-rose-100",
  MEDIUM: "bg-amber-500/20 text-amber-100",
  LOW: "bg-slate-500/20 text-slate-200",
};

function SeverityBadge({ severity }) {
  const key = String(severity ?? "MEDIUM").toUpperCase();
  return (
    <span
      className={`rounded-full px-2 py-0.5 prism-eyebrow normal-case tracking-normal ${
        SEVERITY_STYLES[key] ?? SEVERITY_STYLES.MEDIUM
      }`}
    >
      {key}
    </span>
  );
}

function dedupeKey(item) {
  return `${item.file}|${item.line}|${item.title}|${item.suggestion}`;
}

function LineLevelList({ items }) {
  if (!items?.length) return null;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={dedupeKey(item)}
          className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono text-xs leading-5 text-cyan-200">
              {item.file}:{item.line}
            </span>
            <SeverityBadge severity={item.severity} />
          </div>
          <p className="mt-2 prism-label font-semibold text-white">{item.title}</p>
          <p className="mt-1 prism-body text-sm leading-relaxed text-slate-300">
            {item.suggestion}
          </p>
        </li>
      ))}
    </ul>
  );
}

function FileGroupList({ groups }) {
  if (!groups?.length) return null;

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div
          key={group.file || "repo"}
          className="rounded-xl border border-white/[0.1] bg-white/[0.04] p-3"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="truncate font-mono text-xs text-cyan-200">
              {group.file || "Repository-wide"}
            </span>
            <span className="shrink-0 prism-eyebrow text-prism-muted normal-case tracking-normal">
              {group.items.length} item{group.items.length === 1 ? "" : "s"}
            </span>
          </div>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <li
                key={dedupeKey(item)}
                className="border-t border-white/[0.06] pt-2 first:border-0 first:pt-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="prism-label font-medium text-white">{item.title}</span>
                  {item.line ? (
                    <span className="font-mono text-[10px] text-prism-muted">L{item.line}</span>
                  ) : null}
                  <SeverityBadge severity={item.severity} />
                </div>
                <p className="mt-1 prism-body text-sm leading-relaxed text-slate-300">
                  {item.suggestion}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function HighLevelList({ items }) {
  if (!items?.length) return null;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={`${item.title}-${item.suggestion?.slice(0, 40)}`}
          className="flex gap-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-400/15 text-xs text-violet-200">
            ◆
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="prism-label font-semibold text-white">{item.title}</span>
              {item.tag ? (
                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-prism-muted">
                  {item.category ?? item.tag}
                </span>
              ) : null}
            </div>
            <p className="mt-1 prism-body text-sm leading-relaxed text-slate-300">
              {item.suggestion}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SectionBlock({ label, children, emptyMessage }) {
  const hasContent = Boolean(children);

  return (
    <div>
      <p className="mb-3 min-h-[1.125rem] prism-eyebrow text-prism-muted normal-case tracking-[0.06em] text-sm">
        {label}
      </p>
      {hasContent ? (
        children
      ) : (
        <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] px-4 py-5 text-center prism-body text-sm text-prism-muted">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

function ColumnHeader({ dotClass, title, count }) {
  return (
    <div className="mb-5 flex min-h-[2.75rem] items-center gap-2 border-b border-white/[0.08] pb-4">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
      <h3 className="prism-label text-2xl font-semibold text-white">{title}</h3>
      <span className="ml-auto shrink-0 prism-eyebrow text-prism-muted normal-case tracking-normal text-[3rem] leading-none">
        {count}
      </span>
    </div>
  );
}

export default function QuickFixSuggestions({ prismData }) {
  const view = useMemo(() => buildSuggestionsView(prismData), [prismData]);

  const hasCritical =
    view.criticalFixes.lineLevel.length > 0 || view.criticalFixes.byFile.length > 0;
  const hasGeneral =
    view.generalImprovements.highLevel.length > 0 ||
    view.generalImprovements.lineLevel.length > 0 ||
    view.generalImprovements.byFile.length > 0;

  if (!hasCritical && !hasGeneral) return null;

  return (
    <section className="prism-panel p-6 md:p-7">
      <div className="mb-1 prism-eyebrow text-cyan-200/90 normal-case tracking-normal text-lg font-semibold">
        Action playbook
      </div>
      <h2 className="prism-h3 text-white">Suggestions</h2>
      <p className="mt-1 mb-6 prism-body text-prism-muted">
        Line-specific fixes, file-grouped actions, and PR-wide improvements
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-x-10">
        {/* Critical fixes column */}
        <div className="flex min-w-0 flex-col">
          <ColumnHeader
            dotClass="bg-rose-400"
            title="Critical fixes"
            count={view.meta.criticalCount}
          />

          <div className="flex flex-col gap-6">
            <SectionBlock
              label="Line-level"
              emptyMessage="No critical line-level fixes flagged."
            >
              {view.criticalFixes.lineLevel.length > 0 ? (
                <LineLevelList items={view.criticalFixes.lineLevel} />
              ) : null}
            </SectionBlock>

            <SectionBlock
              label="By file"
              emptyMessage="No critical file-grouped fixes flagged."
            >
              {view.criticalFixes.byFile.length > 0 ? (
                <FileGroupList groups={view.criticalFixes.byFile} />
              ) : null}
            </SectionBlock>
          </div>
        </div>

        {/* General improvements column */}
        <div className="flex min-w-0 flex-col">
          <ColumnHeader
            dotClass="bg-violet-400"
            title="General improvements"
            count={view.meta.generalCount}
          />

          <div className="flex flex-col gap-6">
            <SectionBlock
              label="Architecture & process"
              emptyMessage="No PR-wide improvements listed."
            >
              {view.generalImprovements.highLevel.length > 0 ? (
                <HighLevelList items={view.generalImprovements.highLevel} />
              ) : null}
            </SectionBlock>

            <SectionBlock
              label="Line-level (non-critical)"
              emptyMessage="No non-critical line-level notes."
            >
              {view.generalImprovements.lineLevel.length > 0 ? (
                <LineLevelList items={view.generalImprovements.lineLevel} />
              ) : null}
            </SectionBlock>

            <SectionBlock
              label="By file"
              emptyMessage="No file-grouped improvements."
            >
              {view.generalImprovements.byFile.length > 0 ? (
                <FileGroupList groups={view.generalImprovements.byFile} />
              ) : null}
            </SectionBlock>
          </div>
        </div>
      </div>
    </section>
  );
}
