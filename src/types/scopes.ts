import { z } from 'zod'
import { ScopeType, ScopeTypeSchema } from './common'

export interface ScopeItem {
  id: string
  name: string
  type: ScopeType
  parentId?: string
  description?: string
  allowRoleInheritance?: boolean
  accessScopeId?: string | null
}

export const ScopeItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ScopeTypeSchema,
  parentId: z.string().optional(),
  description: z.string().optional(),
  allowRoleInheritance: z.boolean().optional(),
  accessScopeId: z.string().nullable().optional(),
})

export interface CreateScopeInput {
  name: string
  type: ScopeType
  parentId?: string
  description?: string
  inheritParent?: boolean
  allowRoleInheritance?: boolean
  accessScopeId?: string
}

const uidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const CreateScopeInputSchema = z.object({
  name: z.string().min(1).max(128),
  type: ScopeTypeSchema,
  parentId: z.string().regex(uidRegex, 'parentId must be a valid UUID v4').optional(),
  description: z.string().max(500).optional(),
  inheritParent: z.boolean().optional(),
  allowRoleInheritance: z.boolean().optional(),
  accessScopeId: z.string().optional(),
})

export interface UpdateScopeInput {
  id: string
  name?: string
  description?: string
  type?: ScopeType
  parentId?: string
  allowRoleInheritance?: boolean
}

export const UpdateScopeInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(128).optional(),
  description: z.string().max(500).optional(),
  type: ScopeTypeSchema.optional(),
  parentId: z.string().regex(uidRegex, 'parentId must be a valid UUID v4').optional(),
  allowRoleInheritance: z.boolean().optional(),
})

export interface MoveScopeInput {
  newParentScopeId: string
}

export const MoveScopeInputSchema = z.object({
  newParentScopeId: z.string().min(1).max(256),
})
