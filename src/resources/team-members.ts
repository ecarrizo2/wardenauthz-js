import { HttpClient } from '../http-client'
import { AddTeamMemberInput, TeamMemberItem } from '../types'

export class TeamMembersResource {
  constructor(private readonly client: HttpClient) {}

  async add(scopeId: string, input: AddTeamMemberInput): Promise<TeamMemberItem> {
    return this.client.post(`/v1/scope/${scopeId}/team-members`, input)
  }

  async list(scopeId: string): Promise<TeamMemberItem[]> {
    return this.client.get(`/v1/scope/${scopeId}/team-members`)
  }

  async remove(scopeId: string, subjectId: string): Promise<void> {
    return this.client.delete(`/v1/scope/${scopeId}/team-members/${subjectId}`)
  }
}
