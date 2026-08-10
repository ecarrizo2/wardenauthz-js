import { HttpClient } from '../http-client'
import { TierPolicyResult, UpdateTierPolicyInput } from '../types'

/**
 * Per-scope agent tool trust-tier enforcement policy. Each tier
 * (low/medium/high) maps to an action: `allow` | `approve` (HITL) | `deny`.
 */
export class TierPolicyResource {
  constructor(private readonly client: HttpClient) {}

  async get(scopeId: string): Promise<TierPolicyResult> {
    return this.client.get(`/v1/scope/${scopeId}/tier-policy`)
  }

  async update(scopeId: string, input: UpdateTierPolicyInput): Promise<TierPolicyResult> {
    return this.client.put(`/v1/scope/${scopeId}/tier-policy`, input)
  }
}
