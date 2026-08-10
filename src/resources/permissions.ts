import { HttpClient } from '../http-client'
import { PermissionItem, CreatePermissionInput, UpdatePermissionInput, PaginatedResult, ImportResult } from '../types'

export class PermissionsResource {
  constructor(private readonly client: HttpClient) {}

  async create(scopeId: string, input: Omit<CreatePermissionInput, 'scopeId'>): Promise<PermissionItem> {
    return this.client.post(`/v1/scope/${scopeId}/permission`, { ...input, scopeId })
  }

  async bulkCreate(scopeId: string, inputs: Array<Omit<CreatePermissionInput, 'scopeId'>>): Promise<void> {
    return this.client.post(`/v1/scope/${scopeId}/permission/bulk`, {
      permissions: inputs.map((i) => ({ ...i, scopeId })),
    })
  }

  async list(
    scopeId: string,
    options?: { limit?: number; nextToken?: string }
  ): Promise<PaginatedResult<PermissionItem>> {
    const params = new URLSearchParams()
    if (options?.limit !== undefined) params.set('limit', String(options.limit))
    if (options?.nextToken) params.set('nextToken', options.nextToken)
    const query = params.toString()

    return this.client.get(`/v1/scope/${scopeId}/permission${query ? `?${query}` : ''}`)
  }

  async getById(scopeId: string, permissionId: string): Promise<PermissionItem> {
    return this.client.get(`/v1/scope/${scopeId}/permission/${permissionId}`)
  }

  async update(scopeId: string, permissionId: string, input: UpdatePermissionInput): Promise<PermissionItem> {
    return this.client.patch(`/v1/scope/${scopeId}/permission/${permissionId}`, input)
  }

  async delete(scopeId: string, permissionId: string): Promise<void> {
    return this.client.delete(`/v1/scope/${scopeId}/permission/${permissionId}`)
  }

  async bulkDelete(scopeId: string, ids: string[]): Promise<{ deleted: number }> {
    return this.client.delete(`/v1/scope/${scopeId}/permission/bulk`, { ids })
  }

  async importCsv(scopeId: string, csvContent: string): Promise<ImportResult> {
    return this.client.post(`/v1/scope/${scopeId}/permission/import-csv`, { csv: csvContent })
  }
}
