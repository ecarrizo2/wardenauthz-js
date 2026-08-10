import { z } from 'zod'
import { WebhookEventType, WebhookEventTypeSchema } from './common'

export interface WebhookEndpointItem {
  id: string
  scopeId: string
  url: string
  events: WebhookEventType[]
  active: boolean
  name?: string
  description?: string
  createdAt: string
  updatedAt?: string
  disabledAt?: string
  lastNotifiedLevel?: string
}

export const WebhookEndpointItemSchema = z.object({
  id: z.string(),
  scopeId: z.string(),
  url: z.string(),
  events: z.array(WebhookEventTypeSchema),
  active: z.boolean(),
  name: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  disabledAt: z.string().optional(),
  lastNotifiedLevel: z.string().optional(),
})

export interface WebhookEndpointCreatedItem extends WebhookEndpointItem {
  secret: string
}

export const WebhookEndpointCreatedItemSchema = WebhookEndpointItemSchema.extend({
  secret: z.string(),
})

export interface CreateWebhookEndpointInput {
  id?: string
  url: string
  events: WebhookEventType[]
  active?: boolean
  name?: string
  description?: string
}

export const CreateWebhookEndpointInputSchema = z.object({
  id: z
    .string()
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/, 'id must contain only alphanumeric characters, hyphens, and underscores')
    .optional(),
  url: z.url('Must be a valid URL'),
  events: z.array(WebhookEventTypeSchema),
  active: z.boolean().optional(),
  name: z.string().max(128).optional(),
  description: z.string().max(500).optional(),
})

export interface UpdateWebhookEndpointInput {
  url?: string
  events?: WebhookEventType[]
  active?: boolean
  name?: string
  description?: string
}

export const UpdateWebhookEndpointInputSchema = z.object({
  url: z.string().url('Must be a valid URL').optional(),
  events: z.array(WebhookEventTypeSchema).optional(),
  active: z.boolean().optional(),
  name: z.string().max(128).optional(),
  description: z.string().max(500).optional(),
})

export interface WebhookRotateSecretResult {
  secret: string
}

export const WebhookRotateSecretResultSchema = z.object({
  secret: z.string(),
})

export interface WebhookDeliveryItem {
  id: string
  endpointId: string
  scopeId: string
  url: string
  eventType: string
  success: boolean
  httpStatus: number | null
  durationMs: number
  attempts: number
  errorMessage?: string
  requestBody?: string
  responseBody?: string
  deliveredAt: string
  skipReason?: string
  nextRetryAt?: string
  receiveCount?: number
  payloadData?: string
  ttl?: number
}

export const WebhookDeliveryItemSchema = z.object({
  id: z.string(),
  endpointId: z.string(),
  scopeId: z.string(),
  url: z.string(),
  eventType: z.string(),
  success: z.boolean(),
  httpStatus: z.number().nullable(),
  durationMs: z.number(),
  attempts: z.number(),
  errorMessage: z.string().optional(),
  requestBody: z.string().optional(),
  responseBody: z.string().optional(),
  deliveredAt: z.string(),
  skipReason: z.string().optional(),
  nextRetryAt: z.string().optional(),
  receiveCount: z.number().optional(),
  payloadData: z.string().optional(),
  ttl: z.number().optional(),
})
