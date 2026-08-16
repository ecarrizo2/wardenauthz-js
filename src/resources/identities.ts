import { HttpClient } from '../http-client'
import { UserIdentityItem, PaginatedResult } from '../types'

export class IdentitiesResource {
  constructor(private readonly client: HttpClient) {}

  async list(orgId: string, opts?: { limit?: number; nextToken?: string }): Promise<PaginatedResult<UserIdentityItem>> {
    const params = new URLSearchParams()
    if (opts?.limit) params.set('limit', String(opts.limit))
    if (opts?.nextToken) params.set('nextToken', opts.nextToken)
    const query = params.toString() ? '?' + params.toString() : ''
    return this.client.get(`/v1/admin/org/${orgId}/identities${query}`)
  }
}
