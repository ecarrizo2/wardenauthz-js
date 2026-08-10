import { z } from 'zod'

export interface FieldIR {
  name: string
  goName: string
  tsType: string
  goType: string
  jsonTag: string
  isOptional: boolean
  isNullable: boolean
  isArray: boolean
  arrayElementType?: string
  isMap: boolean
  mapValueType?: string
  comment?: string
  refTypeName?: string
}

export interface TypeIR {
  name: string
  goName: string
  kind: 'struct' | 'string-enum' | 'type-alias'
  fields: FieldIR[]
  comment?: string
  embeddedTypes?: string[]
}

export interface CodegenIR {
  packageName: string
  types: TypeIR[]
  imports: string[]
}
