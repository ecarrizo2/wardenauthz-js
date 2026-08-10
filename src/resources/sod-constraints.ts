import { HttpClient } from '../http-client'
import { SodConstraintItem, CreateSodConstraintInput } from '../types'

export class SodConstraintsResource {
  constructor(private readonly client: HttpClient) {}

  async create(scopeId: string, input: CreateSodConstraintInput): Promise<SodConstraintItem> {
    return this.client.post(`/v1/scope/${scopeId}/sod-constraint`, input)
  }

  async list(scopeId: string): Promise<SodConstraintItem[]> {
    return this.client.get(`/v1/scope/${scopeId}/sod-constraint`)
  }

  async delete(scopeId: string, constraintId: string): Promise<void> {
    return this.client.delete(`/v1/scope/${scopeId}/sod-constraint/${constraintId}`)
  }
}
