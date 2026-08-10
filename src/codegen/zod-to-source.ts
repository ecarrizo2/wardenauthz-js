import { z } from 'zod'

function getDef(s: z.ZodType): Record<string, unknown> {
  return s._def as unknown as Record<string, unknown>
}

function getCoreDef(s: z.ZodType): Record<string, unknown> {
  let current = s
  while (true) {
    const def = getDef(current)
    if (def.type === 'optional' || def.type === 'nullable') {
      current = (def as { innerType: z.ZodType }).innerType
      continue
    }
    return def
  }
}

function zodToSource(schema: z.ZodType, indent = ''): string {
  let current = schema
  const wrappers: Array<{ type: string; args?: string }> = []

  while (true) {
    const def = getDef(current)
    if (def.type === 'optional') {
      wrappers.push({ type: '.optional()' })
      current = (def as { innerType: z.ZodType }).innerType
      continue
    }
    if (def.type === 'nullable') {
      wrappers.push({ type: '.nullable()' })
      current = (def as { innerType: z.ZodType }).innerType
      continue
    }
    break
  }

  const coreDef = getCoreDef(current)
  let inner = ''

  switch (coreDef.type as string) {
    case 'string': {
      inner = 'z.string()'
      const checks = (coreDef.checks || []) as Array<{ _zod?: { def?: Record<string, unknown> } }>
      for (const check of checks) {
        const zod = check._zod
        if (!zod?.def) continue
        const chDef = zod.def as Record<string, unknown>
        if (chDef.check === 'min_length' || chDef.check === 'min') {
          inner += `.min(${chDef.minimum ?? chDef.value})`
        } else if (chDef.check === 'max_length' || chDef.check === 'max') {
          inner += `.max(${chDef.maximum ?? chDef.value})`
        } else if (chDef.check === 'email') {
          inner += `.email()`
        } else if (chDef.check === 'url') {
          inner += `.url()`
        } else if (chDef.check === 'regex') {
          inner += `.regex(/${String(chDef.regexp).replace(/\//g, '\\/')}/)`
        }
      }
      const desc = (current as { description?: string }).description
      if (desc) inner += `.describe('${desc.replace(/'/g, "\\'")}')`
      break
    }
    case 'number': {
      inner = 'z.number()'
      const checks = (coreDef.checks || []) as Array<{ _zod?: { def?: Record<string, unknown> } }>
      for (const check of checks) {
        const zod = check._zod
        if (!zod?.def) continue
        const chDef = zod.def as Record<string, unknown>
        if (chDef.check === 'safeint' || chDef.check === 'number_format') {
          inner += '.int()'
        } else if (chDef.check === 'min' || chDef.check === 'greater_than') {
          inner += `.min(${chDef.minimum ?? chDef.value})`
        } else if (chDef.check === 'max' || chDef.check === 'less_than') {
          inner += `.max(${chDef.maximum ?? chDef.value})`
        }
      }
      break
    }
    case 'boolean': {
      inner = 'z.boolean()'
      break
    }
    case 'array': {
      const element = (coreDef as { element: z.ZodType }).element
      inner = `z.array(${zodToSource(element)})`
      break
    }
    case 'object': {
      const shape = coreDef.shape as Record<string, z.ZodType> | undefined
      if (shape) {
        const fields = Object.entries(shape)
          .map(([key, value]) => `  ${key}: ${zodToSource(value as z.ZodType)},`)
          .join('\n')
        inner = `z.object({\n${fields}\n})`
      } else {
        inner = 'z.object({})'
      }
      break
    }
    case 'record': {
      const valueType = (coreDef as { valueType: z.ZodType }).valueType
      inner = `z.record(z.string(), ${zodToSource(valueType)})`
      break
    }
    case 'enum': {
      const entries = coreDef.entries as Record<string, string> | undefined
      if (entries) {
        const values = Object.keys(entries)
          .map((v) => `'${v}'`)
          .join(', ')
        inner = `z.enum([${values}])`
      } else {
        inner = 'z.enum([])'
      }
      break
    }
    case 'union': {
      const options = (coreDef as { options: z.ZodType[] }).options
      inner = `z.union([${options.map((o) => zodToSource(o)).join(', ')}])`
      break
    }
    case 'literal': {
      const values = (coreDef as { values: string[] }).values
      inner = `z.literal('${values[0]}')`
      break
    }
    case 'lazy':
    case 'tuple':
    default: {
      inner = 'z.unknown()'
      break
    }
  }

  for (const wrapper of wrappers) {
    inner += wrapper.type
  }

  return inner
}

export function generateSchemaFile(schemaName: string, schema: z.ZodType, extraTopDoc?: string, includeImport = true): string {
  const source = zodToSource(schema)
  const lines: string[] = []
  lines.push('// Auto-generated from @ecarrizo2/wardenauthz-js SDK types. DO NOT EDIT.')
  lines.push(`// Regenerate with: npx ec-warden-auth generate --output-frontend-schemas`)
  if (extraTopDoc) {
    lines.push(`// ${extraTopDoc}`)
  }
  lines.push('')
  if (includeImport) {
    lines.push(`import { z } from 'zod'`)
    lines.push('')
  }
  lines.push(`export const ${schemaName} = ${source}`)
  lines.push('')
  return lines.join('\n')
}
