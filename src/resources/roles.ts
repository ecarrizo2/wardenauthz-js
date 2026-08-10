import { HttpClient } from '../http-client'
import { RoleItem, CreateRoleInput, UpdateRoleInput, PaginatedResult } from '../types'

export class RolesResource {
  constructor(private readonly client: HttpClient) {}

  async create(scopeId: string, input: Omit<CreateRoleInput, 'scopeId'>): Promise<RoleItem> {
    return this.client.post(`/v1/scope/${scopeId}/role`, { ...input, scopeId })
  }

  async bulkCreate(scopeId: string, inputs: Array<Omit<CreateRoleInput, 'scopeId'>>): Promise<void> {
    return this.client.post(`/v1/scope/${scopeId}/role/bulk`, {
      roles: inputs.map((i) => ({ ...i, scopeId })),
    })
  }

  async list(scopeId: string, options?: { limit?: number; nextToken?: string }): Promise<PaginatedResult<RoleItem>> {
    const params = new URLSearchParams()
    if (options?.limit !== undefined) params.set('limit', String(options.limit))
    if (options?.nextToken) params.set('nextToken', options.nextToken)
    const query = params.toString()

    return this.client.get(`/v1/scope/${scopeId}/role${query ? `?${query}` : ''}`)
  }

  async getById(scopeId: string, roleId: string): Promise<RoleItem> {
    return this.client.get(`/v1/scope/${scopeId}/role/${roleId}`)
  }

  async update(scopeId: string, roleId: string, input: UpdateRoleInput): Promise<RoleItem> {
    return this.client.patch(`/v1/scope/${scopeId}/role/${roleId}`, input)
  }

  async delete(scopeId: string, roleId: string): Promise<void> {
    return this.client.delete(`/v1/scope/${scopeId}/role/${roleId}`)
  }

  async clone(sourceScopeId: string, templateRoleId: string, targetScopeId: string): Promise<RoleItem> {
    return this.client.post(`/v1/scope/${targetScopeId}/role/clone-from/${templateRoleId}`, {})
  }

  async bulkDelete(scopeId: string, ids: string[]): Promise<{ deleted: number }> {
    return this.client.delete(`/v1/scope/${scopeId}/role/bulk`, { ids })
  }
}
