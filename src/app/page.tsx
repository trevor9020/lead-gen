"use client";

import { useState } from "react";
import type { AuditResult } from "@/lib/types";
import { AuditForm } from "@/components/audit-form";
import { AuditCard } from "@/components/audit-card";
import { RecentAudits } from "@/components/recent-audits";
import { CSVUpload } from "@/components/csv-upload";
import Link from "next/link";

export default function Home() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [history, setHistory] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAudit(businessName: string, city: string) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, city }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Audit failed");
      }

      const data: AuditResult = await res.json();
      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-card-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-sm text-black">
              VG
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Video Gap Detector
              </h1>
              <p className="text-xs text-muted">
                Find businesses with no video presence
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <span className="px-3 py-1.5 rounded-lg text-sm font-medium text-accent bg-accent/10">
              Audit Tool
            </span>
            <Link
              href="/map"
              className="px-3 py-1.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-input-bg transition-colors"
            >
              Map View
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-2">
                  Audit a Business
                </h2>
                <p className="text-muted text-sm leading-relaxed">
                  Enter a business name and city to check their video presence
                  across YouTube, their website, and social platforms.
                </p>
              </div>

              <AuditForm onSubmit={handleAudit} loading={loading} />

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="border-t border-card-border pt-6">
                <CSVUpload
                  loading={loading}
                  setLoading={setLoading}
                  onResults={(results) => {
                    setHistory((prev) => [...results, ...prev].slice(0, 50));
                    if (results.length > 0) setResult(results[0]);
                  }}
                />
              </div>

              {history.length > 0 && (
                <RecentAudits audits={history} onSelect={setResult} />
              )}
            </div>

            <div>
              {result ? (
                <AuditCard result={result} />
              ) : (
                <div className="rounded-xl border border-card-border bg-card-bg p-10 flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="w-16 h-16 rounded-full bg-input-bg flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                  </div>
                  <p className="text-muted text-sm">
                    Run an audit to see the report card here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-card-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted">
          <span>Video Gap Detector v1.0</span>
          <span>Phase 1 — Audit Card Tool</span>
        </div>
      </footer>
    </div>
  );
}
