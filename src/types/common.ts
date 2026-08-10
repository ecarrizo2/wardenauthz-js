import { z } from 'zod'

export interface PaginatedResult<T> {
  items: T[]
  nextToken?: string
}

export class PaginatedResource<T> {
  constructor(
    private readonly fetchFn: (nextToken?: string) => Promise<PaginatedResult<T>>,
    public readonly items: T[],
    public readonly nextToken?: string
  ) {}

  async next(): Promise<PaginatedResource<T> | null> {
    if (!this.nextToken) return null
    const result = await this.fetchFn(this.nextToken)
    return new PaginatedResource(this.fetchFn, result.items, result.nextToken)
  }

  async all(): Promise<T[]> {
    const allItems = [...this.items]
    let current = this as PaginatedResource<T> | null

    while (current?.nextToken) {
      current = await current.next()
      if (current) {
        allItems.push(...current.items)
      }
    }

    return allItems
  }
}

export enum ValidationMode {
  STRICT = 'strict',
  SILENT = 'silent',
  OFF = 'off',
}

let globalValidationMode: ValidationMode = ValidationMode.STRICT

export function setValidationMode(mode: ValidationMode): void {
  globalValidationMode = mode
}

export function getValidationMode(): ValidationMode {
  return globalValidationMode
}

export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  const mode = getValidationMode()

  if (mode === ValidationMode.OFF) {
    return data as T
  }

  const result = schema.safeParse(data)

  if (result.success) {
    return result.data
  }

  if (mode === ValidationMode.SILENT) {
    return data as T
  }

  throw result.error
}

export type Effect = 'allow' | 'deny'

export const EffectSchema = z.enum(['allow', 'deny'])

export type ScopeType = 'organization' | 'workspace' | 'application'

export const ScopeTypeSchema = z.enum(['organization', 'workspace', 'application'])

export type ApiKeyType = 'management' | 'application'

export const ApiKeyTypeSchema = z.enum(['management', 'application'])

export type WebhookEventType =
  | 'permission.created'
  | 'permission.updated'
  | 'permission.deleted'
  | 'role.created'
  | 'role.updated'
  | 'role.deleted'
  | 'scope.created'
  | 'scope.updated'
  | 'scope.deleted'
  | 'access-policy.created'
  | 'access-policy.updated'
  | 'access-policy.deleted'
  | 'api-key.created'
  | 'api-key.deleted'
  | 'api-key.rotated'
  | 'team-member.added'
  | 'team-member.removed'
  | 'anomaly.detected'
  | 'access.granted'
  | 'access.denied'
  | 'webhook.test'

export const WebhookEventTypeSchema = z.enum([
  'permission.created',
  'permission.updated',
  'permission.deleted',
  'role.created',
  'role.updated',
  'role.deleted',
  'scope.created',
  'scope.updated',
  'scope.deleted',
  'access-policy.created',
  'access-policy.updated',
  'access-policy.deleted',
  'api-key.created',
  'api-key.deleted',
  'api-key.rotated',
  'team-member.added',
  'team-member.removed',
  'anomaly.detected',
  'access.granted',
  'access.denied',
  'webhook.test',
])

export interface ImportResult {
  created: number
  skipped: number
  errors: string[]
}

export const ImportResultSchema = z.object({
  created: z.number(),
  skipped: z.number(),
  errors: z.array(z.string()),
})
