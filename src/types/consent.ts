export type McpTrustTier = 'low' | 'medium' | 'high'

import { z } from 'zod'

export const McpTrustTierSchema = z.enum(['low', 'medium', 'high'])

/** Who must approve a HITL tool call: the requester (`self`, audited) or an admin/operator. */
export type HitlLevel = 'self' | 'admin'

export interface McpConsentServer {
  serverKey: string
  name: string
  upstreamUrl?: string
  toolCount: number
}

export interface McpConsentToolView {
  name: string
  tier: McpTrustTier
  description?: string
  /** If set, the tool requires approval at this level (`self` or `admin`); absent = none. */
  hitl?: HitlLevel
  allowed: boolean
}

export interface McpConsentContext {
  server: { serverKey: string; name: string; upstreamUrl?: string }
  maxTier: McpTrustTier | null
  tools: McpConsentToolView[]
  allowedCount: number
  deniedCount: number
}

/** One server the user authorizes on the consent screen (a grant may span several). */
export interface McpConsentServerSelection {
  serverKey: string
  tier: McpTrustTier
}

export interface McpConsentGrantBody {
  /** The servers this portal grant covers (a single-element array is a portal of one). */
  servers: McpConsentServerSelection[]
  durationSeconds?: number
  authRequestId?: string
  scopeId?: string
}

export type McpConsentGrantResult = { status: 'token'; token: string } | { status: 'redirect'; redirectUrl: string }

export const McpConsentServerSelectionSchema = z.object({
  serverKey: z.string().min(1),
  tier: McpTrustTierSchema,
})

export const McpConsentGrantBodySchema = z.object({
  servers: z.array(McpConsentServerSelectionSchema).min(1),
  durationSeconds: z.number().min(60).max(86400).optional(),
  authRequestId: z.string().optional(),
  scopeId: z.string().optional(),
})

export const McpConsentGrantResultSchema = z.object({
  status: z.literal('token'),
  token: z.string(),
})

export const HitlLevelSchema = z.enum(['self', 'admin'])

export const McpApprovalSummarySchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  serverKey: z.string(),
  tool: z.string(),
  level: HitlLevelSchema,
  context: z.object({ action: z.string(), targets: z.array(z.object({ label: z.string(), value: z.string() })) }).optional(),
  createdAt: z.number(),
  expiresAt: z.number().optional(),
})

export const McpApprovalHistoryItemSchema = McpApprovalSummarySchema.extend({
  status: z.enum(['approved', 'denied', 'consumed', 'timed-out']),
  decidedBy: z.string().optional(),
  decidedAt: z.number().optional(),
  selfApproved: z.boolean().optional(),
  reason: z.string().optional(),
})

export const McpGrantSummarySchema = z.object({
  grantId: z.string(),
  servers: z.array(z.object({ serverKey: z.string(), tier: McpTrustTierSchema, toolCount: z.number() })),
  clientId: z.string().optional(),
  createdAt: z.number(),
  expiresAt: z.number().optional(),
})

export const McpVelocityConfigSchema = z.object({
  effective: z.object({ enabled: z.boolean(), perGrantPerMinute: z.number(), perServerPerMinute: z.number(), perToolPerMinute: z.number() }),
  overrides: z.object({ enabled: z.boolean(), perGrantPerMinute: z.number(), perServerPerMinute: z.number(), perToolPerMinute: z.number() }).nullable(),
})

export const McpUserAssignmentSchema = z.object({
  subjectId: z.string(),
  serverKey: z.string(),
  maxTier: McpTrustTierSchema,
  resourceConstraints: z.record(z.string(), z.array(z.string())).optional(),
  assignedBy: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export const McpConsentServerSchema = z.object({
  serverKey: z.string(),
  name: z.string(),
  upstreamUrl: z.string().optional(),
  toolCount: z.number(),
})

/** One server within a portal grant. */
export interface McpGrantServerSummary {
  serverKey: string
  tier: McpTrustTier
  toolCount: number
}

export interface McpGrantSummary {
  grantId: string
  servers: McpGrantServerSummary[]
  clientId?: string
  createdAt: number
  expiresAt?: number
}

/** Best-effort context parsed from a tool call's arguments, shown on an approval. */
export interface McpCallContext {
  action: string
  targets: { label: string; value: string }[]
}

export interface McpApprovalSummary {
  id: string
  subjectId: string
  serverKey: string
  tool: string
  level: HitlLevel
  context?: McpCallContext
  createdAt: number
  /** Decision deadline (unix seconds) — the request auto-rejects after this. */
  expiresAt?: number
}

/** A decided HITL approval — the accountability record (who approved/denied what, when, why). */
export interface McpApprovalHistoryItem extends McpApprovalSummary {
  status: 'approved' | 'denied' | 'consumed' | 'timed-out'
  decidedBy?: string
  decidedAt?: number
  selfApproved?: boolean
  reason?: string
}

export interface McpVelocityConfig {
  effective: { enabled: boolean; perGrantPerMinute: number; perServerPerMinute: number; perToolPerMinute: number }
  overrides: {
    enabled: boolean
    perGrantPerMinute: number
    perServerPerMinute: number
    perToolPerMinute: number
  } | null
}

/** An admin-administered assignment giving a user access to one MCP server, capped at a max tier. */
export interface McpUserAssignment {
  subjectId: string
  serverKey: string
  maxTier: McpTrustTier
  /** Optional per-argument resource allowlist (ABAC fallback for shared-credential servers). */
  resourceConstraints?: Record<string, string[]>
  assignedBy: string
  createdAt: number
  updatedAt: number
}
