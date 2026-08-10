import { HttpClient } from '../http-client'
import { IpAllowlistResult, OrganizationItem, UpdateIpAllowlistInput, UpdateOrganizationInput } from '../types'

export class OrganizationResource {
  constructor(private readonly client: HttpClient) {}

  async get(): Promise<OrganizationItem> {
    return this.client.get('/v1/organization')
  }

  async update(input: UpdateOrganizationInput): Promise<OrganizationItem> {
    return this.client.patch('/v1/organization', input)
  }

  async delete(): Promise<void> {
    return this.client.delete('/v1/organization')
  }

  async getIpAllowlist(orgId: string): Promise<IpAllowlistResult> {
    return this.client.get(`/v1/org/${orgId}/ip-allowlist`)
  }

  async updateIpAllowlist(orgId: string, input: UpdateIpAllowlistInput): Promise<IpAllowlistResult> {
    return this.client.put(`/v1/org/${orgId}/ip-allowlist`, input)
  }
}
