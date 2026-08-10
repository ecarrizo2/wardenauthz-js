import { z } from 'zod'
import { Effect, EffectSchema } from './common'
import { AbacCondition, AbacConditionSchema } from './abac'

export interface PermissionItem {
  id: string
  scopeId: string
  resource: string
  action: string
  effect: Effect
  name: string
  description?: string
  conditions?: AbacCondition
}

export const PermissionItemSchema = z.object({
  id: z.string().min(1).max(100),
  scopeId: z.string().min(1).max(256),
  resource: z.string(),
  action: z.string(),
  effect: EffectSchema,
  name: z.string(),
  description: z.string().max(500).optional(),
  conditions: AbacConditionSchema.optional(),
})

export interface CreatePermissionInput {
  id: string
  scopeId: string
  resource: string
  action: string
  effect: Effect
  name: string
  description?: string
  conditions?: AbacCondition
}

export const CreatePermissionInputSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_:-]+$/, 'ID must contain only alphanumeric characters, hyphens, underscores, and colons'),
  scopeId: z.string().min(1).max(256),
  resource: z
    .string()
    .min(1)
    .max(200)
    .regex(
      /^[a-zA-Z0-9_*-]+$/,
      'Resource must contain only alphanumeric characters, underscores, hyphens, or asterisks'
    ),
  action: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-zA-Z0-9_*-]+$/, 'Action must contain only alphanumeric characters, underscores, hyphens, or asterisks'),
  effect: EffectSchema,
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  conditions: AbacConditionSchema.optional(),
})

export interface UpdatePermissionInput {
  resource?: string
  action?: string
  effect?: Effect
  name?: string
  description?: string
  conditions?: AbacCondition
}

export const UpdatePermissionInputSchema = z.object({
  resource: z
    .string()
    .min(1)
    .max(200)
    .regex(
      /^[a-zA-Z0-9_*-]+$/,
      'Resource must contain only alphanumeric characters, underscores, hyphens, or asterisks'
    )
    .optional(),
  action: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-zA-Z0-9_*-]+$/, 'Action must contain only alphanumeric characters, underscores, hyphens, or asterisks')
    .optional(),
  effect: EffectSchema.optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  conditions: AbacConditionSchema.optional(),
})
