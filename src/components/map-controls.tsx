"use client";

import { useState } from "react";
import { BUSINESS_TYPES } from "@/lib/map-types";

interface MapControlsProps {
  radius: number;
  onRadiusChange: (r: number) => void;
  businessType: string;
  onBusinessTypeChange: (t: string) => void;
  onScan: () => void;
  loading: boolean;
  resultCount: number;
}

export function MapControls({
  radius,
  onRadiusChange,
  businessType,
  onBusinessTypeChange,
  onScan,
  loading,
  resultCount,
}: MapControlsProps) {
  const [locationInput, setLocationInput] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
          Radius: {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`}
        </label>
        <input
          type="range"
          min={500}
          max={5000}
          step={250}
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-[10px] text-muted mt-1">
          <span>500m</span>
          <span>5km</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
          Business Type
        </label>
        <select
          value={businessType}
          onChange={(e) => onBusinessTypeChange(e.target.value)}
          className="w-full rounded-lg border border-card-border bg-input-bg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          {BUSINESS_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onScan}
        disabled={loading}
        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Scanning area...
          </span>
        ) : (
          "Scan for Businesses"
        )}
      </button>

      {resultCount > 0 && !loading && (
        <p className="text-xs text-muted text-center">
          Found {resultCount} businesses in this area
        </p>
      )}

      <div className="border-t border-card-border pt-3">
        <p className="text-[10px] text-muted leading-relaxed">
          Click anywhere on the map to set the search center, adjust the radius
          and business type, then hit scan.
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Legend
        </p>
        <div className="grid grid-cols-2 gap-1">
          {[
            { color: "#ef4444", label: "0 — No video" },
            { color: "#f97316", label: "1 — Minimal" },
            { color: "#eab308", label: "2 — Some" },
            { color: "#22c55e", label: "3-4 — Good" },
          ].map((item) => (
            <div key={item.color} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-muted">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
