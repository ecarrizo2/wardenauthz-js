import { z } from 'zod'

export interface AuditLogItem {
  id: string
  eventType: string
  timestamp: string
  actor: string
  scopeId: string
  resourceType?: string
  resourceId?: string
  targetSubjectId?: string
  action?: string
  result: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  traceId?: string
  userAgent?: string
}

export const AuditLogItemSchema = z.object({
  id: z.string(),
  eventType: z.string(),
  timestamp: z.string(),
  actor: z.string(),
  scopeId: z.string(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  targetSubjectId: z.string().optional(),
  action: z.string().optional(),
  result: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  ipAddress: z.string().optional(),
  traceId: z.string().optional(),
  userAgent: z.string().optional(),
})

export type AuditExportFormat = 'csv' | 'json'

export const AuditExportFormatSchema = z.enum(['csv', 'json'])

export interface AuditExportInput {
  scopeId?: string
  actorId?: string
  resourceType?: string
  resourceId?: string
  startDate?: string
  endDate?: string
  eventTypes?: string[]
  maxRows?: number
  format?: AuditExportFormat
}

export const AuditExportInputSchema = z.object({
  scopeId: z.string().optional(),
  actorId: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  eventTypes: z.array(z.string()).optional(),
  maxRows: z.number().optional(),
  format: AuditExportFormatSchema.optional(),
})

export interface AuditVerifyInput {
  scopeId: string
  startDate?: string
  endDate?: string
  maxRecords?: number
}

export const AuditVerifyInputSchema = z.object({
  scopeId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxRecords: z.number().optional(),
})

export interface AuditVerifyResult {
  total: number
  matched: number
  mismatchCount: number
  mismatches: {
    id: string
    timestamp: string
    expectedSignature: string
    storedSignature: string
  }[]
}

export const AuditVerifyResultSchema = z.object({
  total: z.number(),
  matched: z.number(),
  mismatchCount: z.number(),
  mismatches: z.array(
    z.object({
      id: z.string(),
      timestamp: z.string(),
      expectedSignature: z.string(),
      storedSignature: z.string(),
    })
  ),
})
