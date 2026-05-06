import type { AuditResult } from "./types";

export async function generateAuditPDF(result: AuditResult): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  // -- Background
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), "F");

  // -- Header bar
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageW, 40, "F");

  doc.setFillColor(249, 115, 22);
  doc.roundedRect(margin, 10, 20, 20, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("VG", margin + 10, 22, { align: "center" });

  doc.setTextColor(237, 237, 237);
  doc.setFontSize(16);
  doc.text("Video Gap Detector", margin + 26, 18);
  doc.setFontSize(8);
  doc.setTextColor(115, 115, 115);
  doc.text("Video Presence Audit Report", margin + 26, 26);

  y = 52;

  // -- Business name + badge
  doc.setTextColor(237, 237, 237);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(result.businessName, margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(115, 115, 115);
  doc.text(result.city, margin, y);

  // Lead badge
  const ratio = result.score / result.maxScore;
  let badgeText: string;
  let badgeR: number, badgeG: number, badgeB: number;
  if (ratio === 0) {
    badgeText = "HIGH-VALUE LEAD";
    badgeR = 239; badgeG = 68; badgeB = 68;
  } else if (ratio <= 0.25) {
    badgeText = "STRONG LEAD";
    badgeR = 249; badgeG = 115; badgeB = 22;
  } else if (ratio <= 0.5) {
    badgeText = "MODERATE LEAD";
    badgeR = 234; badgeG = 179; badgeB = 8;
  } else {
    badgeText = "LOW PRIORITY";
    badgeR = 74; badgeG = 222; badgeB = 128;
  }

  const badgeW = doc.getTextWidth(badgeText) + 12;
  doc.setFillColor(badgeR, badgeG, badgeB);
  doc.roundedRect(pageW - margin - badgeW, y - 14, badgeW, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text(badgeText, pageW - margin - badgeW + 6, y - 7);

  y += 14;

  // -- Score section
  doc.setFillColor(26, 26, 26);
  doc.roundedRect(margin, y, contentW, 36, 4, 4, "F");

  doc.setTextColor(badgeR, badgeG, badgeB);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text(String(result.score), margin + 12, y + 26);

  const scoreNumW = doc.getTextWidth(String(result.score));
  doc.setTextColor(115, 115, 115);
  doc.setFontSize(14);
  doc.text(`/ ${result.maxScore}`, margin + 12 + scoreNumW + 3, y + 26);

  doc.setFontSize(8);
  doc.setTextColor(115, 115, 115);
  doc.text("VIDEO PRESENCE SCORE", margin + 12, y + 33);

  // Score bar
  const barX = margin + 80;
  const barW = contentW - 80 - 12;
  const barY = y + 16;
  doc.setFillColor(38, 38, 38);
  doc.roundedRect(barX, barY, barW, 5, 2, 2, "F");
  if (result.score > 0) {
    doc.setFillColor(badgeR, badgeG, badgeB);
    doc.roundedRect(barX, barY, barW * (result.score / result.maxScore), 5, 2, 2, "F");
  }

  y += 46;

  // -- Checks
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(115, 115, 115);
  doc.text("CHECKS", margin, y);
  y += 8;

  for (const check of result.checks) {
    doc.setFillColor(26, 26, 26);
    doc.roundedRect(margin, y, contentW, 18, 3, 3, "F");

    // Status icon
    if (check.found) {
      doc.setFillColor(74, 222, 128);
      doc.circle(margin + 10, y + 9, 3, "F");
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Y", margin + 10, y + 11, { align: "center" });
    } else {
      doc.setFillColor(248, 113, 113);
      doc.circle(margin + 10, y + 9, 3, "F");
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("N", margin + 10, y + 11, { align: "center" });
    }

    doc.setTextColor(237, 237, 237);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(check.label, margin + 18, y + 8);

    doc.setTextColor(115, 115, 115);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(check.detail, margin + 18, y + 14);

    y += 22;
  }

  y += 4;

  // -- Summary
  doc.setFillColor(26, 26, 26);
  doc.roundedRect(margin, y, contentW, 20, 3, 3, "F");
  doc.setTextColor(237, 237, 237);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(result.summary, contentW - 16);
  doc.text(summaryLines, margin + 8, y + 10);

  y += 28;

  // -- Footer
  doc.setTextColor(115, 115, 115);
  doc.setFontSize(7);
  doc.text(
    `Generated ${new Date(result.timestamp).toLocaleString()} | Video Gap Detector by Ingress`,
    margin,
    y
  );

  const filename = `${result.businessName.replace(/[^a-zA-Z0-9]/g, "-")}-video-audit.pdf`;
  doc.save(filename);
}
