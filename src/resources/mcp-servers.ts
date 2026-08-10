import { HttpClient } from '../http-client'
import { McpServerItem, CreateMcpServerInput, UpdateMcpServerInput } from '../types'

export class McpServersResource {
  constructor(private readonly client: HttpClient) {}

  async create(scopeId: string, input: CreateMcpServerInput): Promise<McpServerItem> {
    return this.client.post(`/v1/scope/${scopeId}/integration`, input)
  }

  async list(scopeId: string): Promise<McpServerItem[]> {
    const result = await this.client.get<{ items: McpServerItem[] }>(`/v1/scope/${scopeId}/integration`)

    return result.items
  }

  async getById(scopeId: string, id: string): Promise<McpServerItem> {
    return this.client.get(`/v1/scope/${scopeId}/integration/${id}`)
  }

  async update(scopeId: string, id: string, input: UpdateMcpServerInput): Promise<McpServerItem> {
    return this.client.patch(`/v1/scope/${scopeId}/integration/${id}`, input)
  }

  async delete(scopeId: string, id: string): Promise<void> {
    return this.client.delete(`/v1/scope/${scopeId}/integration/${id}`)
  }
}
