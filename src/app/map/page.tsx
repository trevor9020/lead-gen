"use client";

import { useState } from "react";
import type { DiscoverResult, MapCenter } from "@/lib/map-types";
import { MapView } from "@/components/map-view";
import { MapControls } from "@/components/map-controls";
import { MapResultsPanel } from "@/components/map-results-panel";
import Link from "next/link";

const DEFAULT_CENTER: MapCenter = { lat: 6.9271, lng: 79.8612 };

export default function MapPage() {
  const [center, setCenter] = useState<MapCenter>(DEFAULT_CENTER);
  const [radius, setRadius] = useState(2000);
  const [businessType, setBusinessType] = useState("establishment");
  const [results, setResults] = useState<DiscoverResult[]>([]);
  const [selectedPin, setSelectedPin] = useState<DiscoverResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScan() {
    setLoading(true);
    setError(null);
    setSelectedPin(null);

    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: center.lat,
          lng: center.lng,
          radius,
          type: businessType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Discovery failed");
      }

      const data = await res.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-card-border px-6 py-4 shrink-0">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-sm text-black">
              VG
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Video Gap Detector
              </h1>
              <p className="text-xs text-muted">Map Discovery</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-input-bg transition-colors"
            >
              Audit Tool
            </Link>
            <span className="px-3 py-1.5 rounded-lg text-sm font-medium text-accent bg-accent/10">
              Map View
            </span>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-72 border-r border-card-border p-4 overflow-y-auto shrink-0 flex flex-col gap-6">
          <MapControls
            radius={radius}
            onRadiusChange={setRadius}
            businessType={businessType}
            onBusinessTypeChange={setBusinessType}
            onScan={handleScan}
            loading={loading}
            resultCount={results.length}
          />

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            results={results}
            center={center}
            radius={radius}
            onCenterChange={setCenter}
            onSelectPin={setSelectedPin}
            selectedPin={selectedPin}
          />

          {loading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
              <div className="bg-card-bg border border-card-border rounded-lg px-6 py-4 flex items-center gap-3">
                <svg className="w-5 h-5 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm">Scanning & auditing businesses...</span>
              </div>
            </div>
          )}
        </div>

        {/* Right results panel */}
        {results.length > 0 && (
          <div className="w-80 border-l border-card-border p-4 overflow-y-auto shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Results
              </h2>
              <span className="text-xs text-muted">{results.length} found</span>
            </div>
            <MapResultsPanel
              results={results}
              selectedPin={selectedPin}
              onSelectPin={setSelectedPin}
            />
          </div>
        )}
      </div>
    </div>
  );
}
