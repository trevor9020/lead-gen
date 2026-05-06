"use client";

import { useRef, useState } from "react";
import type { AuditResult } from "@/lib/types";

interface CSVUploadProps {
  onResults: (results: AuditResult[]) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

interface CSVRow {
  businessName: string;
  city: string;
}

function parseCSV(text: string): CSVRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const hasHeader =
    header.includes("business") || header.includes("name") || header.includes("city");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
      if (parts.length < 2) return null;
      return { businessName: parts[0], city: parts[1] };
    })
    .filter((r): r is CSVRow => r !== null && r.businessName.length > 0 && r.city.length > 0);
}

export function CSVUpload({ onResults, loading, setLoading }: CSVUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setError("No valid rows found. CSV should have: business name, city");
        return;
      }
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  async function runBulk() {
    if (rows.length === 0) return;
    setLoading(true);
    setProgress({ done: 0, total: rows.length });

    const results: AuditResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rows[i]),
        });
        if (res.ok) {
          const data: AuditResult = await res.json();
          results.push(data);
        }
      } catch {
        // skip failed rows
      }
      setProgress({ done: i + 1, total: rows.length });
    }

    onResults(results);
    setRows([]);
    setLoading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Bulk CSV Upload
      </h3>

      <div
        className="rounded-lg border border-dashed border-card-border bg-input-bg px-4 py-5 text-center cursor-pointer hover:border-accent/40 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="hidden"
        />
        <svg
          className="w-6 h-6 text-muted mx-auto mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-xs text-muted">
          Drop a CSV or click to upload
        </p>
        <p className="text-[10px] text-muted mt-1">
          Format: business name, city (one per row)
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {rows.length > 0 && !loading && (
        <div className="space-y-2">
          <div className="rounded-lg border border-card-border bg-card-bg px-4 py-3">
            <p className="text-sm">
              <span className="font-semibold text-accent">{rows.length}</span>{" "}
              {rows.length === 1 ? "business" : "businesses"} ready to audit
            </p>
            <div className="mt-2 max-h-28 overflow-y-auto space-y-1">
              {rows.slice(0, 10).map((row, i) => (
                <p key={i} className="text-xs text-muted truncate">
                  {row.businessName} - {row.city}
                </p>
              ))}
              {rows.length > 10 && (
                <p className="text-xs text-muted">
                  ...and {rows.length - 10} more
                </p>
              )}
            </div>
          </div>

          <button
            onClick={runBulk}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-dim"
          >
            Audit All {rows.length} Businesses
          </button>
        </div>
      )}

      {loading && progress.total > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Auditing...</span>
            <span>
              {progress.done} / {progress.total}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-input-bg overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{
                width: `${(progress.done / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
