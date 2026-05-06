"use client";

import type { AuditResult } from "@/lib/types";

interface RecentAuditsProps {
  audits: AuditResult[];
  onSelect: (result: AuditResult) => void;
}

function scoreBadgeColor(score: number, max: number): string {
  const ratio = score / max;
  if (ratio === 0) return "bg-red-500/20 text-red-400";
  if (ratio <= 0.25) return "bg-red-500/20 text-red-400";
  if (ratio <= 0.5) return "bg-orange-500/20 text-orange-400";
  if (ratio <= 0.75) return "bg-yellow-500/20 text-yellow-400";
  return "bg-green-500/20 text-green-400";
}

export function RecentAudits({ audits, onSelect }: RecentAuditsProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
        Recent Audits
      </h3>
      <div className="space-y-2">
        {audits.map((audit, i) => (
          <button
            key={`${audit.businessName}-${audit.timestamp}-${i}`}
            onClick={() => onSelect(audit)}
            className="w-full text-left rounded-lg border border-card-border bg-card-bg px-4 py-3 hover:border-accent/30 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">
                  {audit.businessName}
                </p>
                <p className="text-xs text-muted">{audit.city}</p>
              </div>
              <span
                className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded ${scoreBadgeColor(audit.score, audit.maxScore)}`}
              >
                {audit.score}/{audit.maxScore}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
