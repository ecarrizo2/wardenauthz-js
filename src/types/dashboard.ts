import { z } from 'zod'
import { BillingTier, BillingTierSchema } from './billing'

export interface AnomalyResult {
  scopeId: string
  metric: string
  currentValue: number
  averageValue: number
  threshold: number
  flagged: boolean
  period: string
  id?: string
  proof?: Array<{
    actorId: string
    result: string
    resourceType?: string
    resourceId?: string
    timestamp: string
  }>
}

export const AnomalyResultSchema = z.object({
  scopeId: z.string(),
  metric: z.string(),
  currentValue: z.number(),
  averageValue: z.number(),
  threshold: z.number(),
  flagged: z.boolean(),
  period: z.string(),
  id: z.string().optional(),
  proof: z
    .array(
      z.object({
        actorId: z.string(),
        result: z.string(),
        resourceType: z.string().optional(),
        resourceId: z.string().optional(),
        timestamp: z.string(),
      })
    )
    .optional(),
})

export interface DashboardStats {
  scopeName: string
  counts: {
    permissions: number
    roles: number
    accessPolicies: number
    apiKeys: number
    resourceTypes: number
  }
  usage: {
    checksToday: number
    grantedToday: number
    deniedToday: number
    denyRateToday: number
    checksThisWeek: number
    deniedThisWeek: number
    checksThisMonth: number
  }
  organization?: {
    tier: BillingTier
    tierName: string
    monthlyLimit: number | null
    currentMonthCount: number
    percentUsed: number | null
    includedChecks: number
  }
  anomalyCounts?: {
    pending: number
    acknowledged: number
    total: number
    lastDetectedAt?: string
  }
  anomalies: AnomalyResult[]
  recentActivity: Array<{
    id: string
    eventType: string
    timestamp: string
    actor: string
    resourceType?: string
    resourceId?: string
    result: string
  }>
}

export const DashboardStatsSchema = z.object({
  scopeName: z.string(),
  counts: z.object({
    permissions: z.number(),
    roles: z.number(),
    accessPolicies: z.number(),
    apiKeys: z.number(),
    resourceTypes: z.number(),
  }),
  usage: z.object({
    checksToday: z.number(),
    grantedToday: z.number(),
    deniedToday: z.number(),
    denyRateToday: z.number(),
    checksThisWeek: z.number(),
    deniedThisWeek: z.number(),
    checksThisMonth: z.number(),
  }),
  organization: z
    .object({
      tier: BillingTierSchema,
      tierName: z.string(),
      monthlyLimit: z.number().nullable(),
      currentMonthCount: z.number(),
      percentUsed: z.number().nullable(),
      includedChecks: z.number(),
    })
    .optional(),
  anomalyCounts: z
    .object({
      pending: z.number(),
      acknowledged: z.number(),
      total: z.number(),
      lastDetectedAt: z.string().optional(),
    })
    .optional(),
  anomalies: z.array(AnomalyResultSchema),
  recentActivity: z.array(
    z.object({
      id: z.string(),
      eventType: z.string(),
      timestamp: z.string(),
      actor: z.string(),
      resourceType: z.string().optional(),
      resourceId: z.string().optional(),
      result: z.string(),
    })
  ),
})

export interface WorkspaceUsageItem {
  scopeId: string
  scopeName: string
  checksToday: number
  grantedToday: number
  deniedToday: number
  checksThisMonth: number
}

export const WorkspaceUsageItemSchema = z.object({
  scopeId: z.string(),
  scopeName: z.string(),
  checksToday: z.number(),
  grantedToday: z.number(),
  deniedToday: z.number(),
  checksThisMonth: z.number(),
})

export interface WorkspaceUsage {
  items: WorkspaceUsageItem[]
  totalChecksToday: number
  totalGrantedToday: number
  totalDeniedToday: number
  totalChecksThisMonth: number
}

export const WorkspaceUsageSchema = z.object({
  items: z.array(WorkspaceUsageItemSchema),
  totalChecksToday: z.number(),
  totalGrantedToday: z.number(),
  totalDeniedToday: z.number(),
  totalChecksThisMonth: z.number(),
})
