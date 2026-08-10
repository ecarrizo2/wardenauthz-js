import { z } from 'zod'

export interface ResourceTypeItem {
  id: string
  scopeId: string
  name: string
  description?: string
  createdAt: string
}

export const ResourceTypeItemSchema = z.object({
  id: z.string(),
  scopeId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
})

export interface CreateResourceTypeInput {
  id: string
  name: string
  description?: string
}

export const CreateResourceTypeInputSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Resource type ID must contain only alphanumeric characters, hyphens, and underscores'),
  name: z.string().min(1).max(128),
  description: z.string().max(500).optional(),
})
