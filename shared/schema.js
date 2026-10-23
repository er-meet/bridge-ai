import { z } from 'zod';
export const FactStatusEnum = z.enum(['observed', 'reported', 'inferred', 'unknown']);
export const LocationStatusEnum = z.enum(['confirmed_from_input', 'reported', 'inferred', 'unknown']);
export const PriorityLevelEnum = z.enum(['low', 'moderate', 'urgent', 'needs_review']);
export const ExtractedFactSchema = z.object({
    field: z.string().min(1, 'Fact field name is required'),
    value: z.string().nullable(),
    source: z.string().default('User submission'),
    status: FactStatusEnum.default('reported'),
});
export const LocationInfoSchema = z.object({
    value: z.string().nullable(),
    status: LocationStatusEnum.default('unknown'),
});
export const PriorityInfoSchema = z.object({
    level: PriorityLevelEnum.default('needs_review'),
    reason: z.string().min(1, 'Priority justification is required'),
});
export const RecommendedActionSchema = z.object({
    id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
    title: z.string().min(1, 'Action title is required'),
    description: z.string().min(1, 'Action description is required'),
    requires_confirmation: z.boolean().default(true),
    completed: z.boolean().optional().default(false),
});
export const BridgeAnalysisResultSchema = z.object({
    id: z.string().default(() => `bridge-${Date.now()}`),
    timestamp: z.string().default(() => new Date().toISOString()),
    is_demo: z.boolean().default(false),
    request_type: z.string().min(1, 'Request category is required'),
    category_tag: z.string().default('General Incident'),
    summary: z.string().min(1, 'Plain language summary is required'),
    extracted_facts: z.array(ExtractedFactSchema).default([]),
    location: LocationInfoSchema.default({ value: null, status: 'unknown' }),
    missing_information: z.array(z.string()).default([]),
    uncertainty_notes: z.array(z.string()).default([]),
    priority: PriorityInfoSchema,
    recommended_actions: z.array(RecommendedActionSchema).default([]),
    human_review_required: z.boolean().default(true),
    emergency_detected: z.boolean().default(false),
    emergency_guidance: z.string().nullable().default(null),
});
export const SystemHealthSchema = z.object({
    status: z.literal('ok'),
    timestamp: z.string(),
    hasApiKey: z.boolean(),
    model: z.string(),
    demoModeAvailable: z.boolean(),
    supportedMimeTypes: z.array(z.string()),
    maxFileSizeMB: z.number(),
});
