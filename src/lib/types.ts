export interface VideoCheck {
  label: string;
  found: boolean;
  detail: string;
}

export interface AuditResult {
  businessName: string;
  city: string;
  score: number;
  maxScore: number;
  checks: VideoCheck[];
  summary: string;
  timestamp: string;
}
