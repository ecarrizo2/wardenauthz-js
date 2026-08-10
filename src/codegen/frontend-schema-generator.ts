import { z } from 'zod'
import * as schemas from '../types/index'
import { generateSchemaFile } from './zod-to-source'

function cloneWithMinLength(schema: z.ZodObject<any>, minLength = 1): z.ZodObject<any> {
  const shape = schema._def.shape as Record<string, z.ZodType>
  const newShape: Record<string, z.ZodType> = {}

  for (const [key, value] of Object.entries(shape)) {
    let modified = value

    if ((value as any)._def?.type === 'string' && !value.isOptional()) {
      modified = z.string().min(minLength)
    }

    if ((value as any)._def?.type === 'optional' && (value as any)._def?.innerType?._def?.type === 'string') {
      modified = z.string().min(minLength).optional()
    }

    newShape[key] = modified
  }

  return z.object(newShape)
}

function omitFields(schema: z.ZodObject<any>, fieldsToOmit: string[]): z.ZodObject<any> {
  const shape = schema._def.shape as Record<string, z.ZodType>
  const newShape: Record<string, z.ZodType> = {}

  for (const [key, value] of Object.entries(shape)) {
    if (fieldsToOmit.includes(key)) continue
    newShape[key] = value
  }

  return z.object(newShape)
}

const CONTEXT_FIELDS = ['id', 'scopeId', 'orgId', 'subjectId', 'createdAt', 'updatedAt', 'invitedBy']

interface FrontendSchemaSpec {
  outputName: string
  sourceSchemaName: string
  contextFields?: string[]
  fileName?: string
  docNote?: string
}

const SPECS: FrontendSchemaSpec[] = [
  {
    outputName: 'permissionCreateSchema',
    sourceSchemaName: 'CreatePermissionInputSchema',
    contextFields: [...CONTEXT_FIELDS, 'conditions'],
    fileName: 'permission.ts',
    docNote: 'Permission create form. id/scopeId/conditions handled separately.',
  },
  {
    outputName: 'permissionUpdateSchema',
    sourceSchemaName: 'UpdatePermissionInputSchema',
    contextFields: ['conditions'],
    fileName: 'permission.ts',
    docNote: 'Permission edit form. conditions edited via ConditionEditor.',
  },
  {
    outputName: 'roleCreateSchema',
    sourceSchemaName: 'CreateRoleInputSchema',
    contextFields: [...CONTEXT_FIELDS, 'parentRoleId'],
    fileName: 'role.ts',
    docNote: 'Role create form.',
  },
  {
    outputName: 'webhookCreateSchema',
    sourceSchemaName: 'CreateWebhookEndpointInputSchema',
    contextFields: ['id'],
    fileName: 'webhook.ts',
    docNote: 'Webhook create/edit form. id is auto-generated.',
  },
  {
    outputName: 'scopeCreateSchema',
    sourceSchemaName: 'CreateScopeInputSchema',
    contextFields: [],
    fileName: 'scope.ts',
    docNote: 'Workspace/scope create form.',
  },
  {
    outputName: 'resourceTypeCreateSchema',
    sourceSchemaName: 'CreateResourceTypeInputSchema',
    contextFields: [],
    fileName: 'resource-type.ts',
    docNote: 'Resource type create form.',
  },
  {
    outputName: 'accessCheckSchema',
    sourceSchemaName: 'AccessCheckInputSchema',
    contextFields: ['context', 'includeReason', 'scopeId'],
    fileName: 'access-check.ts',
    docNote: 'Access check form. scopeId comes from workspace context.',
  },
  {
    outputName: 'apiKeyCreateSchema',
    sourceSchemaName: 'CreateApiKeyInputSchema',
    contextFields: ['attributes'],
    fileName: 'api-key.ts',
    docNote: 'API key create form. attributes handled separately.',
  },
  {
    outputName: 'organizationUpdateSchema',
    sourceSchemaName: 'UpdateOrganizationInputSchema',
    contextFields: [],
    fileName: 'organization.ts',
    docNote: 'Organization update form.',
  },
]

function getSourceSchema(name: string): z.ZodType | undefined {
  return (schemas as Record<string, unknown>)[name] as z.ZodType | undefined
}

export interface GenerateFrontendSchemasResult {
  files: Array<{ path: string; content: string }>
}

export function generateFrontendSchemas(): GenerateFrontendSchemasResult {
  const fileGroups = new Map<string, string[]>()

  for (const spec of SPECS) {
    const source = getSourceSchema(spec.sourceSchemaName)
    if (!source) {
      console.warn(`Schema ${spec.sourceSchemaName} not found in SDK types`)
      continue
    }

    if (!(source instanceof z.ZodObject)) {
      console.warn(`Schema ${spec.sourceSchemaName} is not a ZodObject`)
      continue
    }

    let adapted: z.ZodObject<any> = source

    if (spec.contextFields && spec.contextFields.length > 0) {
      adapted = omitFields(adapted, spec.contextFields)
    }

    adapted = cloneWithMinLength(adapted, 1)

    const fname = spec.fileName || `${spec.outputName}.ts`
    const isFirst = !fileGroups.has(fname)
    const content = generateSchemaFile(spec.outputName, adapted, spec.docNote, isFirst)

    const existing = fileGroups.get(fname)
    if (existing) {
      existing.push(content)
    } else {
      fileGroups.set(fname, [content])
    }
  }

  const files: Array<{ path: string; content: string }> = []
  for (const [fname, contents] of fileGroups) {
    files.push({
      path: fname,
      content: contents.join('\n'),
    })
  }

  return { files }
}
