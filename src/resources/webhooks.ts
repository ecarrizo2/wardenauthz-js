import { HttpClient } from '../http-client'
import {
  WebhookEndpointItem,
  WebhookEndpointCreatedItem,
  CreateWebhookEndpointInput,
  UpdateWebhookEndpointInput,
  WebhookRotateSecretResult,
  PaginatedResult,
  WebhookDeliveryItem,
} from '../types'

export class WebhooksResource {
  constructor(private readonly client: HttpClient) {}

  async create(scopeId: string, input: CreateWebhookEndpointInput): Promise<WebhookEndpointCreatedItem> {
    return this.client.post(`/v1/scope/${scopeId}/webhooks`, input)
  }

  async list(
    scopeId: string,
    options?: { limit?: number; nextToken?: string }
  ): Promise<PaginatedResult<WebhookEndpointItem>> {
    const params = new URLSearchParams()
    if (options?.limit !== undefined) params.set('limit', String(options.limit))
    if (options?.nextToken) params.set('nextToken', options.nextToken)
    const query = params.toString()
    const result = await this.client.get<{ endpoints: WebhookEndpointItem[]; nextToken?: string }>(
      `/v1/scope/${scopeId}/webhooks${query ? `?${query}` : ''}`
    )

    return { items: result.endpoints, nextToken: result.nextToken }
  }

  async getById(scopeId: string, endpointId: string): Promise<WebhookEndpointItem> {
    return this.client.get(`/v1/scope/${scopeId}/webhooks/${endpointId}`)
  }

  async update(scopeId: string, endpointId: string, input: UpdateWebhookEndpointInput): Promise<WebhookEndpointItem> {
    return this.client.patch(`/v1/scope/${scopeId}/webhooks/${endpointId}`, input)
  }

  async delete(scopeId: string, endpointId: string): Promise<void> {
    return this.client.delete(`/v1/scope/${scopeId}/webhooks/${endpointId}`)
  }

  async rotateSecret(scopeId: string, endpointId: string): Promise<WebhookRotateSecretResult> {
    return this.client.post(`/v1/scope/${scopeId}/webhooks/${endpointId}/rotate-secret`, {})
  }

  async test(scopeId: string, endpointId: string): Promise<{ message: string }> {
    return this.client.post(`/v1/scope/${scopeId}/webhooks/${endpointId}/test`, {})
  }

  async retryDelivery(scopeId: string, endpointId: string, deliveryId: string): Promise<{ message: string }> {
    return this.client.post(`/v1/scope/${scopeId}/webhooks/${endpointId}/deliveries/${deliveryId}/retry`, {})
  }

  async listDeliveries(
    scopeId: string,
    endpointId: string,
    options?: { limit?: number; nextToken?: string }
  ): Promise<PaginatedResult<WebhookDeliveryItem>> {
    const params = new URLSearchParams()
    if (options?.limit !== undefined) params.set('limit', String(options.limit))
    if (options?.nextToken) params.set('nextToken', options.nextToken)
    const query = params.toString()
    const result = await this.client.get<{ items: WebhookDeliveryItem[]; nextToken?: string }>(
      `/v1/scope/${scopeId}/webhooks/${endpointId}/deliveries${query ? `?${query}` : ''}`
    )

    return { items: result.items, nextToken: result.nextToken }
  }
}
