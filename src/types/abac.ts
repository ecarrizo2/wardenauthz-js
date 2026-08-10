import { z } from 'zod'

export type AbacScalar = string | number | boolean | null

export type AbacConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'exists'
  | 'ip_in_cidr'
  | 'ip_not_in_cidr'

export type AbacConditionKind = 'all' | 'any' | 'not' | 'predicate'

export interface AbacPredicateCondition {
  kind: 'predicate'
  field: string
  operator: AbacConditionOperator
  value?: AbacScalar | AbacScalar[]
}

export const AbacPredicateConditionSchema: z.ZodType<AbacPredicateCondition> = z.object({
  kind: z.literal('predicate'),
  field: z.string(),
  operator: z.enum([
    'equals',
    'not_equals',
    'in',
    'not_in',
    'greater_than',
    'greater_than_or_equal',
    'less_than',
    'less_than_or_equal',
    'contains',
    'starts_with',
    'ends_with',
    'exists',
    'ip_in_cidr',
    'ip_not_in_cidr',
  ]),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
})

export interface AbacAllCondition {
  kind: 'all'
  conditions: AbacCondition[]
}

export interface AbacAnyCondition {
  kind: 'any'
  conditions: AbacCondition[]
}

export interface AbacNotCondition {
  kind: 'not'
  conditions: [AbacCondition]
}

export const AbacAllConditionSchema: z.ZodType<AbacAllCondition> = z.lazy(() =>
  z.object({
    kind: z.literal('all'),
    conditions: z.array(AbacConditionSchema),
  })
)

export const AbacAnyConditionSchema: z.ZodType<AbacAnyCondition> = z.lazy(() =>
  z.object({
    kind: z.literal('any'),
    conditions: z.array(AbacConditionSchema),
  })
)

export const AbacNotConditionSchema: z.ZodType<AbacNotCondition> = z.lazy(() =>
  z.object({
    kind: z.literal('not'),
    conditions: z.tuple([AbacConditionSchema]),
  })
)

export const AbacConditionSchema: z.ZodType<AbacCondition> = z.lazy(() =>
  z.union([AbacPredicateConditionSchema, AbacAllConditionSchema, AbacAnyConditionSchema, AbacNotConditionSchema])
)

export type AbacCondition = AbacPredicateCondition | AbacAllCondition | AbacAnyCondition | AbacNotCondition
