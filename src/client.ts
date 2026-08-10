import { HttpClient, RequestOptions } from './http-client'
import { ScopesResource } from './resources/scopes'
import { PermissionsResource } from './resources/permissions'
import { RolesResource } from './resources/roles'
import { AccessPoliciesResource } from './resources/access-policies'
import { ApiKeysResource } from './resources/api-keys'
import { WebhooksResource } from './resources/webhooks'
import { AccessResource } from './resources/access'
import { AuditResource } from './resources/audit'
import { SessionTokensResource } from './resources/session-tokens'
import { SodConstraintsResource } from './resources/sod-constraints'
import { TeamMembersResource } from './resources/team-members'
import { ResourceTypesResource } from './resources/resource-types'
import { TuplesResource } from './resources/tuples'
import { McpServersResource } from './resources/mcp-servers'
import { ConsentResource } from './resources/consent'
import { AgentResource } from './resources/agent'
import { WardenAuthClientConfig } from './types'

const DEFAULT_TIMEOUT_MS = 30000

export class WardenAuthClient {
  readonly scopes: ScopesResource
  readonly permissions: PermissionsResource
  readonly roles: RolesResource
  readonly accessPolicies: AccessPoliciesResource
  readonly apiKeys: ApiKeysResource
  readonly webhooks: WebhooksResource
  readonly access: AccessResource
  readonly audit: AuditResource
  readonly sessionTokens: SessionTokensResource
  readonly sodConstraints: SodConstraintsResource
  readonly teamMembers: TeamMembersResource
  readonly resourceTypes: ResourceTypesResource
  readonly tuples: TuplesResource
  readonly mcpServers: McpServersResource
  readonly consent: ConsentResource
  readonly agent: AgentResource

  private readonly httpClient: HttpClient

  constructor(config: WardenAuthClientConfig) {
    this.httpClient = new HttpClient(config.apiUrl, config.apiKey)

    this.scopes = new ScopesResource(this.httpClient)
    this.permissions = new PermissionsResource(this.httpClient)
    this.roles = new RolesResource(this.httpClient)
    this.accessPolicies = new AccessPoliciesResource(this.httpClient)
    this.apiKeys = new ApiKeysResource(this.httpClient)
    this.webhooks = new WebhooksResource(this.httpClient)
    this.access = new AccessResource(this.httpClient)
    this.audit = new AuditResource(this.httpClient)
    this.sessionTokens = new SessionTokensResource(this.httpClient)
    this.sodConstraints = new SodConstraintsResource(this.httpClient)
    this.teamMembers = new TeamMembersResource(this.httpClient)
    this.resourceTypes = new ResourceTypesResource(this.httpClient)
    this.tuples = new TuplesResource(this.httpClient)
    this.mcpServers = new McpServersResource(this.httpClient)
    this.consent = new ConsentResource(this.httpClient)
    this.agent = new AgentResource(this.httpClient)
  }

  createAbortController(timeoutMs: number = DEFAULT_TIMEOUT_MS): AbortController {
    const controller = new AbortController()
    setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), timeoutMs)
    return controller
  }
}
