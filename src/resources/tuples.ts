import { HttpClient } from '../http-client'
import { TupleWriteInput, TupleWriteResult, TupleListResult, TupleItem } from '../types'

export class TuplesResource {
  constructor(private readonly client: HttpClient) {}

  async write(scopeId: string, input: TupleWriteInput): Promise<TupleWriteResult> {
    return this.client.post(`/v1/scope/${scopeId}/tuples`, input)
  }

  async list(scopeId: string, subjectId: string, resourceType?: string, resourceId?: string): Promise<TupleListResult> {
    const params = new URLSearchParams({ subjectId })
    if (resourceType) params.set('resourceType', resourceType)
    if (resourceId) params.set('resourceId', resourceId)
    const query = params.toString()

    return this.client.get(`/v1/scope/${scopeId}/tuples?${query}`)
  }

  async listByResource(scopeId: string, resourceType: string, resourceId: string): Promise<{ tuples: TupleItem[] }> {
    const params = new URLSearchParams({ resourceType, resourceId })

    return this.client.get(`/v1/scope/${scopeId}/tuples-by-resource?${params}`)
  }
}
