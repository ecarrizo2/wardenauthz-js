import * as schemas from '../types/index'
import { z } from 'zod'
import { TypeIR } from './ir'
import { parseObjectSchema, parseEnumSchema } from './schema-parser'
import { generateGoCode } from './go-generator'
import { generateOpenApiYaml } from './openapi-generator'

function isZodType(s: unknown): s is z.ZodType {
  return s instanceof z.ZodType
}

function getDef(schema: z.ZodType): string {
  return (schema._def as unknown as Record<string, unknown>).type as string
}

function isZodObject(s: z.ZodType): s is z.ZodObject<any> {
  return getDef(s) === 'object'
}

function isZodEnum(s: z.ZodType): s is z.ZodEnum<any> {
  return getDef(s) === 'enum'
}

const ENTITY_NAMES = [
  'ScopeItem',
  'CreateScopeInput',
  'UpdateScopeInput',
  'PermissionItem',
  'CreatePermissionInput',
  'UpdatePermissionInput',
  'RoleItem',
  'CreateRoleInput',
  'UpdateRoleInput',
  'AccessPolicyItem',
  'CreateAccessPolicyInput',
  'UpdateAccessPolicyInput',
  'ApiKeyItem',
  'ApiKeyCreatedItem',
  'CreateApiKeyInput',
  'ApiKeyRotationResult',
  'ApiKeyRevealRotationResult',
  'RotateApiKeyInput',
  'UpdateApiKeyAutoRotationInput',
  'WebhookEndpointItem',
  'WebhookEndpointCreatedItem',
  'CreateWebhookEndpointInput',
  'UpdateWebhookEndpointInput',
  'WebhookRotateSecretResult',
  'WebhookDeliveryItem',
  'AccessCheckInput',
  'AccessCheckReasoningEntry',
  'AccessCheckReasoning',
  'AccessCheckResult',
  'ListPermissionsInput',
  'ListPermissionsResult',
  'ListRolesInput',
  'ListRolesResult',
  'SimulateAccessPermissionInput',
  'SimulateAccessRoleInput',
  'SimulateAccessCheckInput',
  'SimulateAccessInput',
  'SimulateAccessResultEntry',
  'SimulateAccessResult',
  'AuditLogItem',
  'AuditExportInput',
  'AuditVerifyInput',
  'AuditVerifyResult',
  'ResourceTypeItem',
  'CreateResourceTypeInput',
  'SubscriptionSummary',
  'UpdateSubscriptionInput',
  'CreateCheckoutSessionInput',
  'CreateCheckoutSessionResult',
  'CreateCustomerPortalSessionResult',
  'OverageStatus',
  'GrantOverageConsentInput',
  'GrantOverageConsentResult',
  'SodConstraintItem',
  'CreateSodConstraintInput',
  'WardenAuthClientConfig',
  'AuthorizationManifestPermissionInput',
  'AuthorizationManifestRoleInput',
  'AuthorizationManifestAccessPolicyInput',
  'AuthorizationManifestSpecInput',
  'AuthorizationManifestApplyInput',
  'ApplyScopeManifestInput',
  'ApplyScopeManifestResultSummary',
  'ApplyScopeManifestOperationResult',
  'ApplyScopeManifestResult',
  'TeamMemberItem',
  'AddTeamMemberInput',
  'MintSessionTokenInput',
  'MintSessionTokenResult',
  'MintIntentSessionTokenInput',
  'MintIntentSessionTokenResult',
  'ApprovalItem',
  'AgentIntentInput',
  'IntegrationItem',
  'CreateIntegrationInput',
  'VerifyIntentCallInput',
  'VerifyIntentCallResult',
  'AnomalyResult',
  'DashboardStats',
  'IpAllowlistResult',
  'UpdateIpAllowlistInput',
  'OrganizationItem',
  'UpdateOrganizationInput',
  'SsoConfigItem',
  'CreateSsoConfigInput',
  'UpdateSsoConfigInput',
  'SsoTestResult',
  'RotateScimTokenResult',
  'ScimConfig',
  'WorkspaceUsageItem',
  'WorkspaceUsage',
  'ImportResult',
]

interface SchemaEntry {
  name: string
  schema: z.ZodType
}

export function collectSchemas(): SchemaEntry[] {
  const entries: SchemaEntry[] = []

  for (const name of ENTITY_NAMES) {
    const schemaKey = `${name}Schema`
    const s = (schemas as Record<string, unknown>)[schemaKey]
    if (s && isZodType(s)) {
      entries.push({ name, schema: s })
    }
  }

  return entries
}

function buildSchemaMap(entries: SchemaEntry[]): Map<z.ZodType, string> {
  const map = new Map<z.ZodType, string>()
  for (const { name, schema } of entries) {
    map.set(schema, name)
  }
  return map
}

export function parseAll(entries: SchemaEntry[]): TypeIR[] {
  const types: TypeIR[] = []
  const schemaMap = buildSchemaMap(entries)

  for (const { name, schema } of entries) {
    if (isZodObject(schema)) {
      types.push(parseObjectSchema(name, schema, schemaMap))
    } else if (isZodEnum(schema)) {
      types.push(parseEnumSchema(name, schema))
    }
  }

  return types
}

export interface GenerateOptions {
  outputGo?: boolean
  outputOpenApi?: boolean
  openApiTitle?: string
  openApiVersion?: string
}

export interface GenerateResult {
  goCode?: string
  openApiYaml?: string
}

export function generate(options: GenerateOptions = {}): GenerateResult {
  const entries = collectSchemas()
  const types = parseAll(entries)
  const result: GenerateResult = {}

  if (options.outputGo !== false) {
    result.goCode = generateGoCode(types)
  }

  if (options.outputOpenApi !== false) {
    result.openApiYaml = generateOpenApiYaml(types, options.openApiTitle, options.openApiVersion)
  }

  return result
}
