import { z } from 'zod'
import { ApiKeyType, ApiKeyTypeSchema } from './common'

export interface ApiKeyItem {
  keyId: string
  type: ApiKeyType
  maskedKey: string
  createdAt: string
  subjectId: string
  name: string
  scopeId?: string
  expiresAt?: string
  lastUsedAt?: string
  attributes?: Record<string, string>
  autoRotationEnabled?: boolean
  autoRotationIntervalDays?: number
  autoRotationOverlapDays?: number
  nextAutoRotationAt?: string
}

export const ApiKeyItemSchema = z.object({
  keyId: z.string(),
  type: ApiKeyTypeSchema,
  maskedKey: z.string(),
  createdAt: z.string(),
  subjectId: z.string(),
  name: z.string(),
  scopeId: z.string().optional(),
  expiresAt: z.string().optional(),
  lastUsedAt: z.string().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  autoRotationEnabled: z.boolean().optional(),
  autoRotationIntervalDays: z.number().optional(),
  autoRotationOverlapDays: z.number().optional(),
  nextAutoRotationAt: z.string().optional(),
})

export interface ApiKeyCreatedItem extends ApiKeyItem {
  rawKey: string
}

export const ApiKeyCreatedItemSchema = ApiKeyItemSchema.extend({
  rawKey: z.string(),
})

export interface CreateApiKeyInput {
  name: string
  type?: ApiKeyType
  expiresAt?: string
  attributes?: Record<string, string>
  permissions?: string[]
  roles?: string[]
  rateLimit?: number
  autoRotationEnabled?: boolean
  autoRotationIntervalDays?: number
  autoRotationOverlapDays?: number
}

export const CreateApiKeyInputSchema = z.object({
  name: z.string().min(1).max(256),
  type: ApiKeyTypeSchema.optional(),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/, 'expiresAt must be a valid ISO 8601 date string')
    .optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  roles: z.array(z.string().max(100)).max(50).optional(),
  rateLimit: z.number().int().min(1).max(100_000).optional(),
  autoRotationEnabled: z.boolean().optional(),
  autoRotationIntervalDays: z.number().int().min(1).max(365).optional(),
  autoRotationOverlapDays: z.number().int().min(0).max(30).optional(),
})

export interface ApiKeyRotationResult {
  keyId: string
  maskedKey: string
  rawKey: string
  name: string
  oldKeyId: string
  overlapExpiresAt?: string
}

export const ApiKeyRotationResultSchema = z.object({
  keyId: z.string(),
  maskedKey: z.string(),
  rawKey: z.string(),
  name: z.string(),
  oldKeyId: z.string(),
  overlapExpiresAt: z.string().optional(),
})

export interface ApiKeyRevealRotationResult {
  keyId: string
  apiKey: string
}

export const ApiKeyRevealRotationResultSchema = z.object({
  keyId: z.string(),
  apiKey: z.string(),
})

export interface UpdateApiKeyAutoRotationInput {
  enabled: boolean
  intervalDays?: number
  overlapDays?: number
}

export const UpdateApiKeyAutoRotationInputSchema = z.object({
  enabled: z.boolean(),
  intervalDays: z.number().optional(),
  overlapDays: z.number().optional(),
})

export interface RotateApiKeyInput {
  overlapDays?: number
}

export const RotateApiKeyInputSchema = z.object({
  overlapDays: z.number().int().min(0).max(30).optional(),
})
