"use client";

import { useState } from "react";

interface AuditFormProps {
  onSubmit: (businessName: string, city: string) => void;
  loading: boolean;
}

export function AuditForm({ onSubmit, loading }: AuditFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !city.trim()) return;
    onSubmit(businessName, city);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="businessName"
          className="block text-sm font-medium mb-1.5"
        >
          Business Name
        </label>
        <input
          id="businessName"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. Sunny's Auto Repair"
          className="w-full rounded-lg border border-card-border bg-input-bg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium mb-1.5">
          City
        </label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Colombo"
          className="w-full rounded-lg border border-card-border bg-input-bg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !businessName.trim() || !city.trim()}
        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Scanning...
          </span>
        ) : (
          "Run Video Audit"
        )}
      </button>
    </form>
  );
}
