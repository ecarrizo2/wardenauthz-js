export interface AgentIntentInstance {
  resourceType: string
  resourceId: string
}

export interface AgentIntent {
  serverKey: string
  tools: string[]
  instances?: AgentIntentInstance[]
}

export interface AgentIdentifyInput {
  delegatingUserId: string
  workflowId?: string
  intent: AgentIntent
  ttlSeconds?: number
  purpose?: string
}

export interface AgentIdentifyResult {
  token: string
  tokenType: 'Bearer'
  principalId: string
  scopeId: string
  jti: string
  issuedAt: number
  expiresAt: string
  intentHash: string
  intent: AgentIntent
  delegatingUserId: string
  workflowId?: string
  effectivePermissionIds: string[]
  purpose?: string
}

export interface AgentCheckInput {
  identityToken: string
  tool: string
  instance?: AgentIntentInstance
}

export interface AgentCheckResult {
  allowed: boolean
  jti: string
  principalId: string
  reason?: string
  serverKey?: string
  pending?: boolean
  approvalId?: string
}
