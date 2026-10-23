import { describe, it, expect } from 'vitest';
import {
  BridgeAnalysisResultSchema,
  ExtractedFactSchema,
  LocationInfoSchema,
  PriorityInfoSchema,
} from '../server/src/schema.js';

describe('BridgeAI Schema Validation', () => {
  it('validates a complete, well-formed analysis result', () => {
    const validData = {
      id: 'test-123',
      timestamp: new Date().toISOString(),
      is_demo: false,
      request_type: 'Downed Power Line',
      category_tag: 'Public Safety & Infrastructure',
      summary: 'Sparking high-voltage power line fell across residential sidewalk.',
      extracted_facts: [
        {
          field: 'Hazard Nature',
          value: 'Live arcing electrical wire',
          source: 'Resident cell phone video',
          status: 'observed',
        },
        {
          field: 'Pedestrian Impact',
          value: 'Sidewalk blocked; children walking home from school',
          source: 'Citizen voice note',
          status: 'reported',
        },
      ],
      location: {
        value: '742 Evergreen Terrace near intersection',
        status: 'reported',
      },
      missing_information: ['Grid sector ID', 'Utility account number'],
      uncertainty_notes: ['Exact voltage rating cannot be confirmed from video.'],
      priority: {
        level: 'urgent',
        reason: 'Immediate life safety threat of high-voltage electrocution.',
      },
      recommended_actions: [
        {
          id: 'act-1',
          title: 'Establish 50-Foot Perimeter',
          description: 'Keep all civilians and responders at least 50 feet away.',
          requires_confirmation: false,
          completed: false,
        },
      ],
      human_review_required: true,
      emergency_detected: true,
      emergency_guidance: 'Call 911 immediately. Treat all downed wires as energized.',
    };

    const parsed = BridgeAnalysisResultSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.request_type).toBe('Downed Power Line');
      expect(parsed.data.extracted_facts.length).toBe(2);
      expect(parsed.data.priority.level).toBe('urgent');
    }
  });

  it('rejects invalid priority levels', () => {
    const invalidPriority = {
      level: 'super-critical-danger', // not in enum
      reason: 'Urgent',
    };
    const parsed = PriorityInfoSchema.safeParse(invalidPriority);
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid fact status values', () => {
    const invalidFact = {
      field: 'Road Status',
      value: 'Blocked',
      source: 'Photo',
      status: 'guessed', // invalid status
    };
    const parsed = ExtractedFactSchema.safeParse(invalidFact);
    expect(parsed.success).toBe(false);
  });

  it('correctly handles nullable and unknown values', () => {
    const dataWithNulls = {
      id: 'test-nulls',
      timestamp: new Date().toISOString(),
      is_demo: true,
      request_type: 'Noise Complaint',
      summary: 'Loud industrial noise late at night.',
      extracted_facts: [
        {
          field: 'Decibel Level',
          value: null, // explicitly unknown
          source: 'Citizen complaint',
          status: 'unknown',
        },
      ],
      location: {
        value: null, // no location provided
        status: 'unknown',
      },
      missing_information: ['Exact address', 'Audio recording decibel calibration'],
      uncertainty_notes: ['Cannot determine if noise violates municipal decibel ordinance.'],
      priority: {
        level: 'low',
        reason: 'No immediate physical danger or hazard detected.',
      },
      recommended_actions: [
        {
          id: 'act-noise-1',
          title: 'Log Non-Emergency Code Enforcement Ticket',
          description: 'Submit during standard business hours.',
          requires_confirmation: false,
        },
      ],
      human_review_required: true,
      emergency_detected: false,
      emergency_guidance: null,
    };

    const parsed = BridgeAnalysisResultSchema.safeParse(dataWithNulls);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.location.value).toBeNull();
      expect(parsed.data.location.status).toBe('unknown');
      expect(parsed.data.extracted_facts[0].value).toBeNull();
      expect(parsed.data.extracted_facts[0].status).toBe('unknown');
    }
  });

  it('rejects completely empty or missing required root fields', () => {
    const emptyObject = {};
    const parsed = BridgeAnalysisResultSchema.safeParse(emptyObject);
    expect(parsed.success).toBe(false);
  });
});
