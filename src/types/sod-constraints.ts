import { z } from 'zod'

export interface SodConstraintItem {
  id: string
  scopeId: string
  roleIdA: string
  roleIdB: string
  description?: string
}

export const SodConstraintItemSchema = z.object({
  id: z.string(),
  scopeId: z.string(),
  roleIdA: z.string(),
  roleIdB: z.string(),
  description: z.string().optional(),
})

export interface CreateSodConstraintInput {
  id?: string
  roleIdA: string
  roleIdB: string
  description?: string
}

export const CreateSodConstraintInputSchema = z.object({
  id: z.string().optional(),
  roleIdA: z.string(),
  roleIdB: z.string(),
  description: z.string().optional(),
})
