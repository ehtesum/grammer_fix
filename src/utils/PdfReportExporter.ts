import { TurnitinReportData } from '../engine/TurnitinDetectionEngine';

/**
 * 1. Exports Official Turnitin-Style AI Detection Audit PDF (with Light-Blue Highlights)
 */
export async function downloadTurnitinPdfReport(report: TurnitinReportData): Promise<void> {
  const printableArea = document.createElement('div');
  printableArea.id = 'turnitin-pdf-print-area';
  printableArea.className = 'fixed top-0 left-0 w-[800px] bg-white text-slate-900 p-8 font-sans z-[-9999] opacity-100';

  const cleanBaseName = report.filename.replace(/\.[^/.]+$/, '');
  const reportTitle = `AI_Checker_Report_${cleanBaseName}.pdf`;

  // Summary Header HTML
  let contentHtml = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5; padding: 20px;">
      <!-- Header Banner -->
      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 22px; font-weight: 800; color: #1e293b; margin: 0;">AI WRITING DETECTION REPORT</h1>
          <p style="font-size: 11px; color: #64748b; margin-top: 4px;">OmniWrite Pro Turnitin-Style Document Analysis</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; font-weight: bold; color: #64748b;">DATE: ${report.uploadDate}</span><br/>
          <span style="font-size: 11px; font-weight: bold; color: #0284c7;">PROVIDER: ${report.provider} (${report.model})</span>
        </div>
      </div>

      <!-- Overview Cards Grid -->
      <div style="display: flex; gap: 16px; margin-bottom: 28px;">
        <!-- AI Score Meter Card -->
        <div style="flex: 1; border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 12px; padding: 18px; text-align: center;">
          <span style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">AI Detection Estimate</span>
          <div style="font-size: 38px; font-weight: 900; color: #0284c7; margin: 8px 0;">${report.overallScore}%</div>
          <span style="font-size: 11px; font-weight: bold; color: #334155; background: #e0f2fe; padding: 4px 10px; border-radius: 6px;">
            ${report.overallScore >= 75 ? 'High AI Estimate' : report.overallScore >= 50 ? 'Moderate AI Estimate' : 'Low / Natural Estimate'}
          </span>
        </div>

        <!-- Document Metadata Card -->
        <div style="flex: 1.5; border: 1px solid #cbd5e1; background: #ffffff; border-radius: 12px; padding: 18px;">
          <h3 style="font-size: 12px; font-weight: bold; color: #475569; margin: 0 0 10px 0; text-transform: uppercase;">Document Metadata</h3>
          <p style="font-size: 11px; margin: 4px 0;"><strong>Filename:</strong> ${report.filename}</p>
          <p style="font-size: 11px; margin: 4px 0;"><strong>Total Word Count:</strong> ${report.wordCount.toLocaleString()} words</p>
          <p style="font-size: 11px; margin: 4px 0;"><strong>Page Count:</strong> ${report.pageCount} pages</p>
          <p style="font-size: 11px; margin: 4px 0;"><strong>Total Sentences:</strong> ${report.sentences.length} sentences</p>
        </div>

        <!-- Confidence Breakdown Card -->
        <div style="flex: 1.5; border: 1px solid #cbd5e1; background: #ffffff; border-radius: 12px; padding: 18px;">
          <h3 style="font-size: 12px; font-weight: bold; color: #475569; margin: 0 0 10px 0; text-transform: uppercase;">Confidence Breakdown</h3>
          <p style="font-size: 11px; margin: 4px 0;"><strong>High Confidence AI:</strong> ${report.highConfidence}%</p>
          <p style="font-size: 11px; margin: 4px 0;"><strong>Moderate Confidence AI:</strong> ${report.moderateConfidence}%</p>
          <p style="font-size: 11px; margin: 4px 0;"><strong>Unflagged / Human:</strong> ${report.unflagged}%</p>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px;">
        <h2 style="font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 12px;">Annotated Document (Flagged Passages Highlighted in Light Blue)</h2>
        <div style="font-size: 12px; line-height: 1.8; color: #1e293b; background: #ffffff; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
  `;

  // Append sentences with Turnitin Light-Blue Highlights (#DBEAFE)
  report.sentences.forEach((s) => {
    if (s.confidence === 'high' || s.confidence === 'moderate') {
      contentHtml += `<mark style="background-color: #DBEAFE; color: #1e3a8a; padding: 2px 4px; border-radius: 4px; border-bottom: 1.5px solid #60a5fa;" title="${s.aiProbability}% AI Signal - ${s.markers.join(', ')}">${s.text} </mark>`;
    } else {
      contentHtml += `<span>${s.text} </span>`;
    }
  });

  contentHtml += `
        </div>
      </div>

      <!-- Responsible AI Disclaimer Footer -->
      <div style="border-top: 1px solid #cbd5e1; margin-top: 36px; padding-top: 12px; text-align: center; font-size: 10px; color: #64748b;">
        <p style="margin: 0; font-weight: bold;">Generated by OmniWrite Pro AI Checker</p>
        <p style="margin: 2px 0;">*AI detection results are model-based statistical estimates and should not be treated as definitive proof of human vs AI authorship.</p>
      </div>
    </div>
  `;

  printableArea.innerHTML = contentHtml;
  document.body.appendChild(printableArea);

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              mark { background-color: #DBEAFE !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${contentHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  document.body.removeChild(printableArea);
}

/**
 * 2. Exports Clean Edited Document PDF (WITHOUT Highlights or Audit Annotations)
 */
export async function downloadCleanPdfDocument(report: TurnitinReportData): Promise<void> {
  const cleanBaseName = report.filename.replace(/\.[^/.]+$/, '');
  const documentTitle = `Clean_${cleanBaseName}.pdf`;

  let contentHtml = `
    <div style="font-family: 'Times New Roman', Times, serif; color: #000000; line-height: 1.6; padding: 40px; max-width: 750px; margin: 0 auto;">
      <h1 style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 24px;">${cleanBaseName}</h1>
      <div style="font-size: 12pt; text-align: justify; white-space: pre-wrap;">${report.fullText}</div>
    </div>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${documentTitle}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          ${contentHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
