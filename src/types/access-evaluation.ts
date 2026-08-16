import { z } from 'zod'
import { Effect, EffectSchema } from './common'
import { AbacConditionSchema } from './abac'

export interface AccessCheckContext {
  [key: string]: string | number | boolean | null | AccessCheckContext | AccessCheckContext[]
}

export const AccessCheckContextSchema: z.ZodType<AccessCheckContext> = z.lazy(() =>
  z.record(
    z.string(),
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
      AccessCheckContextSchema,
      z.array(AccessCheckContextSchema),
    ])
  )
)

export interface AccessCheckInput {
  subjectId: string
  scopeId: string
  resource: string
  resourceId?: string
  action: string
  context?: AccessCheckContext
  includeReason?: boolean
}

export const AccessCheckInputSchema = z.object({
  subjectId: z.string(),
  scopeId: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  action: z.string(),
  context: AccessCheckContextSchema.optional(),
  includeReason: z.boolean().optional(),
})

export type HasAccessInput = AccessCheckInput

export const HasAccessInputSchema = AccessCheckInputSchema

/** A self-check: the subject is the authenticated API key, so `subjectId` is omitted. */
export interface SelfAccessCheckInput {
  scopeId: string
  resource: string
  resourceId?: string
  action: string
  context?: AccessCheckContext
  includeReason?: boolean
}

export const SelfAccessCheckInputSchema = z.object({
  scopeId: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  action: z.string(),
  context: AccessCheckContextSchema.optional(),
  includeReason: z.boolean().optional(),
})

export type SelfAccessCheckResult = AccessCheckResult

export interface AccessCheckReasoningEntry {
  roleId: string
  roleName: string
  effect?: string
  permissionId: string
  scopeId: string
  inheritedFromScope?: string
}

export const AccessCheckReasoningEntrySchema = z.object({
  roleId: z.string(),
  roleName: z.string(),
  effect: z.string().optional(),
  permissionId: z.string(),
  scopeId: z.string(),
  inheritedFromScope: z.string().optional(),
})

export interface AccessCheckReasoning {
  matchedBy: AccessCheckReasoningEntry[]
  deniedBy: AccessCheckReasoningEntry[]
  scopeChain: string[]
}

export const AccessCheckReasoningSchema = z.object({
  matchedBy: z.array(AccessCheckReasoningEntrySchema),
  deniedBy: z.array(AccessCheckReasoningEntrySchema),
  scopeChain: z.array(z.string()),
})

export interface AccessCheckResult extends AccessCheckInput {
  allowed: boolean
  error?: string
  inheritedFromScope?: string
  reasoning?: AccessCheckReasoning
}

export const AccessCheckResultSchema = AccessCheckInputSchema.extend({
  allowed: z.boolean(),
  error: z.string().optional(),
  inheritedFromScope: z.string().optional(),
  reasoning: AccessCheckReasoningSchema.optional(),
})

export type HasAccessResult = AccessCheckResult

export const HasAccessResultSchema = AccessCheckResultSchema

export const SelfAccessCheckResultSchema = AccessCheckResultSchema

export type HasAccessBulkInput = AccessCheckInput[]

export const HasAccessBulkInputSchema = z.array(AccessCheckInputSchema)

export type HasAccessBulkResult = AccessCheckResult[]

export const HasAccessBulkResultSchema = z.array(AccessCheckResultSchema)

export interface ListPermissionsInput {
  subjectId: string
  scopeId: string
}

export const ListPermissionsInputSchema = z.object({
  subjectId: z.string(),
  scopeId: z.string(),
})

export interface ListPermissionsResult {
  permissions: Array<{
    resource: string
    action: string
    effect: Effect
    inheritedFromScope?: string
  }>
}

export const ListPermissionsResultSchema = z.object({
  permissions: z.array(
    z.object({
      resource: z.string(),
      action: z.string(),
      effect: EffectSchema,
      inheritedFromScope: z.string().optional(),
    })
  ),
})

export interface ListRolesInput {
  subjectId: string
  scopeId: string
}

export const ListRolesInputSchema = z.object({
  subjectId: z.string(),
  scopeId: z.string(),
})

export interface ListRolesResult {
  roles: Array<{
    id: string
    name: string
    scopeId: string
    inheritedFromScope?: string
  }>
}

export const ListRolesResultSchema = z.object({
  roles: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      scopeId: z.string(),
      inheritedFromScope: z.string().optional(),
    })
  ),
})

export interface SimulateAccessPermissionInput {
  id: string
  resource: string
  action: string
  effect: Effect
  description?: string
}

export const SimulateAccessPermissionInputSchema = z.object({
  id: z.string(),
  resource: z.string(),
  action: z.string(),
  effect: EffectSchema,
  description: z.string().optional(),
})

export interface SimulateAccessRoleInput {
  id: string
  name?: string
  permissionIds: string[]
}

export const SimulateAccessRoleInputSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  permissionIds: z.array(z.string()),
})

export interface SimulateAccessCheckInput {
  resource: string
  action: string
  context?: AccessCheckContext
}

export const SimulateAccessCheckInputSchema = z.object({
  resource: z.string(),
  action: z.string(),
  context: AccessCheckContextSchema.optional(),
})

export interface SimulateAccessInput {
  subjectId: string
  scopeId: string
  checks: SimulateAccessCheckInput[]
  permissions: SimulateAccessPermissionInput[]
  roles: SimulateAccessRoleInput[]
  subjectRoleIds: string[]
  includeReason?: boolean
}

export const SimulateAccessInputSchema = z.object({
  subjectId: z.string(),
  scopeId: z.string(),
  checks: z.array(SimulateAccessCheckInputSchema),
  permissions: z.array(SimulateAccessPermissionInputSchema),
  roles: z.array(SimulateAccessRoleInputSchema),
  subjectRoleIds: z.array(z.string()),
  includeReason: z.boolean().optional(),
})

export interface SimulateAccessResultEntry {
  resource: string
  action: string
  allowed: boolean
  reasoning?: {
    matchedBy: Array<Record<string, unknown>>
    deniedBy: Array<Record<string, unknown>>
    evaluatedPermissions: Array<Record<string, unknown>>
    effectiveRoleIds: string[]
  }
}

export const SimulateAccessResultEntrySchema = z.object({
  resource: z.string(),
  action: z.string(),
  allowed: z.boolean(),
  reasoning: z
    .object({
      matchedBy: z.array(z.record(z.string(), z.unknown())),
      deniedBy: z.array(z.record(z.string(), z.unknown())),
      evaluatedPermissions: z.array(z.record(z.string(), z.unknown())),
      effectiveRoleIds: z.array(z.string()),
    })
    .optional(),
})

export interface SimulateAccessResult {
  subjectId: string
  scopeId: string
  results: SimulateAccessResultEntry[]
}

export const SimulateAccessResultSchema = z.object({
  subjectId: z.string(),
  scopeId: z.string(),
  results: z.array(SimulateAccessResultEntrySchema),
})

// ── Receipts ──

export interface ReceiptIssueInput {
  subjectId: string
  resource: string
  action: string
}

export const ReceiptIssueInputSchema = z.object({
  subjectId: z.string(),
  resource: z.string(),
  action: z.string(),
})

export interface ReceiptIssueResult {
  receipt: string
  decision: AccessCheckResult
}

export const ReceiptIssueResultSchema = z.object({
  receipt: z.string(),
  decision: AccessCheckResultSchema,
})

export interface ReceiptVerifyInput {
  receipt: string
}

export const ReceiptVerifyInputSchema = z.object({
  receipt: z.string(),
})

export interface ReceiptVerifyResult {
  valid: boolean
  claims?: {
    jti?: string
    subjectId?: string
    scopeId?: string
    resource?: string
    action?: string
    allowed?: boolean
    issuedAt?: number
    expiresAt?: number
  }
  reason?: string
}

export const ReceiptVerifyResultSchema = z.object({
  valid: z.boolean(),
  claims: z
    .object({
      jti: z.string().optional(),
      subjectId: z.string().optional(),
      scopeId: z.string().optional(),
      resource: z.string().optional(),
      action: z.string().optional(),
      allowed: z.boolean().optional(),
      issuedAt: z.number().optional(),
      expiresAt: z.number().optional(),
    })
    .optional(),
  reason: z.string().optional(),
})
