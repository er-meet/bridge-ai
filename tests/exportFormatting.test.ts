import { describe, it, expect } from 'vitest';
import { DEMO_SCENARIOS } from '../server/src/demoData.js';
import { formatReportAsMarkdown, formatReportAsPlainText } from '../src/utils/exportUtils.js';

describe('Report Export Formatting', () => {
  const sampleReport = DEMO_SCENARIOS['road-hazard'].analysisResult;

  it('formats report into structured Markdown with all required sections', () => {
    const md = formatReportAsMarkdown(sampleReport);

    expect(md).toContain('# BridgeAI Actionable Intelligence Report');
    expect(md).toContain('## 1. Executive Summary');
    expect(md).toContain('## 2. Location Information');
    expect(md).toContain('## 3. Extracted Facts & Multimodal Evidence');
    expect(md).toContain('## 4. Critical Missing Information');
    expect(md).toContain('## 5. Uncertainty & Evidence Limitations');
    expect(md).toContain('## 6. Recommended Action Plan');
    expect(md).toContain('Oakridge Avenue');
    expect(md).toContain('URGENT');
  });

  it('formats report into clean plain text for email or SMS dispatch', () => {
    const txt = formatReportAsPlainText(sampleReport);

    expect(txt).toContain('BRIDGEAI ACTIONABLE INTELLIGENCE REPORT');
    expect(txt).toContain('EXECUTIVE SUMMARY:');
    expect(txt).toContain('LOCATION:');
    expect(txt).toContain('EXTRACTED FACTS:');
    expect(txt).toContain('RECOMMENDED ACTIONS:');
    expect(txt).toContain(sampleReport.summary);
  });

  it('includes emergency advisory in Markdown and Plain Text when emergency_detected is true', () => {
    const floodReport = DEMO_SCENARIOS['disaster-assistance'].analysisResult;
    const md = formatReportAsMarkdown(floodReport);
    const txt = formatReportAsPlainText(floodReport);

    expect(md).toContain('IMMEDIATE LIFE SAFETY ADVISORY');
    expect(md).toContain('911');

    expect(txt).toContain('*** EMERGENCY ALERT ***');
    expect(txt).toContain('911');
  });
});
