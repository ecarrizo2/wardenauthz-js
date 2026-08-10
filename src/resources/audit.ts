import { HttpClient } from '../http-client'
import { AuditLogItem, AuditExportInput, AuditVerifyInput, AuditVerifyResult, PaginatedResult } from '../types'

export class AuditResource {
  constructor(private readonly client: HttpClient) {}

  async list(
    scopeId?: string,
    options?: {
      limit?: number
      nextToken?: string
      actorId?: string
      resourceType?: string
      resourceId?: string
      startDate?: string
      endDate?: string
    }
  ): Promise<PaginatedResult<AuditLogItem>> {
    const params = new URLSearchParams()
    if (scopeId) params.set('scopeId', scopeId)
    if (options?.limit !== undefined) params.set('limit', String(options.limit))
    if (options?.nextToken) params.set('nextToken', options.nextToken)
    if (options?.actorId) params.set('actorId', options.actorId)
    if (options?.resourceType) params.set('resourceType', options.resourceType)
    if (options?.resourceId) params.set('resourceId', options.resourceId)
    if (options?.startDate) params.set('startDate', options.startDate)
    if (options?.endDate) params.set('endDate', options.endDate)
    const query = params.toString()

    return this.client.get(`/v1/audit${query ? `?${query}` : ''}`)
  }

  async export(input?: AuditExportInput): Promise<string> {
    const params = new URLSearchParams()
    if (input?.scopeId) params.set('scopeId', input.scopeId)
    if (input?.actorId) params.set('actorId', input.actorId)
    if (input?.resourceType) params.set('resourceType', input.resourceType)
    if (input?.resourceId) params.set('resourceId', input.resourceId)
    if (input?.startDate) params.set('startDate', input.startDate)
    if (input?.endDate) params.set('endDate', input.endDate)
    if (input?.eventTypes?.length) {
      input.eventTypes.forEach((et) => params.append('eventTypes', et))
    }
    if (input?.maxRows !== undefined) params.set('maxRows', String(input.maxRows))
    if (input?.format) params.set('format', input.format)
    const query = params.toString()

    return this.client.getRawText(`/v1/audit/export${query ? `?${query}` : ''}`)
  }

  async verify(input: AuditVerifyInput): Promise<AuditVerifyResult> {
    const params = new URLSearchParams()
    params.set('scopeId', input.scopeId)
    if (input.startDate) params.set('startDate', input.startDate)
    if (input.endDate) params.set('endDate', input.endDate)
    if (input.maxRecords !== undefined) params.set('maxRecords', String(input.maxRecords))
    const query = params.toString()

    return this.client.get(`/v1/audit/verify?${query}`)
  }
}
