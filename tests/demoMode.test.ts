import { describe, it, expect } from 'vitest';
import { DEMO_SCENARIOS } from '../server/src/demoData.js';
import { BridgeAnalysisResultSchema } from '../server/src/schema.js';

describe('Demo Mode Scenarios Verification', () => {
  it('contains the three required realistic scenarios', () => {
    expect(DEMO_SCENARIOS).toHaveProperty('road-hazard');
    expect(DEMO_SCENARIOS).toHaveProperty('disaster-assistance');
    expect(DEMO_SCENARIOS).toHaveProperty('healthcare-paperwork');
  });

  it('validates that each scenario conforms strictly to BridgeAnalysisResultSchema', () => {
    for (const [key, scenario] of Object.entries(DEMO_SCENARIOS)) {
      const parsed = BridgeAnalysisResultSchema.safeParse(scenario.analysisResult);
      expect(parsed.success, `Scenario "${key}" failed schema validation`).toBe(true);
      expect(scenario.analysisResult.is_demo).toBe(true);
      expect(scenario.analysisResult.extracted_facts.length).toBeGreaterThan(0);
      expect(scenario.analysisResult.recommended_actions.length).toBeGreaterThan(0);
    }
  });

  it('verifies that disaster assistance scenario triggers immediate emergency life safety advisory', () => {
    const floodScenario = DEMO_SCENARIOS['disaster-assistance'];
    expect(floodScenario.analysisResult.emergency_detected).toBe(true);
    expect(floodScenario.analysisResult.emergency_guidance).toBeDefined();
    expect(floodScenario.analysisResult.emergency_guidance).toContain('911');
  });

  it('verifies that healthcare paperwork scenario provides educational summary without diagnosing', () => {
    const healthScenario = DEMO_SCENARIOS['healthcare-paperwork'];
    expect(healthScenario.analysisResult.emergency_detected).toBe(false);
    expect(healthScenario.analysisResult.emergency_guidance).toContain('plain-language educational summaries');
    expect(healthScenario.analysisResult.priority.level).toBe('moderate');
  });

  it('verifies that road hazard scenario contains observed image facts and missing address info', () => {
    const roadScenario = DEMO_SCENARIOS['road-hazard'];
    const observedFacts = roadScenario.analysisResult.extracted_facts.filter(
      (f) => f.status === 'observed'
    );
    expect(observedFacts.length).toBeGreaterThan(0);
    expect(roadScenario.analysisResult.missing_information.length).toBeGreaterThan(0);
  });
});
