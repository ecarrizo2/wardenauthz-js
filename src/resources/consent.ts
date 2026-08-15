import { HttpClient } from '../http-client'
import {
  McpConsentServer,
  McpConsentContext,
  McpConsentGrantBody,
  McpConsentGrantResult,
  McpGrantSummary,
  McpApprovalSummary,
  McpApprovalHistoryItem,
  McpVelocityConfig,
  McpUserAssignment,
  McpTrustTier,
} from '../types'

export class ConsentResource {
  constructor(private readonly client: HttpClient) {}

  async getServers(scopeId?: string): Promise<McpConsentServer[]> {
    const path = scopeId ? `/v1/mcp/consent/servers?scopeId=${encodeURIComponent(scopeId)}` : '/v1/mcp/consent/servers'
    const result = await this.client.get<{ servers: McpConsentServer[] }>(path)

    return result.servers
  }

  async getContext(serverKey: string, scopeId?: string): Promise<McpConsentContext> {
    const path = `/v1/mcp/consent/context?serverKey=${encodeURIComponent(serverKey)}${scopeId ? `&scopeId=${encodeURIComponent(scopeId)}` : ''}`

    return this.client.get<McpConsentContext>(path)
  }

  /** The whole portal: every server the caller may authorize, with its access-aware tool view. */
  async getPortalContext(scopeId?: string): Promise<McpConsentContext[]> {
    const path = scopeId ? `/v1/mcp/consent/context?scopeId=${encodeURIComponent(scopeId)}` : '/v1/mcp/consent/context'
    const result = await this.client.get<{ servers: McpConsentContext[] }>(path)

    return result.servers
  }

  async grant(body: McpConsentGrantBody): Promise<McpConsentGrantResult> {
    return this.client.post('/v1/mcp/consent/grant', body)
  }

  async deny(authRequestId: string): Promise<{ redirectUrl: string }> {
    return this.client.post('/v1/mcp/consent/deny', { authRequestId })
  }

  async getRequestInfo(reqId: string): Promise<{ clientName?: string }> {
    return this.client.get(`/v1/mcp/consent/request?req=${encodeURIComponent(reqId)}`)
  }

  async listGrants(): Promise<McpGrantSummary[]> {
    const result = await this.client.get<{ grants: McpGrantSummary[] }>('/v1/mcp/grants')

    return result.grants
  }

  async revokeGrant(grantId: string): Promise<void> {
    await this.client.delete(`/v1/mcp/grants/${encodeURIComponent(grantId)}`)
  }

  async listApprovals(): Promise<McpApprovalSummary[]> {
    const result = await this.client.get<{ approvals: McpApprovalSummary[] }>('/v1/mcp/approvals')

    return result.approvals
  }

  /** Decided approvals the caller may see — the accountability trail (who approved/denied what/why). */
  async listApprovalHistory(): Promise<McpApprovalHistoryItem[]> {
    const result = await this.client.get<{ approvals: McpApprovalHistoryItem[] }>('/v1/mcp/approvals/history')

    return result.approvals
  }

  async approveApproval(id: string, reason?: string): Promise<void> {
    await this.client.post(`/v1/mcp/approvals/${encodeURIComponent(id)}/approve`, { reason })
  }

  async denyApproval(id: string, reason?: string): Promise<void> {
    await this.client.post(`/v1/mcp/approvals/${encodeURIComponent(id)}/deny`, { reason })
  }

  /** The VAPID public key + whether Web Push notifications are configured for this workspace. */
  async getPushPublicKey(): Promise<{ enabled: boolean; publicKey: string }> {
    return this.client.get('/v1/mcp/push/public-key')
  }

  /** Register a Web Push subscription so HITL approvals reach the user instantly. */
  async subscribePush(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }): Promise<void> {
    await this.client.post('/v1/mcp/push/subscribe', subscription)
  }

  async unsubscribePush(endpoint: string): Promise<void> {
    await this.client.post('/v1/mcp/push/unsubscribe', { endpoint })
  }

  async getVelocityConfig(): Promise<McpVelocityConfig> {
    return this.client.get('/v1/mcp/velocity-config')
  }

  async updateVelocityConfig(body: {
    enabled?: boolean
    perGrantPerMinute?: number
    perServerPerMinute?: number
    perToolPerMinute?: number
  }): Promise<void> {
    await this.client.patch('/v1/mcp/velocity-config', body)
  }

  /** Lists a user's per-server MCP access assignments (the "Humans" access matrix). */
  async listAssignments(scopeId: string, subjectId: string): Promise<McpUserAssignment[]> {
    const result = await this.client.get<{ assignments: McpUserAssignment[] }>(
      `/v1/scope/${scopeId}/mcp-assignment/${encodeURIComponent(subjectId)}`
    )

    return result.assignments
  }

  /** Grants (or updates) a user's access to an MCP server with a max trust tier ceiling. */
  async setAssignment(
    scopeId: string,
    subjectId: string,
    serverKey: string,
    maxTier: McpTrustTier,
    resourceConstraints?: Record<string, string[]>
  ): Promise<McpUserAssignment> {
    return this.client.put(
      `/v1/scope/${scopeId}/mcp-assignment/${encodeURIComponent(subjectId)}/${encodeURIComponent(serverKey)}`,
      resourceConstraints ? { maxTier, resourceConstraints } : { maxTier }
    )
  }

  /** Revokes a user's access to an MCP server. */
  async deleteAssignment(scopeId: string, subjectId: string, serverKey: string): Promise<void> {
    await this.client.delete(
      `/v1/scope/${scopeId}/mcp-assignment/${encodeURIComponent(subjectId)}/${encodeURIComponent(serverKey)}`
    )
  }

  /**
   * Enterprise-Managed Authorization (EMA): provisions an MCP server for every active team member
   * at a capped trust tier, so they get it zero-touch (no per-user OAuth).
   */
  async provisionForOrg(
    scopeId: string,
    body: { serverKey: string; maxTier: McpTrustTier }
  ): Promise<{ provisioned: number }> {
    return this.client.post(`/v1/scope/${scopeId}/mcp-assignment/provision`, body)
  }
}
