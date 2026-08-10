import { HttpClient } from '../http-client'
import { DashboardStats, WorkspaceUsage } from '../types'

export class DashboardResource {
  constructor(private readonly client: HttpClient) {}

  async getStats(scopeId: string): Promise<DashboardStats> {
    return this.client.get(`/v1/scope/${scopeId}/stats`)
  }

  async getWorkspaceUsage(scopeId: string): Promise<WorkspaceUsage> {
    return this.client.get(`/v1/scope/${scopeId}/workspace-usage`)
  }

  async acknowledgeAnomaly(scopeId: string, anomalyId: string): Promise<{ acknowledged: boolean }> {
    return this.client.post(`/v1/scope/${scopeId}/anomaly/${anomalyId}/acknowledge`, {})
  }
}
