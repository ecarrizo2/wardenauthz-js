import { HttpClient } from '../http-client'
import { AgentIdentifyInput, AgentIdentifyResult, AgentCheckInput, AgentCheckResult } from '../types'

export class AgentResource {
  constructor(private readonly client: HttpClient) {}

  async identify(scopeId: string, input: AgentIdentifyInput): Promise<AgentIdentifyResult> {
    return this.client.post(`/v1/scope/${scopeId}/agent/identify`, input)
  }

  async check(scopeId: string, input: AgentCheckInput): Promise<AgentCheckResult> {
    return this.client.post(`/v1/scope/${scopeId}/agent/check`, input)
  }
}
