import { z } from 'zod'

export type McpServerStatus = 'active' | 'disabled'

/** Which principals may use a server's upstream credential at runtime.
 *  - `delegated` (default): only the caller's own per-user credential; the shared admin credential is never used.
 *  - `shared`: any caller may fall back to the scope's shared admin credential.
 *  - `shared-restricted`: the shared credential may only be used by agents (non-OAuth principals); humans must delegate. */
export type McpServerCredentialMode = 'shared' | 'delegated' | 'shared-restricted'

/** Per-tool configuration captured when an MCP server is registered. */
export interface McpToolConfig {
  name: string
  tier: 'low' | 'medium' | 'high'
  /** If set, the tool requires human approval: `self` (requester, audited) or `admin` (SoD). */
  hitl?: 'self' | 'admin'
  description?: string
}

export const McpToolConfigSchema = z.object({
  name: z.string(),
  tier: z.enum(['low', 'medium', 'high']),
  hitl: z.enum(['self', 'admin']).optional(),
  description: z.string().optional(),
})

export interface McpServerItem {
  scopeId: string
  id: string
  name: string
  provider: string
  status: McpServerStatus
  upstreamUrl?: string
  createdAt: number
  createdBy?: string
  tools?: McpToolConfig[]
  credentialMode?: McpServerCredentialMode
}

export const McpServerItemSchema = z.object({
  scopeId: z.string(),
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  status: z.enum(['active', 'disabled']),
  upstreamUrl: z.string().optional(),
  createdAt: z.number(),
  createdBy: z.string().optional(),
  tools: z.array(McpToolConfigSchema).optional(),
  credentialMode: z.enum(['shared', 'delegated', 'shared-restricted']).optional(),
})

export interface CreateMcpServerInput {
  id: string
  name: string
  provider: string
  status?: McpServerStatus
  upstreamUrl?: string
  credentialMode?: McpServerCredentialMode
  tools?: McpToolConfig[]
}

export const CreateMcpServerInputSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/),
  name: z.string().min(1).max(120),
  provider: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/),
  status: z.enum(['active', 'disabled']).optional(),
  upstreamUrl: z.string().max(2048).optional(),
  credentialMode: z.enum(['shared', 'delegated', 'shared-restricted']).optional(),
  tools: z.array(McpToolConfigSchema).optional(),
})

/**
 * Fields that can be changed after an MCP server is created. Identity fields
 * (`id`, `provider`, `scopeId`) and audit fields are immutable and omitted here.
 */
export interface UpdateMcpServerInput {
  name?: string
  status?: McpServerStatus
  upstreamUrl?: string
  credentialMode?: McpServerCredentialMode
  tools?: McpToolConfig[]
}

export const UpdateMcpServerInputSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  status: z.enum(['active', 'disabled']).optional(),
  upstreamUrl: z.string().max(2048).optional(),
  credentialMode: z.enum(['shared', 'delegated', 'shared-restricted']).optional(),
  tools: z.array(McpToolConfigSchema).optional(),
})
