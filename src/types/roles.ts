import { z } from 'zod'
import type { PermissionItem } from './permissions'
import { PermissionItemSchema } from './permissions'

export interface ScopeRef {
  id: string
  name: string
}

export const ScopeRefSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export interface RoleItem {
  id: string
  name: string
  description?: string
  scope: ScopeRef
  permissions: PermissionItem[]
  inheritedFromScope?: string
}

export const RoleItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  scope: ScopeRefSchema,
  permissions: z.array(PermissionItemSchema),
  inheritedFromScope: z.string().optional(),
})

export interface CreateRoleInput {
  id: string
  scopeId: string
  name: string
  description?: string
  permissionIds: string[]
  parentRoleId?: string
}

export const CreateRoleInputSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'ID must contain only alphanumeric characters, hyphens, and underscores'),
  scopeId: z.string().min(1).max(256),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissionIds: z.array(z.string().min(1).max(100)).max(500),
  parentRoleId: z
    .string()
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'parentRoleId must contain only alphanumeric characters, hyphens, and underscores')
    .optional(),
})

export interface UpdateRoleInput {
  name: string
  description?: string
  permissionIds: string[]
  parentRoleId?: string
}

export const UpdateRoleInputSchema = z.object({
  name: z.string().min(1).max(128),
  description: z.string().max(500).optional(),
  permissionIds: z.array(z.string().min(1).max(100)).max(500),
  parentRoleId: z.string().max(100).optional(),
})
