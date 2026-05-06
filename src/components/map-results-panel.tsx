"use client";

import type { DiscoverResult } from "@/lib/map-types";
import { scoreToColor } from "@/lib/map-types";
import { generateAuditPDF } from "@/lib/generate-pdf";

interface MapResultsPanelProps {
  results: DiscoverResult[];
  selectedPin: DiscoverResult | null;
  onSelectPin: (r: DiscoverResult) => void;
}

function scoreBadge(score: number, max: number) {
  const ratio = score / max;
  if (ratio === 0) return { text: "HIGH-VALUE", cls: "bg-red-500/20 text-red-400" };
  if (ratio <= 0.25) return { text: "STRONG", cls: "bg-orange-500/20 text-orange-400" };
  if (ratio <= 0.5) return { text: "MODERATE", cls: "bg-yellow-500/20 text-yellow-400" };
  return { text: "LOW", cls: "bg-green-500/20 text-green-400" };
}

export function MapResultsPanel({
  results,
  selectedPin,
  onSelectPin,
}: MapResultsPanelProps) {
  const sorted = [...results].sort(
    (a, b) => a.audit.score - b.audit.score
  );

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted text-sm">
          No results yet. Click the map and scan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
      {sorted.map((r) => {
        const badge = scoreBadge(r.audit.score, r.audit.maxScore);
        const isSelected = selectedPin?.placeId === r.placeId;

        return (
          <button
            key={r.placeId}
            onClick={() => onSelectPin(r)}
            className={`w-full text-left rounded-lg border px-3 py-3 transition-colors ${
              isSelected
                ? "border-accent/50 bg-accent/5"
                : "border-card-border bg-card-bg hover:border-accent/20"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: scoreToColor(
                        r.audit.score,
                        r.audit.maxScore
                      ),
                    }}
                  />
                  <p className="text-sm font-medium truncate">{r.name}</p>
                </div>
                <p className="text-[11px] text-muted truncate pl-[18px]">
                  {r.vicinity}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-sm font-bold tabular-nums">
                  {r.audit.score}/{r.audit.maxScore}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.cls}`}>
                  {badge.text}
                </span>
              </div>
            </div>

            {isSelected && (
              <div className="mt-3 pt-3 border-t border-card-border space-y-2 animate-fade-in-up">
                {r.audit.checks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {check.found ? (
                      <svg className="w-3 h-3 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className="text-[11px] text-muted">{check.label}</span>
                  </div>
                ))}
                <p className="text-[11px] text-foreground/80 pt-1">
                  {r.audit.summary}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateAuditPDF(r.audit);
                  }}
                  className="text-[11px] text-accent hover:text-accent-dim transition-colors"
                >
                  Download PDF
                </button>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
