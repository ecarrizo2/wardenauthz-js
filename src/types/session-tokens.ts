import { z } from 'zod'

export interface MintSessionTokenInput {
  ttlSeconds?: number
  permissionIds?: string[]
  purpose?: string
}

export const MintSessionTokenInputSchema = z.object({
  ttlSeconds: z.number().int().min(60).max(86400).optional(),
  permissionIds: z
    .array(
      z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-zA-Z0-9_-]+$/, 'permissionIds must contain only alphanumeric characters, hyphens, and underscores')
    )
    .min(1)
    .max(100)
    .optional(),
  purpose: z.string().max(64).optional(),
})

export interface MintSessionTokenResult {
  token: string
  tokenType: 'Bearer'
  principalId: string
  scopeId: string
  jti: string
  issuedAt: number
  expiresAt: string
  permissionIds?: string[]
  purpose?: string
}

export const MintSessionTokenResultSchema = z.object({
  token: z.string(),
  tokenType: z.literal('Bearer'),
  principalId: z.string(),
  scopeId: z.string(),
  jti: z.string(),
  issuedAt: z.number(),
  expiresAt: z.string(),
  permissionIds: z.array(z.string()).optional(),
  purpose: z.string().optional(),
})

export interface AgentIntentInstanceInput {
  resourceType: string
  resourceId: string
}

export interface AgentIntentInput {
  integrationId: string
  tools: string[]
  instances?: AgentIntentInstanceInput[]
}

export const AgentIntentInputSchema = z.object({
  integrationId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/),
  tools: z
    .array(
      z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-zA-Z0-9._:-]+$/)
    )
    .min(1)
    .max(100),
  instances: z
    .array(
      z.object({
        resourceType: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-zA-Z0-9_-]+$/),
        resourceId: z
          .string()
          .min(1)
          .max(256)
          .regex(/^[a-zA-Z0-9._/:-]+$/),
      })
    )
    .max(100)
    .optional(),
})

export interface MintIntentSessionTokenInput {
  ttlSeconds?: number
  purpose?: string
  intent: AgentIntentInput
}

export const MintIntentSessionTokenInputSchema = z.object({
  ttlSeconds: z.number().int().min(60).max(86400).optional(),
  purpose: z.string().max(64).optional(),
  intent: AgentIntentInputSchema,
})

export interface ApprovalItem {
  id: string
  scopeId: string
  requesterId: string
  subjectId: string
  kind: 'role-change' | 'intent-mint'
  action: string
  proposedRoleIds: string[]
  previousRoleIds?: string[]
  status: 'pending' | 'approved' | 'denied'
  approverId?: string
  reason?: string
  deniedReason?: string
  validFrom?: string
  expiresAt?: string
  createdAt: string
  resolvedAt?: string
  metadata?: Record<string, string>
}

export const ApprovalItemSchema = z.object({
  id: z.string(),
  scopeId: z.string(),
  requesterId: z.string(),
  subjectId: z.string(),
  kind: z.enum(['role-change', 'intent-mint']),
  action: z.string(),
  proposedRoleIds: z.array(z.string()),
  previousRoleIds: z.array(z.string()).optional(),
  status: z.enum(['pending', 'approved', 'denied']),
  approverId: z.string().optional(),
  reason: z.string().optional(),
  deniedReason: z.string().optional(),
  validFrom: z.string().optional(),
  expiresAt: z.string().optional(),
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
})

/**
 * Result of an intent-bound mint. Either a minted token (token + intent fields are
 * present) OR an approval-required response (`approvalRequired: true` with the created
 * approval and the offending critical tools) when the intent includes critical tools.
 */
export interface MintIntentSessionTokenResult {
  token?: string
  tokenType?: 'Bearer'
  principalId?: string
  scopeId?: string
  jti?: string
  issuedAt?: number
  expiresAt?: string
  intentHash?: string
  intent?: AgentIntentInput
  purpose?: string
  approvalRequired?: boolean
  approval?: ApprovalItem
  criticalTools?: string[]
}

export const MintIntentSessionTokenResultSchema = z.object({
  token: z.string().optional(),
  tokenType: z.literal('Bearer').optional(),
  principalId: z.string().optional(),
  scopeId: z.string().optional(),
  jti: z.string().optional(),
  issuedAt: z.number().optional(),
  expiresAt: z.string().optional(),
  intentHash: z.string().optional(),
  intent: AgentIntentInputSchema.optional(),
  purpose: z.string().optional(),
  approvalRequired: z.boolean().optional(),
  approval: ApprovalItemSchema.optional(),
  criticalTools: z.array(z.string()).optional(),
})

export interface VerifyIntentCallInput {
  token: string
  tool: string
  instance?: { resourceType: string; resourceId: string }
}

export const VerifyIntentCallInputSchema = z.object({
  token: z.string().min(1).max(4096),
  tool: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9._:-]+$/),
  instance: z
    .object({
      resourceType: z
        .string()
        .min(1)
        .max(64)
        .regex(/^[a-zA-Z0-9_-]+$/),
      resourceId: z
        .string()
        .min(1)
        .max(256)
        .regex(/^[a-zA-Z0-9._/:-]+$/),
    })
    .optional(),
})

export interface VerifyIntentCallResult {
  allowed: boolean
  jti: string
  principalId: string
  reason?: string
  pending?: boolean
  approvalId?: string
}

export const VerifyIntentCallResultSchema = z.object({
  allowed: z.boolean(),
  jti: z.string(),
  principalId: z.string(),
  reason: z.string().optional(),
  pending: z.boolean().optional(),
  approvalId: z.string().optional(),
})
