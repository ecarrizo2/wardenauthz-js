import { HttpClient } from '../http-client'
import {
  ScopeItem,
  CreateScopeInput,
  UpdateScopeInput,
  MoveScopeInput,
  PaginatedResult,
  ScopeType,
  ApplyScopeManifestInput,
  ApplyScopeManifestResult,
} from '../types'

export class ScopesResource {
  constructor(private readonly client: HttpClient) {}

  async create(input: CreateScopeInput): Promise<ScopeItem> {
    return this.client.post('/v1/scope', input)
  }

  async list(options?: { limit?: number; nextToken?: string; type?: ScopeType }): Promise<PaginatedResult<ScopeItem>> {
    const params = new URLSearchParams()
    if (options?.limit !== undefined) params.set('limit', String(options.limit))
    if (options?.nextToken) params.set('nextToken', options.nextToken)
    if (options?.type) params.set('type', options.type)
    const query = params.toString()

    return this.client.get(`/v1/scope${query ? `?${query}` : ''}`)
  }

  async getById(scopeId: string): Promise<ScopeItem> {
    return this.client.get(`/v1/scope/${scopeId}`)
  }

  async update(scopeId: string, input: UpdateScopeInput): Promise<ScopeItem> {
    return this.client.patch(`/v1/scope/${scopeId}`, input)
  }

  async delete(scopeId: string): Promise<void> {
    return this.client.delete(`/v1/scope/${scopeId}`)
  }

  async applyManifest(scopeId: string, input: ApplyScopeManifestInput): Promise<ApplyScopeManifestResult> {
    return this.client.post(`/v1/scope/${scopeId}/apply`, input)
  }

  async export(scopeId: string): Promise<Record<string, unknown>> {
    return this.client.get(`/v1/scope/${scopeId}/export`)
  }

  async move(scopeId: string, input: MoveScopeInput): Promise<ScopeItem> {
    return this.client.post(`/v1/scope/${scopeId}/move`, input)
  }
}
