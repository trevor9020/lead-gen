import type { AuditResult } from "./types";

export interface DiscoverResult {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  vicinity: string;
  audit: AuditResult;
}

export interface MapCenter {
  lat: number;
  lng: number;
}

export const BUSINESS_TYPES = [
  { value: "establishment", label: "All Businesses" },
  { value: "restaurant", label: "Restaurants" },
  { value: "lodging", label: "Hotels & Lodging" },
  { value: "store", label: "Retail Stores" },
  { value: "gym", label: "Gyms & Fitness" },
  { value: "beauty_salon", label: "Beauty & Salons" },
  { value: "car_repair", label: "Auto Repair" },
  { value: "dentist", label: "Dentists" },
  { value: "lawyer", label: "Law Firms" },
  { value: "real_estate_agency", label: "Real Estate" },
] as const;

export function scoreToColor(score: number, max: number): string {
  const ratio = score / max;
  if (ratio === 0) return "#ef4444";
  if (ratio <= 0.25) return "#f97316";
  if (ratio <= 0.5) return "#eab308";
  if (ratio <= 0.75) return "#a3e635";
  return "#22c55e";
}
