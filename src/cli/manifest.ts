import { extname } from 'path'
import { load as loadYaml } from 'js-yaml'
import { AuthorizationManifestApplyInput } from '../types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function expectStringField(record: Record<string, unknown>, fieldName: string): void {
  if (typeof record[fieldName] !== 'string' || record[fieldName].length === 0) {
    throw new Error(`Manifest field '${fieldName}' must be a non-empty string`)
  }
}

function expectStringArrayField(record: Record<string, unknown>, fieldName: string): void {
  const value = record[fieldName]
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.length === 0)) {
    throw new Error(`Manifest field '${fieldName}' must be an array of non-empty strings`)
  }
}

function validateManifestShape(manifest: unknown): asserts manifest is AuthorizationManifestApplyInput {
  if (!isRecord(manifest)) {
    throw new Error('Manifest root must be an object')
  }

  expectStringField(manifest, 'apiVersion')
  expectStringField(manifest, 'kind')

  const spec = manifest.spec
  if (!isRecord(spec)) {
    throw new Error("Manifest field 'spec' must be an object")
  }

  expectStringField(spec, 'mode')
  expectStringField(spec, 'deletionPolicy')

  if (!Array.isArray(spec.permissions) || !Array.isArray(spec.roles) || !Array.isArray(spec.accessPolicies)) {
    throw new Error("Manifest field 'spec' must include arrays: permissions, roles, accessPolicies")
  }

  for (const permission of spec.permissions) {
    if (!isRecord(permission)) {
      throw new Error('Each manifest permission must be an object')
    }
    expectStringField(permission, 'id')
    expectStringField(permission, 'name')
    expectStringField(permission, 'resource')
    expectStringField(permission, 'action')
    if (permission.effect !== 'allow' && permission.effect !== 'deny') {
      throw new Error("Manifest permission field 'effect' must be 'allow' or 'deny'")
    }
  }

  for (const role of spec.roles) {
    if (!isRecord(role)) {
      throw new Error('Each manifest role must be an object')
    }
    expectStringField(role, 'id')
    expectStringField(role, 'name')
    expectStringArrayField(role, 'permissionIds')
  }

  for (const accessPolicy of spec.accessPolicies) {
    if (!isRecord(accessPolicy)) {
      throw new Error('Each manifest access policy must be an object')
    }
    expectStringField(accessPolicy, 'subjectId')
    expectStringArrayField(accessPolicy, 'roleIds')
  }
}

function resolveFormat(filePath: string, explicit?: 'json' | 'yaml'): 'json' | 'yaml' {
  if (explicit) {
    return explicit
  }

  const extension = extname(filePath).toLowerCase()
  if (extension === '.yaml' || extension === '.yml') {
    return 'yaml'
  }

  return 'json'
}

function parseManifest(content: string, format: 'json' | 'yaml'): unknown {
  if (format === 'json') {
    return JSON.parse(content)
  }

  return loadYaml(content)
}

export function parseManifestFile(
  filePath: string,
  content: string,
  explicitFormat?: 'json' | 'yaml'
): { manifest: AuthorizationManifestApplyInput; serialization: 'json' | 'yaml' } {
  const serialization = resolveFormat(filePath, explicitFormat)
  const parsed = parseManifest(content, serialization)

  validateManifestShape(parsed)

  return { manifest: parsed, serialization }
}
