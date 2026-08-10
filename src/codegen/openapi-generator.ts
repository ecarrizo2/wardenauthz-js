import { TypeIR, FieldIR } from './ir'
import { RouteDefinition, routeDefinitions } from './route-definitions'
import * as yaml from 'js-yaml'
import { z } from 'zod'

interface OpenApiSchema {
  type?: string
  properties?: Record<string, OpenApiSchema>
  required?: string[]
  items?: OpenApiSchema
  oneOf?: OpenApiSchema[]
  enum?: string[]
  nullable?: boolean
  description?: string
  additionalProperties?: OpenApiSchema | boolean
  $ref?: string
  format?: string
  example?: unknown
}

interface OpenApiParameter {
  name: string
  in: 'path' | 'query' | 'header'
  required: boolean
  description?: string
  schema: OpenApiSchema
}

interface OpenApiResponse {
  description: string
  content?: Record<string, { schema: OpenApiSchema }>
}

interface OpenApiOperation {
  operationId: string
  summary: string
  description?: string
  tags: string[]
  parameters?: OpenApiParameter[]
  requestBody?: {
    description?: string
    required?: boolean
    content: Record<string, { schema: OpenApiSchema }>
  }
  responses: Record<string, OpenApiResponse>
}

function fieldToOpenApiSchema(field: FieldIR): OpenApiSchema {
  const schema: OpenApiSchema = {}

  if (field.comment) {
    schema.description = field.comment
  }

  if (field.isArray) {
    schema.type = 'array'
    schema.items = goTypeToOpenApiType(field.arrayElementType || 'string')
  } else if (field.isMap) {
    schema.type = 'object'
    schema.additionalProperties = goTypeToOpenApiType(field.mapValueType || 'string')
  } else if (field.refTypeName) {
    return { $ref: `#/components/schemas/${field.refTypeName}` }
  } else {
    const resolved = goTypeToOpenApiType(field.goType)
    if (typeof resolved === 'string') {
      schema.type = resolved
    } else {
      Object.assign(schema, resolved)
    }
  }

  if (field.isNullable) {
    schema.nullable = true
  }

  return schema
}

function goTypeToOpenApiType(goType: string): OpenApiSchema {
  const clean = goType.replace(/\*/g, '').replace('[]', '')
  switch (clean) {
    case 'string':
      return { type: 'string' }
    case 'int':
      return { type: 'integer' }
    case 'float64':
      return { type: 'number' }
    case 'bool':
      return { type: 'boolean' }
    case 'interface{}':
      return {}
    default:
      if (clean.startsWith('map[')) {
        return { type: 'object' }
      }
      return { $ref: `#/components/schemas/${clean}` }
  }
}

function zodToOpenApiSchema(schema: z.ZodType, depth = 0): OpenApiSchema {
  if (depth > 10) return { type: 'object' }
  if (!schema?._def) return { type: 'string' }
  const def = schema._def as unknown as Record<string, unknown>
  const type = def.type as string ?? def.typeName as string

  switch (type) {
    case 'string':
    case 'ZodString':
      return { type: 'string' }
    case 'number':
    case 'ZodNumber':
      return { type: 'number' }
    case 'boolean':
    case 'ZodBoolean':
      return { type: 'boolean' }
    case 'enum':
    case 'ZodEnum': {
      const entries = (def.values ?? def.entries) as string[] | Record<string, string>
      const values = Array.isArray(entries) ? entries : Object.values(entries)
      return { type: 'string', enum: [...values] }
    }
    case 'array':
    case 'ZodArray': {
      const elementType = (def.type ?? def.element) as z.ZodType
      const inner = zodToOpenApiSchema(elementType, depth + 1)
      return { type: 'array', items: inner }
    }
    case 'object':
    case 'ZodObject': {
      const shapeObj = typeof def.shape === 'function'
        ? (def as unknown as { shape: () => Record<string, z.ZodType> }).shape()
        : def.shape as Record<string, z.ZodType>
      const properties: Record<string, OpenApiSchema> = {}
      const required: string[] = []
      for (const [key, value] of Object.entries(shapeObj)) {
        properties[key] = zodToOpenApiSchema(value, depth + 1)
        const innerDef = (value as z.ZodType)._def as unknown as Record<string, unknown>
        const innerType = innerDef.type as string ?? innerDef.typeName as string
        if (innerType !== 'optional' && innerType !== 'ZodOptional') {
          required.push(key)
        }
      }
      const result: OpenApiSchema = { type: 'object', properties }
      if (required.length > 0) result.required = required
      return result
    }
    case 'optional':
    case 'ZodOptional': {
      const inner = zodToOpenApiSchema(def.innerType as z.ZodType, depth + 1)
      return inner
    }
    case 'nullable':
    case 'ZodNullable': {
      const inner = zodToOpenApiSchema(def.innerType as z.ZodType, depth + 1)
      return { ...inner, nullable: true }
    }
    case 'literal':
    case 'ZodLiteral': {
      const value = def.value as string
      return { type: 'string', enum: [value] }
    }
    case 'lazy':
    case 'ZodLazy': {
      const getter = def.getter as () => z.ZodType
      return zodToOpenApiSchema(getter(), depth + 1)
    }
    case 'record':
    case 'ZodRecord': {
      const valueSchema = def.valueType as z.ZodType
      return { type: 'object', additionalProperties: zodToOpenApiSchema(valueSchema, depth + 1) }
    }
    case 'union':
    case 'ZodUnion': {
      const options = def.options as z.ZodType[]
      return { oneOf: options.map(o => zodToOpenApiSchema(o, depth + 1)) }
    }
    default:
      return { type: 'string' }
  }
}

function zodExample(schema: z.ZodType, depth = 0): unknown {
  if (depth > 5) return null
  if (!schema?._def) return 'example'
  const def = schema._def as unknown as Record<string, unknown>
  const type = def.type as string ?? def.typeName as string

  switch (type) {
    case 'string': case 'ZodString': return 'string'
    case 'number': case 'ZodNumber': return 0
    case 'integer': return 0
    case 'boolean': case 'ZodBoolean': return true
    case 'enum': case 'ZodEnum': {
      const entries = (def.values ?? def.entries) as string[] | Record<string, string>
      const vals = Array.isArray(entries) ? entries : Object.values(entries)
      return vals[0]
    }
    case 'array': case 'ZodArray': {
      const element = (def.type ?? def.element) as z.ZodType
      return [zodExample(element, depth + 1)]
    }
    case 'object': case 'ZodObject': {
      const shape = typeof def.shape === 'function'
        ? (def as unknown as { shape: () => Record<string, z.ZodType> }).shape()
        : def.shape as Record<string, z.ZodType>
      const obj: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(shape)) {
        const innerDef = (value as z.ZodType)._def as unknown as Record<string, unknown>
        const innerType = innerDef.type as string ?? innerDef.typeName as string
        if (innerType !== 'optional' && innerType !== 'ZodOptional') {
          obj[key] = zodExample(value, depth + 1)
        }
      }
      return obj
    }
    case 'optional': case 'ZodOptional': return zodExample(def.innerType as z.ZodType, depth + 1)
    case 'lazy': case 'ZodLazy': return zodExample((def.getter as () => z.ZodType)(), depth + 1)
    default: return 'example'
  }
}

function generateParams(route: RouteDefinition): OpenApiParameter[] {
  const params: OpenApiParameter[] = []

  for (const p of route.pathParams || []) {
    params.push({
      name: p.name,
      in: 'path',
      required: true,
      description: p.description || p.schema.description,
      schema: zodToOpenApiSchema(p.schema),
    })
  }

  for (const q of route.queryParams || []) {
    params.push({
      name: q.name,
      in: 'query',
      required: q.required ?? false,
      description: q.description || q.schema.description,
      schema: zodToOpenApiSchema(q.schema),
    })
  }

  return params
}

function generatePaths(): Record<string, Record<string, OpenApiOperation>> {
  const paths: Record<string, Record<string, OpenApiOperation>> = {}

  const apiErrorRef = '#/components/schemas/ApiError'

  for (const route of routeDefinitions) {
    const pathKey = route.path.replace(/\{(\w+)\}/g, '{$1}')
    if (!paths[pathKey]) {
      paths[pathKey] = {}
    }

    const operation: OpenApiOperation = {
      operationId: route.operationId,
      summary: route.summary,
      tags: route.tags,
      responses: {},
    }

    if (route.description) {
      operation.description = route.description
    }

    const params = generateParams(route)
    if (params.length > 0) {
      operation.parameters = params
    }

    if (route.requestBody) {
      const bodySchema = zodToOpenApiSchema(route.requestBody.schema)
      bodySchema.example = zodExample(route.requestBody.schema)
      operation.requestBody = {
        required: route.requestBody.required ?? true,
        description: route.requestBody.description,
        content: {
          'application/json': {
            schema: bodySchema,
          },
        },
      }
    }

    const responses: Record<string, OpenApiResponse> = {}
    for (const r of route.responses) {
      const resp: OpenApiResponse = { description: r.description }
      if (r.schema) {
        const respSchema = zodToOpenApiSchema(r.schema)
        respSchema.example = zodExample(r.schema)
        resp.content = {
          'application/json': {
            schema: respSchema,
          },
        }
      }
      responses[String(r.status)] = resp
    }

    const defaultErrors: [string, string][] = [
      ['400', 'Validation error — malformed input or missing required field'],
      ['401', 'Unauthorized — missing or invalid credentials'],
      ['402', 'Payment required — billing tier upgrade needed'],
      ['403', 'Forbidden — insufficient permissions for this resource'],
      ['404', 'Not found — the requested resource does not exist'],
      ['409', 'Conflict — resource already exists or has conflicting state'],
      ['410', 'Gone — resource was permanently removed'],
      ['422', 'Unprocessable Entity — semantic validation failure'],
      ['429', 'Too many requests — rate limit exceeded'],
      ['500', 'Internal server error'],
    ]

    for (const [code, desc] of defaultErrors) {
      if (!responses[code]) {
        responses[code] = {
          description: desc,
          content: {
            'application/json': {
              schema: { $ref: apiErrorRef },
            },
          },
        }
      }
    }

    operation.responses = responses
    paths[pathKey][route.method] = operation
  }

  return paths
}

export function generateOpenApiSchemas(types: TypeIR[]): Record<string, OpenApiSchema> {
  const schemas: Record<string, OpenApiSchema> = {}

  for (const type of types) {
    if (type.kind !== 'struct') continue

    const schema: OpenApiSchema = {
      type: 'object',
      properties: {},
    }

    const required: string[] = []

    for (const field of type.fields) {
      schema.properties![field.name] = fieldToOpenApiSchema(field)
      if (!field.isOptional && !field.isNullable) {
        required.push(field.name)
      }
    }

    if (required.length > 0) {
      schema.required = required
    }

    if (type.comment) {
      schema.description = type.comment
    }

    schemas[type.goName] = schema
  }

  return schemas
}

export function generateOpenApiYaml(types: TypeIR[], title = 'API', version = '1.0.0'): string {
  const schemas = generateOpenApiSchemas(types)
  const paths = generatePaths()

  schemas['ApiError'] = {
    type: 'object',
    description: 'Standard API error response body',
    required: ['error', 'message', 'statusCode'],
    properties: {
      error: { type: 'string', description: 'Machine-readable error code (e.g. SCOPE_NOT_FOUND, PERMISSION_DENIED)' },
      message: { type: 'string', description: 'Human-readable error message for the developer' },
      statusCode: { type: 'integer', description: 'HTTP status code (mirrors response code)' },
      field: { type: 'string', description: 'Name of the invalid field (present only for 400/422 validation errors)', nullable: true },
    },
  }

  const doc = {
    openapi: '3.0.3',
    info: {
      title,
      version,
      'x-error-codes': [
        'ACCESS_POLICY_NOT_FOUND — The requested access policy does not exist',
        'ANOMALY_ALREADY_ACKNOWLEDGED — The anomaly has already been acknowledged',
        'ANOMALY_NOT_FOUND — The requested anomaly does not exist',
        'API_KEY_NOT_FOUND — The requested API key does not exist',
        'API_KEY_ROTATION_REF_CONSUMED — The rotation reference has already been used',
        'API_KEY_ROTATION_REF_STALE — The rotation reference has expired',
        'APPROVAL_REQUEST_NOT_FOUND — The approval request does not exist',
        'APPROVAL_REQUEST_NOT_PENDING — The approval request is no longer pending',
        'BILLING_CONFIGURATION_ERROR — The billing/Stripe configuration is invalid',
        'CIRCULAR_ROLE_HIERARCHY — Assigning this role to the parent would create a cycle',
        'DOMAIN_INVARIANT_VIOLATION — A core business constraint was violated',
        'DUPLICATE_ENTRY — A unique constraint would be violated',
        'EXTERNAL_SERVICE_UNAVAILABLE — An upstream dependency (Stripe/Cognito) is unavailable',
        'FORBIDDEN — The caller lacks permission to perform this action',
        'IDEMPOTENCY_KEY_EXPIRED — The provided idempotency key has expired',
        'INPUT_VALIDATION_ERROR — One or more fields are invalid (see field property)',
        'INSUFFICIENT_PERMISSIONS — The caller does not have the required system permission',
        'INVALID_BILLING_REDIRECT_URL — The Stripe checkout redirect URL is invalid',
        'INVALID_CIDR — The provided CIDR notation is invalid',
        'INVALID_DATE_RANGE — The date range (start/end) is invalid',
        'INVALID_PASSWORD — The password does not meet complexity requirements',
        'INVALID_RESOURCE_PATTERN — The resource permission pattern is invalid',
        'INVALID_SCIM_CURSOR — The SCIM pagination cursor is invalid',
        'MANIFEST_APPLY_IN_PROGRESS — A manifest apply is already running for this scope',
        'MANIFEST_IDEMPOTENCY_CONFLICT — A manifest with this idempotency key has different content',
        'MAX_ARRAY_SIZE_EXCEEDED — The value exceeds the maximum allowed array size',
        'MCP_OAUTH_DISCOVERY_ERROR — OAuth discovery (well-known endpoints) failed',
        'MCP_SERVER_ID_TAKEN — An MCP server with this key already exists',
        'MCP_SERVER_NOT_FOUND — The requested MCP server does not exist',
        'MCP_SESSION_NOT_FOUND — The MCP session is invalid or expired',
        'MISSING_STRIPE_CUSTOMER — Billing action requires a Stripe customer (run setup first)',
        'OVERAGE_PAUSED — The account is paused due to usage exceeding tier limits',
        'PAYMENT_GATEWAY_ERROR — A Stripe API call returned an error',
        'PERMISSION_ID_TAKEN — A permission with this ID already exists',
        'PERMISSION_NOT_FOUND — The requested permission does not exist',
        'QUOTA_EXCEEDED — The account has exceeded a billing tier quota',
        'RATE_LIMIT_EXCEEDED — Too many requests — wait and retry',
        'RESOURCE_TYPE_ID_TAKEN — A resource type with this ID already exists',
        'RESOURCE_TYPE_NOT_FOUND — The requested resource type does not exist',
        'ROLE_ALREADY_EXISTS — A role with this ID already exists',
        'ROLE_CANNOT_MODIFY_INHERITED — Inherited roles cannot be modified directly',
        'ROLE_NOT_FOUND — The requested role does not exist',
        'SCOPE_CASCADE_DELETION — Deleting this scope would orphan child scopes',
        'SCOPE_CLONE_ERROR — Cloning the scope failed (check permissions)',
        'SCOPE_ID_TAKEN — A scope with this ID already exists',
        'SCOPE_MOVE_ERROR — Moving the scope failed (check parent/child constraints)',
        'SCOPE_NOT_FOUND — The requested scope does not exist',
        'SCIM_GROUP_ALREADY_EXISTS — A SCIM group with this externalId already exists',
        'SCIM_GROUP_NOT_FOUND — The requested SCIM group does not exist',
        'SCIM_TOKEN_NOT_FOUND — The SCIM bearer token is invalid or missing',
        'SCIM_USER_ALREADY_EXISTS — A SCIM user with this externalId already exists',
        'SCIM_USER_NOT_FOUND — The requested SCIM user does not exist',
        'SELF_APPROVAL_NOT_ALLOWED — Self-approval is not permitted for this action',
        'SOD_CONSTRAINT_ALREADY_EXISTS — A SoD constraint with this ID already exists',
        'SOD_CONSTRAINT_NOT_FOUND — The requested SoD constraint does not exist',
        'SOD_CONSTRAINT_VIOLATION — The action would violate a separation-of-duties constraint',
        'SSO_CONFIG_NOT_FOUND — No SSO configuration found for this provider',
        'SSO_PROVIDER_ERROR — The SSO identity provider returned an error',
        'STRIPE_WEBHOOK_VALIDATION — The Stripe webhook signature is invalid',
        'TEAM_MEMBER_ALREADY_EXISTS — A team member with these details already exists',
        'TEAM_MEMBER_LIMIT_EXCEEDED — The team member seat limit has been reached',
        'TEAM_MEMBER_NOT_FOUND — The requested team member does not exist',
        'TUPLE_LIMIT_EXCEEDED — The relationship tuple limit per scope has been reached',
        'TUPLE_NOT_FOUND — The requested relationship tuple does not exist',
        'UNAUTHORIZED — The caller is not authenticated (missing or expired token)',
        'UPGRADE_REQUIRED — This feature requires a higher billing plan',
        'USER_ALREADY_EXISTS — A user with this email already exists',
        'USER_IDENTITY_ALREADY_EXISTS — This identity (email/provider) is already linked',
        'WEBHOOK_DELIVERY_NOT_FOUND — The requested webhook delivery record does not exist',
        'WEBHOOK_ENDPOINT_ALREADY_EXISTS — A webhook endpoint with this URL already exists',
        'WEBHOOK_ENDPOINT_INACTIVE — The webhook endpoint is currently inactive',
        'WEBHOOK_ENDPOINT_NOT_FOUND — The requested webhook endpoint does not exist',
        'WILDCARD_PERMISSION_FORBIDDEN — Wildcard permissions are not allowed at this tier',
      ],
    },
    paths,
    components: {
      schemas,
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for management and evaluation endpoints',
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
  }

  return yaml.dump(doc, { noRefs: true, lineWidth: 120 })
}
