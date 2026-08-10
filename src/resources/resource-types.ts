import { HttpClient } from '../http-client'
import { ResourceTypeItem, CreateResourceTypeInput, PaginatedResult } from '../types'

export class ResourceTypesResource {
  constructor(private readonly client: HttpClient) {}

  async create(scopeId: string, input: CreateResourceTypeInput): Promise<ResourceTypeItem> {
    return this.client.post(`/v1/scope/${scopeId}/resource-type`, { ...input, scopeId })
  }

  async list(
    scopeId: string,
    options?: { limit?: number; nextToken?: string }
  ): Promise<PaginatedResult<ResourceTypeItem>> {
    const params = new URLSearchParams()
    if (options?.limit !== undefined) params.set('limit', String(options.limit))
    if (options?.nextToken) params.set('nextToken', options.nextToken)
    const query = params.toString()

    return this.client.get(`/v1/scope/${scopeId}/resource-type${query ? `?${query}` : ''}`)
  }

  async delete(scopeId: string, resourceTypeId: string): Promise<void> {
    return this.client.delete(`/v1/scope/${scopeId}/resource-type/${resourceTypeId}`)
  }
}
