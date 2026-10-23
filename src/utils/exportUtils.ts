import { BridgeAnalysisResult } from '../types/index.js';

export function formatReportAsMarkdown(report: BridgeAnalysisResult): string {
  const dateStr = new Date(report.timestamp).toLocaleString();
  
  let md = `# BridgeAI Actionable Intelligence Report\n\n`;
  md += `**Report ID:** ${report.id}  \n`;
  md += `**Generated:** ${dateStr}  \n`;
  md += `**Category:** ${report.category_tag} (${report.request_type})  \n`;
  md += `**Assessed Urgency:** ${report.priority.level.toUpperCase()} — ${report.priority.reason}  \n`;
  md += `**Mode:** ${report.is_demo ? 'Pre-computed Scenario (Demo)' : 'Live Multimodal AI Analysis'}  \n`;
  md += `**Human Review Mandatory:** ${report.human_review_required ? 'YES' : 'NO'}  \n\n`;

  if (report.emergency_detected && report.emergency_guidance) {
    md += `> ⚠️ **IMMEDIATE LIFE SAFETY ADVISORY**  \n`;
    md += `> ${report.emergency_guidance}\n\n`;
  }

  md += `## 1. Executive Summary\n\n`;
  md += `${report.summary}\n\n`;

  md += `## 2. Location Information\n\n`;
  md += `- **Reported Location:** ${report.location.value || 'Not specified'}\n`;
  md += `- **Location Verification Status:** ${report.location.status}\n\n`;

  md += `## 3. Extracted Facts & Multimodal Evidence\n\n`;
  md += `| Fact / Attribute | Value | Verification Status | Source |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  for (const fact of report.extracted_facts) {
    const val = fact.value ? fact.value.replace(/\|/g, '\\|') : 'None';
    md += `| **${fact.field}** | ${val} | \`${fact.status}\` | ${fact.source} |\n`;
  }
  md += `\n`;

  if (report.missing_information.length > 0) {
    md += `## 4. Critical Missing Information\n\n`;
    for (const item of report.missing_information) {
      md += `- [ ] ${item}\n`;
    }
    md += `\n`;
  }

  if (report.uncertainty_notes.length > 0) {
    md += `## 5. Uncertainty & Evidence Limitations\n\n`;
    for (const note of report.uncertainty_notes) {
      md += `- ${note}\n`;
    }
    md += `\n`;
  }

  md += `## 6. Recommended Action Plan\n\n`;
  for (const [idx, action] of report.recommended_actions.entries()) {
    const checkmark = action.completed ? '[x]' : '[ ]';
    const confTag = action.requires_confirmation ? ' *(Requires Human Confirmation)*' : '';
    md += `### ${idx + 1}. ${checkmark} ${action.title}${confTag}\n`;
    md += `${action.description}\n\n`;
  }

  md += `---\n`;
  md += `*BridgeAI — From human chaos to meaningful action. Not an emergency dispatch system. For life-threatening emergencies, call local emergency services immediately.*  \n`;

  return md;
}

export function formatReportAsPlainText(report: BridgeAnalysisResult): string {
  const dateStr = new Date(report.timestamp).toLocaleString();
  let text = `========================================================\n`;
  text += `BRIDGEAI ACTIONABLE INTELLIGENCE REPORT\n`;
  text += `========================================================\n`;
  text += `Report ID: ${report.id}\n`;
  text += `Timestamp: ${dateStr}\n`;
  text += `Category: ${report.category_tag} - ${report.request_type}\n`;
  text += `Priority: ${report.priority.level.toUpperCase()} (${report.priority.reason})\n`;
  text += `Mode: ${report.is_demo ? 'Demo Mode' : 'Live Analysis'}\n`;
  text += `Human Review Required: ${report.human_review_required ? 'YES' : 'NO'}\n`;
  text += `--------------------------------------------------------\n\n`;

  if (report.emergency_detected && report.emergency_guidance) {
    text += `*** EMERGENCY ALERT ***\n`;
    text += `${report.emergency_guidance}\n\n`;
  }

  text += `EXECUTIVE SUMMARY:\n${report.summary}\n\n`;

  text += `LOCATION:\n${report.location.value || 'Unknown'} [Status: ${report.location.status}]\n\n`;

  text += `EXTRACTED FACTS:\n`;
  for (const fact of report.extracted_facts) {
    text += `* ${fact.field}: ${fact.value || 'N/A'}\n  Status: ${fact.status} | Source: ${fact.source}\n`;
  }
  text += `\n`;

  if (report.missing_information.length > 0) {
    text += `CRITICAL MISSING INFORMATION:\n`;
    for (const item of report.missing_information) {
      text += `[ ] ${item}\n`;
    }
    text += `\n`;
  }

  if (report.uncertainty_notes.length > 0) {
    text += `UNCERTAINTY & LIMITATIONS:\n`;
    for (const note of report.uncertainty_notes) {
      text += `- ${note}\n`;
    }
    text += `\n`;
  }

  text += `RECOMMENDED ACTIONS:\n`;
  for (const [idx, action] of report.recommended_actions.entries()) {
    const mark = action.completed ? '[DONE]' : '[TODO]';
    text += `${idx + 1}. ${mark} ${action.title}${action.requires_confirmation ? ' (Requires confirmation)' : ''}\n`;
    text += `   ${action.description}\n`;
  }

  text += `\n========================================================\n`;
  return text;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
