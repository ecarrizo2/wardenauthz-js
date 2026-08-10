import { z } from 'zod'
import type { RoleItem } from './roles'
import { ScopeRefSchema, type ScopeRef, RoleItemSchema } from './roles'

export interface AccessPolicyItem {
  id: string
  subjectId: string
  scope: ScopeRef
  roles: RoleItem[]
  expiresAt?: string
  validFrom?: string
}

export const AccessPolicyItemSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  scope: ScopeRefSchema,
  roles: z.array(RoleItemSchema),
  expiresAt: z.string().optional(),
  validFrom: z.string().optional(),
})

export interface CreateAccessPolicyInput {
  subjectId: string
  scopeId: string
  roleIds: string[]
  permissionIds?: string[]
  subjectType?: 'user' | 'api-key'
  expiresAt?: string
  validFrom?: string
}

const iso8601Msg = 'must be a valid ISO 8601 date string'

export const CreateAccessPolicyInputSchema = z.object({
  subjectId: z.string().min(1).max(256),
  scopeId: z.string().min(1).max(256),
  roleIds: z.array(z.string().min(1).max(100)).max(500).optional(),
  permissionIds: z.array(z.string().min(1).max(100)).max(500).optional(),
  subjectType: z.enum(['user', 'api-key']).optional(),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, iso8601Msg)
    .optional(),
  validFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, iso8601Msg)
    .optional(),
})

export interface UpdateAccessPolicyInput {
  roleIds?: string[]
  expiresAt?: string
  validFrom?: string
}

export const UpdateAccessPolicyInputSchema = z.object({
  roleIds: z.array(z.string().min(1).max(100)).max(500).optional(),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, iso8601Msg)
    .optional(),
  validFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, iso8601Msg)
    .optional(),
})
