import { z } from 'zod'
import { ScopeType, ScopeTypeSchema } from './common'

export interface IpAllowlistResult {
  cidrs: string[]
}

export const IpAllowlistResultSchema = z.object({
  cidrs: z.array(z.string()),
})

export interface UpdateIpAllowlistInput {
  cidrs: string[]
}

export const UpdateIpAllowlistInputSchema = z.object({
  cidrs: z.array(z.string()),
})

export interface OrganizationItem {
  id: string
  name: string
  type: ScopeType
  description?: string
  parentId?: string
  billing?: {
    tier: string
    stripeStatus?: string
  }
}

export const OrganizationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ScopeTypeSchema,
  description: z.string().optional(),
  parentId: z.string().optional(),
  billing: z
    .object({
      tier: z.string(),
      stripeStatus: z.string().optional(),
    })
    .optional(),
})

export interface UpdateOrganizationInput {
  name?: string
  description?: string
}

export const UpdateOrganizationInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
})
