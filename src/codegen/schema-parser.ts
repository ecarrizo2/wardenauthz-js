import { z } from 'zod'
import { FieldIR, TypeIR } from './ir'

function getDef(schema: z.ZodType): Record<string, unknown> {
  return schema._def as unknown as Record<string, unknown>
}

function goFieldName(name: string): string {
  if (name === 'id' || name.toUpperCase() === name) return name.toUpperCase()
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function goTypeName(name: string): string {
  if (name === 'id' || name.toUpperCase() === name) return name
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function zodTypeToGoType(
  schema: z.ZodType,
  parentTypeName?: string,
  schemaMap?: Map<z.ZodType, string>
): string {
  const def = getDef(schema)
  const type = def.type as string

  switch (type) {
    case 'string':
      return 'string'
    case 'number': {
      const checks = (def.checks || []) as Array<{ _zod?: { def?: { check?: string } } }>
      if (checks.some((c) => c._zod?.def?.check === 'safeint' || c._zod?.def?.check === 'number_format')) {
        return 'int'
      }
      return 'float64'
    }
    case 'boolean':
      return 'bool'
    case 'array': {
      const elementDef = (def as { element: z.ZodType }).element
      const elemType = zodTypeToGoType(elementDef, parentTypeName, schemaMap)
      return `[]${elemType}`
    }
    case 'object': {
      const knownName = schemaMap?.get(schema)
      if (knownName) return `*${knownName}`
      if (parentTypeName) return `*${parentTypeName}`
      return 'struct{...}'
    }
    case 'enum': {
      return 'string'
    }
    case 'record': {
      const valueTypeDef = (def as { valueType: z.ZodType }).valueType
      return `map[string]${zodTypeToGoType(valueTypeDef, parentTypeName, schemaMap)}`
    }
    case 'union': {
      return 'interface{}'
    }
    case 'literal': {
      return 'string'
    }
    case 'lazy': {
      const getter = (def as { getter: () => z.ZodType }).getter
      return zodTypeToGoType(getter(), parentTypeName, schemaMap)
    }
    case 'optional':
    case 'nullable': {
      return zodTypeToGoType((def as { innerType: z.ZodType }).innerType, parentTypeName, schemaMap)
    }
    default:
      return 'interface{}'
  }
}

function isOptional(schema: z.ZodType): boolean {
  return schema.isOptional()
}

function isNullable(schema: z.ZodType): boolean {
  return schema.isNullable()
}

function isArray(schema: z.ZodType): boolean {
  return getDef(schema).type === 'array'
}

function isMap(schema: z.ZodType): boolean {
  return getDef(schema).type === 'record'
}

function getArrayElementType(schema: z.ZodType, parentTypeName?: string, schemaMap?: Map<z.ZodType, string>): string | undefined {
  const def = getDef(schema)
  if (def.type === 'array') {
    const element = (def as { element: z.ZodType }).element
    return zodTypeToGoType(element, parentTypeName, schemaMap)
  }
  return undefined
}

function getMapValueType(schema: z.ZodType, parentTypeName?: string, schemaMap?: Map<z.ZodType, string>): string | undefined {
  const def = getDef(schema)
  if (def.type === 'record') {
    const valueTypeDef = (def as { valueType: z.ZodType }).valueType
    return zodTypeToGoType(valueTypeDef, parentTypeName, schemaMap)
  }
  return undefined
}

function jsonTag(name: string, optional: boolean): string {
  if (optional) return `json:"${name},omitempty"`
  return `json:"${name}"`
}

function unwrapToBase(schema: z.ZodType): z.ZodType {
  const def = getDef(schema)
  const type = def.type as string
  if (type === 'optional' || type === 'nullable') {
    return unwrapToBase((def as { innerType: z.ZodType }).innerType)
  }
  if (type === 'lazy') {
    return unwrapToBase((def as { getter: () => z.ZodType }).getter())
  }
  return schema
}

export function parseObjectSchema(
  name: string,
  schema: z.ZodObject<any>,
  schemaMap?: Map<z.ZodType, string>
): TypeIR {
  const shape = schema._def.shape as Record<string, z.ZodType>
  const fields: FieldIR[] = []

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    const optional = isOptional(fieldSchema)
    const nullable = isNullable(fieldSchema)
    const array = isArray(fieldSchema)
    const map = isMap(fieldSchema)
    const goType = zodTypeToGoType(fieldSchema, name, schemaMap)
    const tsType = getDef(fieldSchema).type as string
    const goName = goFieldName(fieldName)
    const comment = (fieldSchema as any).description as string | undefined
    const tagOptional = optional || nullable
    const tag = jsonTag(fieldName, tagOptional)

    const unwrapped = unwrapToBase(fieldSchema)
    const refTypeName =
      getDef(unwrapped).type === 'object' ? schemaMap?.get(unwrapped) : undefined

    const alreadyPointer = goType.startsWith('*')
    const needsPointer = (optional || nullable) && !array && !map && !alreadyPointer

    fields.push({
      name: fieldName,
      goName,
      tsType,
      goType: needsPointer ? `*${goType}` : goType,
      jsonTag: tag,
      isOptional: tagOptional,
      isNullable: nullable,
      isArray: array,
      arrayElementType: array ? getArrayElementType(fieldSchema, name, schemaMap) : undefined,
      isMap: map,
      mapValueType: map ? getMapValueType(fieldSchema, name, schemaMap) : undefined,
      comment,
      refTypeName,
    })
  }

  return {
    name,
    goName: goTypeName(name),
    kind: 'struct',
    fields,
  }
}

export function parseEnumSchema(name: string, schema: z.ZodEnum<any>, _schemaMap?: Map<z.ZodType, string>): TypeIR {
  const def = getDef(schema)
  const entries = def.entries as Record<string, string>
  const values = Object.keys(entries)

  return {
    name,
    goName: goTypeName(name),
    kind: 'string-enum',
    fields: values.map((v) => ({
      name: v,
      goName: goTypeName(v),
      tsType: 'string',
      goType: 'string',
      jsonTag: jsonTag(v, false),
      isOptional: false,
      isNullable: false,
      isArray: false,
      isMap: false,
    })),
  }
}

export function parseUnionSchema(name: string, schema: z.ZodUnion<any>, schemaMap?: Map<z.ZodType, string>): TypeIR {
  const def = getDef(schema)
  const options = def.options as z.ZodType[]

  const fields: FieldIR[] = options.map((opt, i) => {
    const kind = getDef(opt).type as string
    if (kind === 'literal') {
      const literalValues = (getDef(opt) as { values: string[] }).values
      return {
        name: `kind_${i}`,
        goName: `Kind${i}`,
        tsType: 'literal',
        goType: 'string',
        jsonTag: `json:"${literalValues[0]}"`,
        isOptional: false,
        isNullable: false,
        isArray: false,
        isMap: false,
      }
    }
    return {
      name: `option_${i}`,
      goName: `Option${i}`,
      tsType: kind,
      goType: zodTypeToGoType(opt, name, schemaMap),
      jsonTag: '',
      isOptional: false,
      isNullable: false,
      isArray: false,
      isMap: false,
    }
  })

  return {
    name,
    goName: goTypeName(name),
    kind: 'type-alias',
    fields,
  }
}
