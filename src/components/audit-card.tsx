"use client";

import { useState } from "react";
import type { AuditResult } from "@/lib/types";
import { generateAuditPDF } from "@/lib/generate-pdf";

function scoreColor(score: number, max: number): string {
  const ratio = score / max;
  if (ratio === 0) return "text-red-400";
  if (ratio <= 0.25) return "text-red-400";
  if (ratio <= 0.5) return "text-orange-400";
  if (ratio <= 0.75) return "text-yellow-400";
  return "text-green-400";
}

function barColor(score: number, max: number): string {
  const ratio = score / max;
  if (ratio === 0) return "bg-red-500";
  if (ratio <= 0.25) return "bg-red-500";
  if (ratio <= 0.5) return "bg-orange-500";
  if (ratio <= 0.75) return "bg-yellow-500";
  return "bg-green-500";
}

function leadLabel(score: number, max: number): { text: string; color: string } {
  const ratio = score / max;
  if (ratio === 0)
    return { text: "HIGH-VALUE LEAD", color: "bg-red-500/20 text-red-400 border-red-500/30" };
  if (ratio <= 0.25)
    return { text: "STRONG LEAD", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
  if (ratio <= 0.5)
    return { text: "MODERATE LEAD", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
  return { text: "LOW PRIORITY", color: "bg-green-500/20 text-green-400 border-green-500/30" };
}

export function AuditCard({ result }: { result: AuditResult }) {
  const label = leadLabel(result.score, result.maxScore);
  const [generating, setGenerating] = useState(false);

  return (
    <div className="rounded-xl border border-card-border bg-card-bg overflow-hidden animate-fade-in-up">
      <div className="px-6 py-5 border-b border-card-border flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{result.businessName}</h3>
          <p className="text-sm text-muted">{result.city}</p>
        </div>
        <span
          className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border ${label.color}`}
        >
          {label.text}
        </span>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-end gap-3 mb-2">
          <span className={`text-5xl font-bold tabular-nums ${scoreColor(result.score, result.maxScore)}`}>
            {result.score}
          </span>
          <span className="text-lg text-muted mb-1.5">/ {result.maxScore}</span>
        </div>
        <p className="text-xs text-muted uppercase tracking-wider mb-3">
          Video Presence Score
        </p>

        <div className="w-full h-2 rounded-full bg-input-bg overflow-hidden">
          <div
            className={`h-full rounded-full score-bar-animated ${barColor(result.score, result.maxScore)}`}
            style={{ width: `${(result.score / result.maxScore) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-6 pb-6 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Checks
        </h4>
        {result.checks.map((check, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-card-border bg-input-bg px-4 py-3"
          >
            <div className="mt-0.5">
              {check.found ? (
                <svg
                  className="w-4 h-4 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{check.label}</p>
              <p className="text-xs text-muted truncate">{check.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-input-bg border-t border-card-border">
        <p className="text-sm leading-relaxed">{result.summary}</p>
      </div>

      <div className="px-6 py-3 border-t border-card-border flex items-center justify-between">
        <span className="text-[10px] text-muted">
          {new Date(result.timestamp).toLocaleString()}
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              setGenerating(true);
              try {
                await generateAuditPDF(result);
              } finally {
                setGenerating(false);
              }
            }}
            disabled={generating}
            className="text-xs text-accent hover:text-accent-dim transition-colors disabled:opacity-50"
          >
            {generating ? "Generating..." : "Download PDF"}
          </button>
          <button
            onClick={() => {
              const text = [
                `Video Gap Audit: ${result.businessName} (${result.city})`,
                `Score: ${result.score}/${result.maxScore}`,
                "",
                ...result.checks.map(
                  (c) => `${c.found ? "[Y]" : "[N]"} ${c.label}: ${c.detail}`
                ),
                "",
                result.summary,
              ].join("\n");
              navigator.clipboard.writeText(text);
            }}
            className="text-xs text-accent hover:text-accent-dim transition-colors"
          >
            Copy to clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
