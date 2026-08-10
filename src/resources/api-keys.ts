import { HttpClient } from '../http-client'
import {
  ApiKeyItem,
  ApiKeyCreatedItem,
  ApiKeyRotationResult,
  ApiKeyRevealRotationResult,
  CreateApiKeyInput,
  UpdateApiKeyAutoRotationInput,
} from '../types'

export class ApiKeysResource {
  constructor(private readonly client: HttpClient) {}

  async create(scopeId: string, keyType: string, input: CreateApiKeyInput): Promise<ApiKeyCreatedItem> {
    return this.client.post(`/v1/scope/${scopeId}/api-key/${keyType}`, input)
  }

  async list(scopeId: string, keyType: string): Promise<ApiKeyItem[]> {
    const result = await this.client.get<{ items: ApiKeyItem[] }>(`/v1/scope/${scopeId}/api-key/${keyType}`)
    return result.items
  }

  async getById(scopeId: string, keyType: string, keyId: string): Promise<ApiKeyItem> {
    return this.client.get(`/v1/scope/${scopeId}/api-key/${keyType}/${keyId}`)
  }

  async delete(scopeId: string, keyType: string, keyId: string): Promise<void> {
    return this.client.delete(`/v1/scope/${scopeId}/api-key/${keyType}/${keyId}`)
  }

  async rotate(scopeId: string, keyType: string, keyId: string): Promise<ApiKeyRotationResult> {
    return this.client.post(`/v1/scope/${scopeId}/api-key/${keyType}/${keyId}/rotate`, {})
  }

  async revealRotation(scopeId: string, keyType: string, keyId: string, rotationRef: string): Promise<ApiKeyRevealRotationResult> {
    return this.client.post(`/v1/scope/${scopeId}/api-key/${keyType}/${keyId}/rotation/reveal`, { rotationRef })
  }

  async updateAutoRotation(scopeId: string, keyType: string, keyId: string, input: UpdateApiKeyAutoRotationInput): Promise<ApiKeyItem> {
    return this.client.patch(`/v1/scope/${scopeId}/api-key/${keyType}/${keyId}/auto-rotation`, input)
  }
}
