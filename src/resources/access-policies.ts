import { HttpClient } from '../http-client'
import { AccessPolicyItem, CreateAccessPolicyInput, UpdateAccessPolicyInput, ImportResult } from '../types'

export class AccessPoliciesResource {
  constructor(private readonly client: HttpClient) {}

  async create(scopeId: string, input: Omit<CreateAccessPolicyInput, 'scopeId'>): Promise<AccessPolicyItem> {
    return this.client.post(`/v1/scope/${scopeId}/access-policy`, { ...input, scopeId })
  }

  async listByScope(scopeId: string): Promise<AccessPolicyItem[]> {
    const result = await this.client.get<{ items: AccessPolicyItem[] }>(`/v1/scope/${scopeId}/access-policy`)
    return result.items
  }

  async listBySubject(scopeId: string, subjectId: string): Promise<AccessPolicyItem[]> {
    return this.client.get<AccessPolicyItem[]>(`/v1/scope/${scopeId}/access-policy/subject/${subjectId}`)
  }

  async getById(scopeId: string, policyId: string): Promise<AccessPolicyItem> {
    return this.client.get(`/v1/scope/${scopeId}/access-policy/${policyId}`)
  }

  async update(scopeId: string, policyId: string, input: UpdateAccessPolicyInput): Promise<AccessPolicyItem> {
    return this.client.patch(`/v1/scope/${scopeId}/access-policy/${policyId}`, input)
  }

  async delete(scopeId: string, policyId: string): Promise<void> {
    return this.client.delete(`/v1/scope/${scopeId}/access-policy/${policyId}`)
  }

  async importCsv(scopeId: string, csvContent: string): Promise<ImportResult> {
    return this.client.post(`/v1/scope/${scopeId}/access-policy/import-csv`, { csv: csvContent })
  }
}
