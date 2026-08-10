import { z } from 'zod'

export interface TupleKey {
  subject: string
  relation: string
  object: string
}

export const TupleKeySchema = z.object({
  subject: z.string(),
  relation: z.string(),
  object: z.string(),
})

export interface TupleWriteInput {
  writes?: {
    subject: string
    relation: string
    object: string
    metadata?: Record<string, string>
  }[]
  deletes?: TupleKey[]
}

export const TupleWriteInputSchema = z.object({
  writes: z
    .array(
      z.object({
        subject: z.string(),
        relation: z.string(),
        object: z.string(),
        metadata: z.record(z.string(), z.string()).optional(),
      })
    )
    .optional(),
  deletes: z.array(TupleKeySchema).optional(),
})

export interface TupleWriteResult {
  written: number
  deleted: number
}

export const TupleWriteResultSchema = z.object({
  written: z.number(),
  deleted: z.number(),
})

export interface TupleItem {
  subject: string
  relation: string
  object: string
  scopeId: string
  metadata?: Record<string, string>
}

export const TupleItemSchema = z.object({
  subject: z.string(),
  relation: z.string(),
  object: z.string(),
  scopeId: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
})

export interface TupleListResult {
  tuples: TupleItem[]
}

export const TupleListResultSchema = z.object({
  tuples: z.array(TupleItemSchema),
})
