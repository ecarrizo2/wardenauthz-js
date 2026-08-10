import { z } from 'zod'

export type TierAction = 'allow' | 'approve' | 'deny'

export const TierActionSchema = z.enum(['allow', 'approve', 'deny'])

export interface TierActions {
  low: TierAction
  medium: TierAction
  high: TierAction
}

export const TierActionsSchema = z.object({
  low: TierActionSchema,
  medium: TierActionSchema,
  high: TierActionSchema,
})

export interface TierPolicyResult {
  tiers: TierActions
}

export const TierPolicyResultSchema = z.object({
  tiers: TierActionsSchema,
})

export interface UpdateTierPolicyInput {
  low: TierAction
  medium: TierAction
  high: TierAction
}

export const UpdateTierPolicyInputSchema = z.object({
  low: TierActionSchema,
  medium: TierActionSchema,
  high: TierActionSchema,
})
