import { z } from 'zod'
import { CreateScopeInputSchema, UpdateScopeInputSchema, MoveScopeInputSchema, ScopeItemSchema } from '../types/scopes'
import { ApplyScopeManifestInputSchema } from '../types/manifest'
import { CreatePermissionInputSchema, UpdatePermissionInputSchema, PermissionItemSchema } from '../types/permissions'
import { CreateRoleInputSchema, UpdateRoleInputSchema, RoleItemSchema } from '../types/roles'
import {
  CreateAccessPolicyInputSchema,
  UpdateAccessPolicyInputSchema,
  AccessPolicyItemSchema,
} from '../types/access-policies'
import {
  CreateApiKeyInputSchema,
  ApiKeyItemSchema,
  ApiKeyCreatedItemSchema,
  ApiKeyRotationResultSchema,
  ApiKeyRevealRotationResultSchema,
  RotateApiKeyInputSchema,
  UpdateApiKeyAutoRotationInputSchema,
} from '../types/api-keys'
import { CreateResourceTypeInputSchema, ResourceTypeItemSchema } from '../types/resource-types'
import {
  CreateWebhookEndpointInputSchema,
  UpdateWebhookEndpointInputSchema,
  WebhookEndpointItemSchema,
  WebhookEndpointCreatedItemSchema,
  WebhookRotateSecretResultSchema,
  WebhookDeliveryItemSchema,
} from '../types/webhooks'
import {
  AccessCheckInputSchema,
  AccessCheckResultSchema,
  SelfAccessCheckInputSchema,
  SelfAccessCheckResultSchema,
  ListPermissionsInputSchema,
  ListPermissionsResultSchema,
  ListRolesInputSchema,
  ListRolesResultSchema,
  SimulateAccessInputSchema,
  SimulateAccessResultSchema,
} from '../types/access-evaluation'
import {
  AuditExportInputSchema,
  AuditVerifyInputSchema,
  AuditLogItemSchema,
  AuditVerifyResultSchema,
} from '../types/audit'
import {
  SubscriptionSummarySchema,
  UpdateSubscriptionInputSchema,
  CreateCheckoutSessionInputSchema,
  CreateCheckoutSessionResultSchema,
  CreateCustomerPortalSessionResultSchema,
  OverageStatusSchema,
  GrantOverageConsentInputSchema,
  GrantOverageConsentResultSchema,
} from '../types/billing'
import { DashboardStatsSchema, WorkspaceUsageSchema, AnomalyResultSchema } from '../types/dashboard'
import { CreateSodConstraintInputSchema, SodConstraintItemSchema } from '../types/sod-constraints'
import {
  MintSessionTokenInputSchema,
  MintSessionTokenResultSchema,
  MintIntentSessionTokenInputSchema,
  MintIntentSessionTokenResultSchema,
  VerifyIntentCallInputSchema,
  VerifyIntentCallResultSchema,
} from '../types/session-tokens'
import { McpServerItemSchema, CreateMcpServerInputSchema } from '../types/mcp-servers'
import {
  SsoConfigItemSchema,
  CreateSsoConfigInputSchema,
  UpdateSsoConfigInputSchema,
  SsoTestResultSchema,
  RotateScimTokenResultSchema,
  ScimConfigSchema,
} from '../types/sso'
import { AddTeamMemberInputSchema, TeamMemberItemSchema } from '../types/team-members'
import {
  OrganizationItemSchema,
  UpdateOrganizationInputSchema,
  IpAllowlistResultSchema,
  UpdateIpAllowlistInputSchema,
} from '../types/organization'
import { ImportResultSchema } from '../types/common'
import {
  McpConsentGrantBodySchema,
  McpConsentGrantResultSchema,
  McpConsentServerSelectionSchema,
  McpApprovalSummarySchema,
  McpApprovalHistoryItemSchema,
  McpGrantSummarySchema,
  McpVelocityConfigSchema,
  McpUserAssignmentSchema,
  McpTrustTierSchema,
  McpConsentServerSchema,
} from '../types/consent'

export interface PathParam {
  name: string
  description?: string
  schema: z.ZodType
}

export interface QueryParam {
  name: string
  description?: string
  schema: z.ZodType
  required?: boolean
}

export interface RouteDefinition {
  method: 'get' | 'post' | 'patch' | 'put' | 'delete'
  path: string
  operationId: string
  summary: string
  description?: string
  tags: string[]
  pathParams?: PathParam[]
  queryParams?: QueryParam[]
  requestBody?: {
    schema: z.ZodType
    description?: string
    required?: boolean
  }
  responses: {
    status: number
    description: string
    schema?: z.ZodType
  }[]
}

const idParam = z.string().describe('Resource identifier')
const scopeIdParam = z.string().describe('Scope ID')
const orgIdParam = z.string().describe('Organization ID')

export const routeDefinitions: RouteDefinition[] = [
  // ── Scopes ───────────────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/scope',
    operationId: 'createScope',
    summary: 'Create a scope',
    tags: ['Scopes'],
    requestBody: { schema: CreateScopeInputSchema },
    responses: [{ status: 201, description: 'Scope created', schema: ScopeItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope',
    operationId: 'listScopes',
    summary: 'List scopes',
    tags: ['Scopes'],
    queryParams: [
      { name: 'limit', schema: z.number().optional(), description: 'Maximum items per page' },
      { name: 'nextToken', schema: z.string().optional(), description: 'Pagination cursor' },
      { name: 'type', schema: z.string().optional(), description: 'Filter by scope type' },
    ],
    responses: [{ status: 200, description: 'Paginated list of scopes', schema: ScopeItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}',
    operationId: 'getScope',
    summary: 'Get a scope by ID',
    tags: ['Scopes'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'Scope details', schema: ScopeItemSchema }],
  },
  {
    method: 'patch',
    path: '/v1/scope/{scopeId}',
    operationId: 'updateScope',
    summary: 'Update a scope',
    tags: ['Scopes'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    requestBody: { schema: UpdateScopeInputSchema },
    responses: [{ status: 200, description: 'Updated scope', schema: ScopeItemSchema }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}',
    operationId: 'deleteScope',
    summary: 'Delete a scope',
    tags: ['Scopes'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'Scope deleted' }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/move',
    operationId: 'moveScope',
    summary: 'Move a scope to a new parent',
    tags: ['Scopes'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    requestBody: { schema: MoveScopeInputSchema },
    responses: [{ status: 200, description: 'Moved scope', schema: ScopeItemSchema }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/apply',
    operationId: 'applyScopeManifest',
    summary: 'Apply an authorization manifest to a scope',
    description:
      'Applies a declarative authorization manifest (permissions, roles, access policies) to a scope. Supports idempotent apply via idempotencyKey.',
    tags: ['Scopes'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    requestBody: { schema: ApplyScopeManifestInputSchema },
    responses: [{ status: 200, description: 'Manifest apply result' }],
  },
  {
    method: 'get',
    path: '/v1/admin/scope/{scopeId}/export',
    operationId: 'exportScope',
    summary: 'Export a scope as authorization manifest',
    tags: ['Scopes'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'Exported scope manifest' }],
  },

  // ── Permissions ──────────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/permission',
    operationId: 'createPermission',
    summary: 'Create a permission',
    tags: ['Permissions'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    requestBody: { schema: CreatePermissionInputSchema },
    responses: [{ status: 201, description: 'Permission created', schema: PermissionItemSchema }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/permission/bulk',
    operationId: 'bulkCreatePermissions',
    summary: 'Bulk create permissions',
    tags: ['Permissions'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 201, description: 'Permissions created' }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/permission',
    operationId: 'listPermissions',
    summary: 'List permissions in a scope',
    tags: ['Permissions'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    queryParams: [
      { name: 'limit', schema: z.number().optional(), description: 'Maximum items per page' },
      { name: 'nextToken', schema: z.string().optional(), description: 'Pagination cursor' },
    ],
    responses: [{ status: 200, description: 'Paginated list of permissions', schema: PermissionItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/permission/{id}',
    operationId: 'getPermission',
    summary: 'Get a permission by ID',
    tags: ['Permissions'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Permission ID' },
    ],
    responses: [{ status: 200, description: 'Permission details', schema: PermissionItemSchema }],
  },
  {
    method: 'patch',
    path: '/v1/scope/{scopeId}/permission/{id}',
    operationId: 'updatePermission',
    summary: 'Update a permission',
    tags: ['Permissions'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Permission ID' },
    ],
    requestBody: { schema: UpdatePermissionInputSchema },
    responses: [{ status: 200, description: 'Updated permission', schema: PermissionItemSchema }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}/permission/{id}',
    operationId: 'deletePermission',
    summary: 'Delete a permission',
    tags: ['Permissions'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Permission ID' },
    ],
    responses: [{ status: 200, description: 'Permission deleted' }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}/permission/bulk',
    operationId: 'bulkDeletePermissions',
    summary: 'Bulk delete permissions',
    tags: ['Permissions'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'Permissions deleted' }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/permission/import-csv',
    operationId: 'importPermissionsCsv',
    summary: 'Import permissions from CSV',
    tags: ['Permissions'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'Import result', schema: ImportResultSchema }],
  },

  // ── Roles ────────────────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/role',
    operationId: 'createRole',
    summary: 'Create a role',
    tags: ['Roles'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    requestBody: { schema: CreateRoleInputSchema },
    responses: [{ status: 201, description: 'Role created', schema: RoleItemSchema }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/role/bulk',
    operationId: 'bulkCreateRoles',
    summary: 'Bulk create roles',
    tags: ['Roles'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 201, description: 'Roles created' }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/role',
    operationId: 'listRoles',
    summary: 'List roles in a scope',
    tags: ['Roles'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    queryParams: [
      { name: 'limit', schema: z.number().optional(), description: 'Maximum items per page' },
      { name: 'nextToken', schema: z.string().optional(), description: 'Pagination cursor' },
    ],
    responses: [{ status: 200, description: 'Paginated list of roles', schema: RoleItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/role/{id}',
    operationId: 'getRole',
    summary: 'Get a role by ID',
    tags: ['Roles'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Role ID' },
    ],
    responses: [{ status: 200, description: 'Role details', schema: RoleItemSchema }],
  },
  {
    method: 'patch',
    path: '/v1/scope/{scopeId}/role/{id}',
    operationId: 'updateRole',
    summary: 'Update a role',
    tags: ['Roles'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Role ID' },
    ],
    requestBody: { schema: UpdateRoleInputSchema },
    responses: [{ status: 200, description: 'Updated role', schema: RoleItemSchema }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}/role/{id}',
    operationId: 'deleteRole',
    summary: 'Delete a role',
    tags: ['Roles'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Role ID' },
    ],
    responses: [{ status: 200, description: 'Role deleted' }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}/role/bulk',
    operationId: 'bulkDeleteRoles',
    summary: 'Bulk delete roles',
    tags: ['Roles'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'Roles deleted' }],
  },
  {
    method: 'post',
    path: '/v1/scope/{targetScopeId}/role/clone-from/{templateRoleId}',
    operationId: 'cloneRole',
    summary: 'Clone a role from another scope',
    tags: ['Roles'],
    pathParams: [
      { name: 'targetScopeId', schema: scopeIdParam, description: 'Target scope ID' },
      { name: 'templateRoleId', schema: idParam, description: 'Source role ID' },
    ],
    responses: [{ status: 201, description: 'Cloned role', schema: RoleItemSchema }],
  },

  // ── Access Policies ──────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/access-policy',
    operationId: 'createAccessPolicy',
    summary: 'Create an access policy',
    tags: ['Access Policies'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    requestBody: { schema: CreateAccessPolicyInputSchema },
    responses: [{ status: 201, description: 'Access policy created', schema: AccessPolicyItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/access-policy',
    operationId: 'listAccessPoliciesByScope',
    summary: 'List access policies in a scope',
    tags: ['Access Policies'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    queryParams: [
      { name: 'limit', schema: z.number().optional(), description: 'Maximum items per page' },
      { name: 'nextToken', schema: z.string().optional(), description: 'Pagination cursor' },
    ],
    responses: [{ status: 200, description: 'Paginated list of access policies', schema: AccessPolicyItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/access-policy/{id}',
    operationId: 'getAccessPolicy',
    summary: 'Get an access policy by ID',
    tags: ['Access Policies'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Policy ID (subjectId)' },
    ],
    responses: [{ status: 200, description: 'Access policy details', schema: AccessPolicyItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/access-policy/subject/{subjectId}',
    operationId: 'listAccessPoliciesBySubject',
    summary: 'List access policies for a subject',
    tags: ['Access Policies'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'subjectId', schema: idParam, description: 'Subject ID' },
    ],
    responses: [{ status: 200, description: 'List of access policies', schema: AccessPolicyItemSchema }],
  },
  {
    method: 'patch',
    path: '/v1/scope/{scopeId}/access-policy/{id}',
    operationId: 'updateAccessPolicy',
    summary: 'Update an access policy',
    tags: ['Access Policies'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Policy ID (subjectId)' },
    ],
    requestBody: { schema: UpdateAccessPolicyInputSchema },
    responses: [{ status: 200, description: 'Updated access policy', schema: AccessPolicyItemSchema }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}/access-policy/{id}',
    operationId: 'deleteAccessPolicy',
    summary: 'Delete an access policy',
    tags: ['Access Policies'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Policy ID (subjectId)' },
    ],
    responses: [{ status: 200, description: 'Access policy deleted' }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/access-policy/import-csv',
    operationId: 'importAccessPoliciesCsv',
    summary: 'Import access policies from CSV',
    tags: ['Access Policies'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'Import result', schema: ImportResultSchema }],
  },

  // ── API Keys ─────────────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/api-key',
    operationId: 'createApiKey',
    summary: 'Create an API key',
    description: 'Creates a new API key. The raw key is returned ONCE — store it securely.',
    tags: ['API Keys'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    requestBody: { schema: CreateApiKeyInputSchema },
    responses: [{ status: 201, description: 'API key created (includes raw key)', schema: ApiKeyCreatedItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/api-key',
    operationId: 'listApiKeys',
    summary: 'List API keys in a scope',
    tags: ['API Keys'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    queryParams: [
      { name: 'limit', schema: z.number().optional(), description: 'Maximum items per page' },
      { name: 'nextToken', schema: z.string().optional(), description: 'Pagination cursor' },
    ],
    responses: [{ status: 200, description: 'Paginated list of API keys', schema: ApiKeyItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/api-key/{keyId}',
    operationId: 'getApiKey',
    summary: 'Get an API key by ID',
    tags: ['API Keys'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'keyId', schema: idParam, description: 'API key ID' },
    ],
    responses: [{ status: 200, description: 'API key details (masked)', schema: ApiKeyItemSchema }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}/api-key/{keyId}',
    operationId: 'deleteApiKey',
    summary: 'Delete an API key',
    tags: ['API Keys'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'keyId', schema: idParam, description: 'API key ID' },
    ],
    responses: [{ status: 200, description: 'API key deleted' }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/api-key/{keyId}/rotate',
    operationId: 'rotateApiKey',
    summary: 'Rotate an API key',
    description: 'Creates a new key and keeps the old key valid for a configurable overlap period.',
    tags: ['API Keys'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'keyId', schema: idParam, description: 'API key ID' },
    ],
    requestBody: { schema: RotateApiKeyInputSchema },
    responses: [{ status: 200, description: 'Rotation result', schema: ApiKeyRotationResultSchema }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/api-key/{keyId}/rotation/reveal',
    operationId: 'revealApiKeyRotation',
    summary: 'Reveal a rotated API key',
    description: 'Reveals the raw key from the most recent rotation within the overlap window.',
    tags: ['API Keys'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'keyId', schema: idParam, description: 'API key ID' },
    ],
    responses: [{ status: 200, description: 'Revealed rotation key', schema: ApiKeyRevealRotationResultSchema }],
  },
  {
    method: 'patch',
    path: '/v1/scope/{scopeId}/api-key/{keyId}/auto-rotation',
    operationId: 'updateApiKeyAutoRotation',
    summary: 'Configure auto-rotation for an API key',
    tags: ['API Keys'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'keyId', schema: idParam, description: 'API key ID' },
    ],
    requestBody: { schema: UpdateApiKeyAutoRotationInputSchema },
    responses: [{ status: 200, description: 'Auto-rotation configured', schema: ApiKeyItemSchema }],
  },

  // ── Resource Types ───────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/resource-type',
    operationId: 'createResourceType',
    summary: 'Create a resource type',
    tags: ['Resource Types'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    requestBody: { schema: CreateResourceTypeInputSchema },
    responses: [{ status: 201, description: 'Resource type created', schema: ResourceTypeItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/resource-type',
    operationId: 'listResourceTypes',
    summary: 'List resource types in a scope',
    tags: ['Resource Types'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'List of resource types', schema: ResourceTypeItemSchema }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}/resource-type/{resourceTypeId}',
    operationId: 'deleteResourceType',
    summary: 'Delete a resource type',
    tags: ['Resource Types'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'resourceTypeId', schema: idParam, description: 'Resource type ID' },
    ],
    responses: [{ status: 200, description: 'Resource type deleted' }],
  },

  // ── Webhooks ─────────────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/webhooks',
    operationId: 'createWebhookEndpoint',
    summary: 'Create a webhook endpoint',
    tags: ['Webhooks'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    requestBody: { schema: CreateWebhookEndpointInputSchema },
    responses: [
      {
        status: 201,
        description: 'Webhook endpoint created (includes secret)',
        schema: WebhookEndpointCreatedItemSchema,
      },
    ],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/webhooks',
    operationId: 'listWebhookEndpoints',
    summary: 'List webhook endpoints in a scope',
    tags: ['Webhooks'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'List of webhook endpoints', schema: WebhookEndpointItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/webhooks/{endpointId}',
    operationId: 'getWebhookEndpoint',
    summary: 'Get a webhook endpoint by ID',
    tags: ['Webhooks'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'endpointId', schema: idParam, description: 'Endpoint ID' },
    ],
    responses: [{ status: 200, description: 'Webhook endpoint details', schema: WebhookEndpointItemSchema }],
  },
  {
    method: 'patch',
    path: '/v1/scope/{scopeId}/webhooks/{endpointId}',
    operationId: 'updateWebhookEndpoint',
    summary: 'Update a webhook endpoint',
    tags: ['Webhooks'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'endpointId', schema: idParam, description: 'Endpoint ID' },
    ],
    requestBody: { schema: UpdateWebhookEndpointInputSchema },
    responses: [{ status: 200, description: 'Updated webhook endpoint', schema: WebhookEndpointItemSchema }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}/webhooks/{endpointId}',
    operationId: 'deleteWebhookEndpoint',
    summary: 'Delete a webhook endpoint',
    tags: ['Webhooks'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'endpointId', schema: idParam, description: 'Endpoint ID' },
    ],
    responses: [{ status: 200, description: 'Webhook endpoint deleted' }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/webhooks/{endpointId}/rotate-secret',
    operationId: 'rotateWebhookSecret',
    summary: 'Rotate a webhook endpoint secret',
    tags: ['Webhooks'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'endpointId', schema: idParam, description: 'Endpoint ID' },
    ],
    responses: [{ status: 200, description: 'Rotated secret', schema: WebhookRotateSecretResultSchema }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/webhooks/{endpointId}/test',
    operationId: 'testWebhookEndpoint',
    summary: 'Send a test delivery to a webhook endpoint',
    tags: ['Webhooks'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'endpointId', schema: idParam, description: 'Endpoint ID' },
    ],
    responses: [{ status: 200, description: 'Test delivery result' }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/webhooks/{endpointId}/deliveries',
    operationId: 'listWebhookDeliveries',
    summary: 'List deliveries for a webhook endpoint',
    tags: ['Webhooks'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'endpointId', schema: idParam, description: 'Endpoint ID' },
    ],
    responses: [{ status: 200, description: 'List of deliveries', schema: WebhookDeliveryItemSchema }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/webhooks/{endpointId}/deliveries/{id}/retry',
    operationId: 'retryWebhookDelivery',
    summary: 'Retry a failed webhook delivery',
    tags: ['Webhooks'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'endpointId', schema: idParam, description: 'Endpoint ID' },
      { name: 'id', schema: idParam, description: 'Delivery ID' },
    ],
    responses: [{ status: 200, description: 'Retry result' }],
  },

  // ── Access Evaluation ────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/access/check',
    operationId: 'checkAccess',
    summary: 'Evaluate access for a subject',
    description: 'Checks whether a subject has permission to perform an action on a resource.',
    tags: ['Access Evaluation'],
    requestBody: { schema: AccessCheckInputSchema },
    responses: [{ status: 200, description: 'Access evaluation result', schema: AccessCheckResultSchema }],
  },
  {
    method: 'post',
    path: '/v1/access/check-self',
    operationId: 'checkAccessSelf',
    summary: 'Evaluate access for the authenticated API key',
    description: 'Checks whether the authenticated API key has permission to perform an action on a resource within the given scope. The subject is the key itself; scopeId is required and must be within the key hierarchy.',
    tags: ['Access Evaluation'],
    requestBody: { schema: SelfAccessCheckInputSchema },
    responses: [{ status: 200, description: 'Access evaluation result', schema: SelfAccessCheckResultSchema }],
  },
  {
    method: 'post',
    path: '/v1/access/check-bulk',
    operationId: 'checkAccessBulk',
    summary: 'Evaluate multiple access checks',
    tags: ['Access Evaluation'],
    responses: [{ status: 200, description: 'Bulk access evaluation results', schema: AccessCheckResultSchema }],
  },
  {
    method: 'post',
    path: '/v1/access/list-permissions',
    operationId: 'listPermissionsForSubject',
    summary: 'List permissions available to a subject',
    tags: ['Access Evaluation'],
    requestBody: { schema: ListPermissionsInputSchema },
    responses: [{ status: 200, description: 'List of resolved permissions', schema: ListPermissionsResultSchema }],
  },
  {
    method: 'post',
    path: '/v1/access/list-roles',
    operationId: 'listRolesForSubject',
    summary: 'List roles assigned to a subject',
    tags: ['Access Evaluation'],
    requestBody: { schema: ListRolesInputSchema },
    responses: [{ status: 200, description: 'List of assigned roles', schema: ListRolesResultSchema }],
  },
  {
    method: 'post',
    path: '/v1/access/simulate',
    operationId: 'simulateAccess',
    summary: 'Simulate access with hypothetical permissions and roles',
    tags: ['Access Evaluation'],
    requestBody: { schema: SimulateAccessInputSchema },
    responses: [{ status: 200, description: 'Simulation results', schema: SimulateAccessResultSchema }],
  },

  // ── Audit ────────────────────────────────────────────────────────────────────
  {
    method: 'get',
    path: '/v1/audit/events',
    operationId: 'listAuditEvents',
    summary: 'List audit events',
    tags: ['Audit'],
    queryParams: [
      { name: 'limit', schema: z.number().optional(), description: 'Maximum items per page' },
      { name: 'nextToken', schema: z.string().optional(), description: 'Pagination cursor' },
    ],
    responses: [{ status: 200, description: 'Paginated list of audit events', schema: AuditLogItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/audit/export',
    operationId: 'exportAuditLog',
    summary: 'Export audit log',
    tags: ['Audit'],
    responses: [{ status: 200, description: 'Audit log export' }],
  },
  {
    method: 'get',
    path: '/v1/audit/verify',
    operationId: 'verifyAuditLog',
    summary: 'Verify audit log integrity',
    tags: ['Audit'],
    responses: [{ status: 200, description: 'Audit log verification result', schema: AuditVerifyResultSchema }],
  },

  // ── Billing ──────────────────────────────────────────────────────────────────
  {
    method: 'get',
    path: '/v1/admin/billing/subscription',
    operationId: 'getSubscription',
    summary: 'Get current subscription',
    tags: ['Billing'],
    responses: [{ status: 200, description: 'Subscription details', schema: SubscriptionSummarySchema }],
  },
  {
    method: 'patch',
    path: '/v1/admin/billing/subscription',
    operationId: 'updateSubscription',
    summary: 'Update subscription',
    tags: ['Billing'],
    requestBody: { schema: UpdateSubscriptionInputSchema },
    responses: [{ status: 200, description: 'Updated subscription', schema: SubscriptionSummarySchema }],
  },
  {
    method: 'post',
    path: '/v1/admin/billing/checkout',
    operationId: 'createCheckoutSession',
    summary: 'Create a Stripe checkout session',
    tags: ['Billing'],
    requestBody: { schema: CreateCheckoutSessionInputSchema },
    responses: [{ status: 200, description: 'Checkout session URL', schema: CreateCheckoutSessionResultSchema }],
  },
  {
    method: 'post',
    path: '/v1/admin/billing/portal',
    operationId: 'createCustomerPortalSession',
    summary: 'Create a Stripe customer portal session',
    tags: ['Billing'],
    responses: [{ status: 200, description: 'Customer portal URL', schema: CreateCustomerPortalSessionResultSchema }],
  },
  {
    method: 'get',
    path: '/v1/admin/billing/overage-status',
    operationId: 'getOverageStatus',
    summary: 'Get overage status',
    tags: ['Billing'],
    responses: [{ status: 200, description: 'Overage status', schema: OverageStatusSchema }],
  },
  {
    method: 'post',
    path: '/v1/admin/billing/grant-overage-consent',
    operationId: 'grantOverageConsent',
    summary: 'Grant consent for overage charges',
    tags: ['Billing'],
    requestBody: { schema: GrantOverageConsentInputSchema },
    responses: [{ status: 200, description: 'Overage consent granted', schema: GrantOverageConsentResultSchema }],
  },

  // ── Dashboard ────────────────────────────────────────────────────────────────
  {
    method: 'get',
    path: '/v1/admin/scope/{scopeId}/stats',
    operationId: 'getDashboardStats',
    summary: 'Get dashboard statistics for a scope',
    tags: ['Dashboard'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'Dashboard statistics', schema: DashboardStatsSchema }],
  },
  {
    method: 'get',
    path: '/v1/admin/scope/{scopeId}/workspace-usage',
    operationId: 'getWorkspaceUsage',
    summary: 'Get workspace usage statistics',
    tags: ['Dashboard'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'Workspace usage data', schema: WorkspaceUsageSchema }],
  },
  {
    method: 'post',
    path: '/v1/admin/scope/{scopeId}/anomaly/{anomalySk}/acknowledge',
    operationId: 'acknowledgeAnomaly',
    summary: 'Acknowledge an anomaly',
    tags: ['Dashboard'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'anomalySk', schema: idParam, description: 'Anomaly sort key' },
    ],
    responses: [{ status: 200, description: 'Anomaly acknowledged', schema: AnomalyResultSchema }],
  },

  // ── SoD Constraints ──────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/sod-constraint',
    operationId: 'createSodConstraint',
    summary: 'Create a separation-of-duties constraint',
    tags: ['SoD Constraints'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    requestBody: { schema: CreateSodConstraintInputSchema },
    responses: [{ status: 201, description: 'SoD constraint created', schema: SodConstraintItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/sod-constraint',
    operationId: 'listSodConstraints',
    summary: 'List SoD constraints in a scope',
    tags: ['SoD Constraints'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'List of SoD constraints', schema: SodConstraintItemSchema }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}/sod-constraint/{id}',
    operationId: 'deleteSodConstraint',
    summary: 'Delete a SoD constraint',
    tags: ['SoD Constraints'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Constraint ID' },
    ],
    responses: [{ status: 200, description: 'SoD constraint deleted' }],
  },

  // ── Session Tokens ───────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/session-token/mint',
    operationId: 'mintSessionToken',
    summary: 'Mint a session token for MCP use',
    description: 'Creates a short-lived JWT with embedded permission IDs for MCP agent authorization.',
    tags: ['Session Tokens'],
    requestBody: { schema: MintSessionTokenInputSchema },
    responses: [{ status: 200, description: 'Minted session token', schema: MintSessionTokenResultSchema }],
  },
  {
    method: 'delete',
    path: '/v1/session-token/{jti}',
    operationId: 'revokeSessionToken',
    summary: 'Revoke a session token',
    tags: ['Session Tokens'],
    pathParams: [{ name: 'jti', schema: idParam, description: 'JWT ID (jti claim)' }],
    responses: [{ status: 200, description: 'Session token revoked' }],
  },

  // ── SSO ──────────────────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/admin/org/{orgId}/sso/configs',
    operationId: 'createSsoConfig',
    summary: 'Create an SSO configuration',
    tags: ['SSO'],
    pathParams: [{ name: 'orgId', schema: orgIdParam }],
    requestBody: { schema: CreateSsoConfigInputSchema },
    responses: [{ status: 201, description: 'SSO configuration created', schema: SsoConfigItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/admin/org/{orgId}/sso/configs',
    operationId: 'listSsoConfigs',
    summary: 'List SSO configurations',
    tags: ['SSO'],
    pathParams: [{ name: 'orgId', schema: orgIdParam }],
    responses: [{ status: 200, description: 'List of SSO configurations', schema: SsoConfigItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/admin/org/{orgId}/sso/configs/{idpId}',
    operationId: 'getSsoConfig',
    summary: 'Get an SSO configuration',
    tags: ['SSO'],
    pathParams: [
      { name: 'orgId', schema: orgIdParam },
      { name: 'idpId', schema: idParam, description: 'Identity provider ID' },
    ],
    responses: [{ status: 200, description: 'SSO configuration details', schema: SsoConfigItemSchema }],
  },
  {
    method: 'delete',
    path: '/v1/admin/org/{orgId}/sso/configs/{idpId}',
    operationId: 'deleteSsoConfig',
    summary: 'Delete an SSO configuration',
    tags: ['SSO'],
    pathParams: [
      { name: 'orgId', schema: orgIdParam },
      { name: 'idpId', schema: idParam, description: 'Identity provider ID' },
    ],
    responses: [{ status: 200, description: 'SSO configuration deleted' }],
  },
  {
    method: 'patch',
    path: '/v1/admin/org/{orgId}/sso/configs/{idpId}',
    operationId: 'updateSsoConfig',
    summary: 'Update an SSO configuration',
    tags: ['SSO'],
    pathParams: [
      { name: 'orgId', schema: orgIdParam },
      { name: 'idpId', schema: idParam, description: 'Identity provider ID' },
    ],
    requestBody: { schema: UpdateSsoConfigInputSchema },
    responses: [{ status: 200, description: 'Updated SSO configuration', schema: SsoConfigItemSchema }],
  },
  {
    method: 'post',
    path: '/v1/admin/org/{orgId}/sso/configs/{idpId}/test',
    operationId: 'testSsoConnection',
    summary: 'Test an SSO connection',
    tags: ['SSO'],
    pathParams: [
      { name: 'orgId', schema: orgIdParam },
      { name: 'idpId', schema: idParam, description: 'Identity provider ID' },
    ],
    responses: [{ status: 200, description: 'Connection test result', schema: SsoTestResultSchema }],
  },
  {
    method: 'post',
    path: '/v1/admin/org/{orgId}/sso/scim-token',
    operationId: 'rotateScimToken',
    summary: 'Rotate SCIM bearer token',
    description: 'Generates a new SCIM v2 bearer token. The raw token is returned ONCE.',
    tags: ['SSO'],
    pathParams: [{ name: 'orgId', schema: orgIdParam }],
    responses: [
      { status: 200, description: 'Rotated SCIM token (includes raw token)', schema: RotateScimTokenResultSchema },
    ],
  },

  // ── Team Members ─────────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/team-members',
    operationId: 'addTeamMember',
    summary: 'Add a team member to a scope',
    tags: ['Team Members'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    requestBody: { schema: AddTeamMemberInputSchema },
    responses: [{ status: 201, description: 'Team member added', schema: TeamMemberItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/team-members',
    operationId: 'listTeamMembers',
    summary: 'List team members in a scope',
    tags: ['Team Members'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'List of team members', schema: TeamMemberItemSchema }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}/team-members/{subjectId}',
    operationId: 'removeTeamMember',
    summary: 'Remove a team member from a scope',
    tags: ['Team Members'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'subjectId', schema: idParam, description: 'Subject ID' },
    ],
    responses: [{ status: 200, description: 'Team member removed' }],
  },

  // ── Organization ─────────────────────────────────────────────────────────────
  {
    method: 'get',
    path: '/v1/admin/organization',
    operationId: 'getOrganization',
    summary: 'Get organization details',
    tags: ['Organization'],
    responses: [{ status: 200, description: 'Organization details', schema: OrganizationItemSchema }],
  },
  {
    method: 'patch',
    path: '/v1/admin/organization',
    operationId: 'updateOrganization',
    summary: 'Update organization details',
    tags: ['Organization'],
    requestBody: { schema: UpdateOrganizationInputSchema },
    responses: [{ status: 200, description: 'Updated organization', schema: OrganizationItemSchema }],
  },
  {
    method: 'delete',
    path: '/v1/admin/organization',
    operationId: 'deleteOrganization',
    summary: 'Delete an organization',
    tags: ['Organization'],
    responses: [{ status: 200, description: 'Organization deleted' }],
  },
  {
    method: 'get',
    path: '/v1/admin/org/{orgId}/ip-allowlist',
    operationId: 'getIpAllowlist',
    summary: 'Get IP allowlist',
    tags: ['Organization'],
    pathParams: [{ name: 'orgId', schema: orgIdParam }],
    responses: [{ status: 200, description: 'IP allowlist', schema: IpAllowlistResultSchema }],
  },
  {
    method: 'put',
    path: '/v1/admin/org/{orgId}/ip-allowlist',
    operationId: 'updateIpAllowlist',
    summary: 'Update IP allowlist',
    tags: ['Organization'],
    pathParams: [{ name: 'orgId', schema: orgIdParam }],
    requestBody: { schema: UpdateIpAllowlistInputSchema },
    responses: [{ status: 200, description: 'Updated IP allowlist', schema: IpAllowlistResultSchema }],
  },

  // ── Approval Requests ────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/approval-request',
    operationId: 'createApprovalRequest',
    summary: 'Create an approval request',
    tags: ['Approval Requests'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 201, description: 'Approval request created' }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/approval-request',
    operationId: 'listApprovalRequests',
    summary: 'List approval requests in a scope',
    tags: ['Approval Requests'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'List of approval requests' }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/approval-request/{id}',
    operationId: 'getApprovalRequest',
    summary: 'Get an approval request',
    tags: ['Approval Requests'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Approval request ID' },
    ],
    responses: [{ status: 200, description: 'Approval request details' }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/approval-request/{id}/approve',
    operationId: 'approveRequest',
    summary: 'Approve an approval request',
    tags: ['Approval Requests'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Approval request ID' },
    ],
    responses: [{ status: 200, description: 'Request approved' }],
  },
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/approval-request/{id}/deny',
    operationId: 'denyRequest',
    summary: 'Deny an approval request',
    tags: ['Approval Requests'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'Approval request ID' },
    ],
    responses: [{ status: 200, description: 'Request denied' }],
  },

  // ── Session Tokens (intent-bound) ──────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/session-token/intent-mint',
    operationId: 'mintIntentSessionToken',
    summary: 'Mint an intent-bound session token',
    description:
      'Mints a short-lived intent-bound session token. The requested intent (integration + tools [+ instances]) must be fully within the issuer RBAC (fail-closed); the tamper-evident intentHash is bound into the signed token.',
    tags: ['Session Tokens'],
    requestBody: { schema: MintIntentSessionTokenInputSchema },
    responses: [
      { status: 201, description: 'Intent-bound session token minted', schema: MintIntentSessionTokenResultSchema },
    ],
  },
  {
    method: 'post',
    path: '/v1/session-token/verify-intent-call',
    operationId: 'verifyIntentCall',
    summary: 'Verify an intent-bound tool call',
    description:
      'Per-call enforcement: verifies an agent session token against its bound intent and live RBAC for a specific tool [+ instance]. Returns an allow/deny decision.',
    tags: ['Session Tokens'],
    requestBody: { schema: VerifyIntentCallInputSchema },
    responses: [{ status: 200, description: 'Verification decision', schema: VerifyIntentCallResultSchema }],
  },

  // ── MCP Servers ───────────────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/scope/{scopeId}/mcp-server',
    operationId: 'createMcpServer',
    summary: 'Create an MCP server',
    tags: ['MCP Servers'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    requestBody: { schema: CreateMcpServerInputSchema },
    responses: [{ status: 201, description: 'MCP server created', schema: McpServerItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/mcp-server',
    operationId: 'listMcpServers',
    summary: 'List MCP servers in a scope',
    tags: ['MCP Servers'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    responses: [{ status: 200, description: 'List of MCP servers', schema: McpServerItemSchema }],
  },
  {
    method: 'get',
    path: '/v1/scope/{scopeId}/mcp-server/{id}',
    operationId: 'getMcpServer',
    summary: 'Get an MCP server by ID',
    tags: ['MCP Servers'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'MCP server ID' },
    ],
    responses: [{ status: 200, description: 'MCP server details', schema: McpServerItemSchema }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}/mcp-server/{id}',
    operationId: 'deleteMcpServer',
    summary: 'Delete an MCP server',
    tags: ['MCP Servers'],
    pathParams: [
      { name: 'scopeId', schema: scopeIdParam },
      { name: 'id', schema: idParam, description: 'MCP server ID' },
    ],
    responses: [{ status: 200, description: 'MCP server deleted' }],
  },

  // ── MCP Consent & Grants ────────────────────────────────────────────────
  {
    method: 'post',
    path: '/v1/mcp/consent/grant',
    operationId: 'createConsentGrant',
    summary: 'Issue an MCP consent grant (bearer token)',
    tags: ['MCP Consent'],
    requestBody: { required: true, schema: McpConsentGrantBodySchema },
    responses: [
      { status: 200, description: 'Grant issued', schema: McpConsentGrantResultSchema },
    ],
  },
  {
    method: 'get',
    path: '/v1/mcp/consent/servers',
    operationId: 'listConsentServers',
    summary: 'List MCP servers available for consent',
    tags: ['MCP Consent'],
    responses: [
      { status: 200, description: 'List of available servers', schema: z.array(McpConsentServerSchema) },
    ],
  },
  {
    method: 'get',
    path: '/v1/mcp/consent/context',
    operationId: 'getConsentContext',
    summary: 'Get consent context for a given request',
    tags: ['MCP Consent'],
    queryParams: [{ name: 'id', schema: z.string(), description: 'Auth request ID' }],
    responses: [{ status: 200, description: 'Consent context' }],
  },
  {
    method: 'post',
    path: '/v1/mcp/consent/deny',
    operationId: 'denyConsent',
    summary: 'Deny an MCP consent request',
    tags: ['MCP Consent'],
    responses: [{ status: 200, description: 'Consent denied' }],
  },
  {
    method: 'post',
    path: '/v1/mcp/consent/request',
    operationId: 'requestConsent',
    summary: 'Request MCP consent from a user',
    tags: ['MCP Consent'],
    responses: [{ status: 200, description: 'Consent requested' }],
  },
  {
    method: 'get',
    path: '/v1/mcp/grants',
    operationId: 'listGrants',
    summary: 'List active MCP consent grants',
    tags: ['MCP Grants'],
    responses: [
      { status: 200, description: 'List of grants', schema: z.array(McpGrantSummarySchema) },
    ],
  },
  {
    method: 'post',
    path: '/v1/mcp/grants/{grantId}/revoke',
    operationId: 'revokeGrant',
    summary: 'Revoke an MCP consent grant',
    tags: ['MCP Grants'],
    pathParams: [{ name: 'grantId', schema: z.string(), description: 'Grant ID' }],
    responses: [{ status: 200, description: 'Grant revoked' }],
  },

  // ── MCP Approvals (HITL) ────────────────────────────────────────────────
  {
    method: 'get',
    path: '/v1/mcp/approvals',
    operationId: 'listPendingApprovals',
    summary: 'List pending HITL approvals',
    tags: ['MCP Approvals'],
    responses: [
      { status: 200, description: 'List of pending approvals', schema: z.object({ approvals: z.array(McpApprovalSummarySchema) }) },
    ],
  },
  {
    method: 'get',
    path: '/v1/mcp/approvals/history',
    operationId: 'listApprovalHistory',
    summary: 'List decided HITL approvals (history)',
    tags: ['MCP Approvals'],
    responses: [
      { status: 200, description: 'Approval history', schema: z.object({ approvals: z.array(McpApprovalHistoryItemSchema) }) },
    ],
  },
  {
    method: 'post',
    path: '/v1/mcp/approvals/{id}/approve',
    operationId: 'approveRequest',
    summary: 'Approve a pending HITL request',
    tags: ['MCP Approvals'],
    pathParams: [{ name: 'id', schema: z.string(), description: 'Approval ID' }],
    responses: [{ status: 200, description: 'Approved' }],
  },
  {
    method: 'post',
    path: '/v1/mcp/approvals/{id}/deny',
    operationId: 'denyRequest',
    summary: 'Deny a pending HITL request with optional reason',
    tags: ['MCP Approvals'],
    pathParams: [{ name: 'id', schema: z.string(), description: 'Approval ID' }],
    requestBody: { required: false, schema: z.object({ reason: z.string().max(500).optional() }).optional() },
    responses: [{ status: 200, description: 'Denied' }],
  },

  // ── MCP Push Notifications ──────────────────────────────────────────────
  {
    method: 'get',
    path: '/v1/mcp/push/public-key',
    operationId: 'getPushPublicKey',
    summary: 'Get the VAPID public key for Web Push setup',
    tags: ['MCP Push'],
    responses: [{ status: 200, description: 'VAPID public key' }],
  },
  {
    method: 'post',
    path: '/v1/mcp/push/subscribe',
    operationId: 'subscribePush',
    summary: 'Subscribe to Web Push notifications for HITL approvals',
    tags: ['MCP Push'],
    requestBody: {
      required: true,
      schema: z.object({
        endpoint: z.string().url(),
        keys: z.object({ p256dh: z.string(), auth: z.string() }),
      }),
    },
    responses: [{ status: 200, description: 'Subscribed' }],
  },
  {
    method: 'post',
    path: '/v1/mcp/push/unsubscribe',
    operationId: 'unsubscribePush',
    summary: 'Unsubscribe from Web Push notifications',
    tags: ['MCP Push'],
    requestBody: { required: true, schema: z.object({ endpoint: z.string().url() }) },
    responses: [{ status: 200, description: 'Unsubscribed' }],
  },

  // ── MCP Assignments ─────────────────────────────────────────────────────
  {
    method: 'get',
    path: '/v1/mcp/assignments',
    operationId: 'listAssignments',
    summary: 'List MCP server assignments for the caller',
    tags: ['MCP Assignments'],
    responses: [
      { status: 200, description: 'List of assignments', schema: z.array(McpUserAssignmentSchema) },
    ],
  },
  {
    method: 'post',
    path: '/v1/mcp/assignments',
    operationId: 'setAssignment',
    summary: 'Set an MCP server assignment for a user',
    tags: ['MCP Assignments'],
    requestBody: {
      required: true,
      schema: z.object({
        subjectId: z.string(),
        serverKey: z.string(),
        maxTier: McpTrustTierSchema,
        resourceConstraints: z.record(z.string(), z.array(z.string())).optional(),
      }),
    },
    responses: [{ status: 200, description: 'Assignment set' }],
  },
  {
    method: 'delete',
    path: '/v1/scope/{scopeId}/mcp/assignment',
    operationId: 'deleteAssignment',
    summary: 'Delete an MCP server assignment',
    tags: ['MCP Assignments'],
    pathParams: [{ name: 'scopeId', schema: scopeIdParam }],
    queryParams: [
      { name: 'subjectId', schema: z.string(), description: 'Subject ID' },
      { name: 'serverKey', schema: z.string(), description: 'Server key' },
    ],
    responses: [{ status: 200, description: 'Assignment deleted' }],
  },

  // ── MCP Velocity Policies ──────────────────────────────────────────────
  {
    method: 'get',
    path: '/v1/mcp/velocity-config',
    operationId: 'getVelocityConfig',
    summary: 'Get MCP velocity policy configuration',
    tags: ['MCP Velocity'],
    responses: [
      { status: 200, description: 'Velocity config', schema: McpVelocityConfigSchema },
    ],
  },
  {
    method: 'post',
    path: '/v1/mcp/velocity-config/update',
    operationId: 'updateVelocityConfig',
    summary: 'Update MCP velocity policy configuration',
    tags: ['MCP Velocity'],
    requestBody: {
      required: true,
      schema: z.object({
        enabled: z.boolean(),
        perGrantPerMinute: z.number().min(1).max(10000),
        perServerPerMinute: z.number().min(1).max(10000),
        perToolPerMinute: z.number().min(1).max(10000),
      }),
    },
    responses: [{ status: 200, description: 'Velocity config updated' }],
  },

  // ── MCP Tools List (protected) ──────────────────────────────────────────
  {
    method: 'get',
    path: '/v1/mcp/tools',
    operationId: 'listMcpTools',
    summary: 'List available MCP tools for a server',
    tags: ['MCP Tools'],
    queryParams: [
      { name: 'serverKey', schema: z.string(), description: 'Server key' },
    ],
    responses: [{ status: 200, description: 'List of tools' }],
  },

  // ── MCP OAuth Callback ──────────────────────────────────────────────────
  {
    method: 'get',
    path: '/v1/mcp/oauth/callback',
    operationId: 'mcpOAuthCallback',
    summary: 'MCP OAuth callback endpoint',
    tags: ['MCP OAuth'],
    queryParams: [
      { name: 'code', schema: z.string(), required: true },
      { name: 'state', schema: z.string(), required: true },
    ],
    responses: [{ status: 302, description: 'Redirect to dashboard' }],
  },
]
