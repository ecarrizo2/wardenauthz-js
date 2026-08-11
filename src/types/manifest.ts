import { z } from 'zod'
import { Effect, EffectSchema } from './common'

export interface WardenAuthClientConfig {
  apiUrl: string
  apiKey?: string
  getToken?: () => Promise<string>
  tokenCacheMs?: number
}

export const WardenAuthClientConfigSchema = z.object({
  apiUrl: z.string(),
  apiKey: z.string().optional(),
  getToken: z.function().optional(),
  tokenCacheMs: z.number().optional(),
})

export type AuthorizationManifestSerialization = 'json' | 'yaml'

export const AuthorizationManifestSerializationSchema = z.enum(['json', 'yaml'])

export interface AuthorizationManifestPermissionInput {
  id: string
  name: string
  resource: string
  action: string
  effect: Effect
  description?: string
}

export const AuthorizationManifestPermissionInputSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Permission ID must contain only alphanumeric characters, hyphens, and underscores'),
  name: z.string().min(1).max(100),
  resource: z
    .string()
    .min(1)
    .max(200)
    .regex(
      /^[a-zA-Z0-9_*-]+$/,
      'Resource must contain only alphanumeric characters, underscores, hyphens, or asterisks'
    ),
  action: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-zA-Z0-9_*-]+$/, 'Action must contain only alphanumeric characters, underscores, hyphens, or asterisks'),
  effect: EffectSchema,
  description: z.string().max(500).optional(),
})

export interface AuthorizationManifestRoleInput {
  id: string
  name: string
  permissionIds: string[]
  description?: string
}

export const AuthorizationManifestRoleInputSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Role ID must contain only alphanumeric characters, hyphens, and underscores'),
  name: z.string().min(1).max(100),
  permissionIds: z.array(
    z
      .string()
      .min(1)
      .max(100)
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Role permission references must contain only alphanumeric characters, hyphens, and underscores'
      )
  ),
  description: z.string().max(500).optional(),
})

export interface AuthorizationManifestAccessPolicyInput {
  subjectId: string
  subjectType?: 'user' | 'api-key'
  roleIds: string[]
  expiresAt?: string
  validFrom?: string
}

const iso8601Msg = 'must be a valid ISO 8601 date string'

export const AuthorizationManifestAccessPolicyInputSchema = z.object({
  subjectId: z.string().min(1).max(256),
  subjectType: z.enum(['user', 'api-key']).optional(),
  roleIds: z.array(
    z
      .string()
      .min(1)
      .max(100)
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Access policy role references must contain only alphanumeric characters, hyphens, and underscores'
      )
  ),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, iso8601Msg)
    .optional(),
  validFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, iso8601Msg)
    .optional(),
})

export interface AuthorizationManifestSpecInput {
  mode: 'authoritative'
  deletionPolicy: 'delete-missing'
  dryRun?: boolean
  idempotencyKey?: string
  requestTimestamp?: string
  permissions: AuthorizationManifestPermissionInput[]
  roles: AuthorizationManifestRoleInput[]
  accessPolicies: AuthorizationManifestAccessPolicyInput[]
}

export const AuthorizationManifestSpecInputSchema = z.object({
  mode: z.literal('authoritative'),
  deletionPolicy: z.literal('delete-missing'),
  dryRun: z.boolean().optional(),
  idempotencyKey: z
    .string()
    .max(128)
    .regex(
      /^[a-zA-Z0-9._:-]+$/,
      'idempotencyKey must contain only alphanumeric characters, dot, underscore, colon, or hyphen'
    )
    .optional(),
  requestTimestamp: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, iso8601Msg)
    .optional(),
  permissions: z.array(AuthorizationManifestPermissionInputSchema).max(1000),
  roles: z.array(AuthorizationManifestRoleInputSchema).max(1000),
  accessPolicies: z.array(AuthorizationManifestAccessPolicyInputSchema).max(1000),
})

export interface AuthorizationManifestApplyInput {
  apiVersion: string
  kind: 'AuthorizationManifest'
  spec: AuthorizationManifestSpecInput
}

export const AuthorizationManifestApplyInputSchema = z.object({
  apiVersion: z.string(),
  kind: z.literal('AuthorizationManifest'),
  spec: AuthorizationManifestSpecInputSchema,
})

export interface ApplyScopeManifestInput {
  manifest: AuthorizationManifestApplyInput
  serialization?: AuthorizationManifestSerialization
}

export const ApplyScopeManifestInputSchema = z.object({
  manifest: AuthorizationManifestApplyInputSchema,
  serialization: AuthorizationManifestSerializationSchema.optional(),
})

export interface ApplyScopeManifestResultSummary {
  totalPlanned: number
  applied: number
  failed: number
  planned: number
}

export const ApplyScopeManifestResultSummarySchema = z.object({
  totalPlanned: z.number(),
  applied: z.number(),
  failed: z.number(),
  planned: z.number(),
})

export interface ApplyScopeManifestOperationResult {
  resourceType: 'permission' | 'role' | 'access-policy'
  operation: 'create' | 'update' | 'delete'
  resourceKey: string
  status: 'planned' | 'applied' | 'failed'
  error?: string
}

export const ApplyScopeManifestOperationResultSchema = z.object({
  resourceType: z.enum(['permission', 'role', 'access-policy']),
  operation: z.enum(['create', 'update', 'delete']),
  resourceKey: z.string(),
  status: z.enum(['planned', 'applied', 'failed']),
  error: z.string().optional(),
})

export interface ApplyScopeManifestResult {
  scopeId: string
  dryRun: boolean
  idempotencyKey?: string
  manifestHash: string
  summary: ApplyScopeManifestResultSummary
  operations: ApplyScopeManifestOperationResult[]
}

export const ApplyScopeManifestResultSchema = z.object({
  scopeId: z.string(),
  dryRun: z.boolean(),
  idempotencyKey: z.string().optional(),
  manifestHash: z.string(),
  summary: ApplyScopeManifestResultSummarySchema,
  operations: z.array(ApplyScopeManifestOperationResultSchema),
})
