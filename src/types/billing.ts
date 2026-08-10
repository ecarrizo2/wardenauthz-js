import { z } from 'zod'

export type BillingTier = 'free' | 'starter' | 'growth' | 'business' | 'scale' | 'enterprise'

export const BillingTierSchema = z.enum(['free', 'starter', 'growth', 'business', 'scale', 'enterprise'])

export type PurchasableTier = 'starter' | 'growth' | 'business' | 'scale'

export const PurchasableTierSchema = z.enum(['starter', 'growth', 'business', 'scale'])

export interface SubscriptionSummary {
  tier: BillingTier
  tierName: string
  monthlyLimit: number | null
  currentMonthCount: number
  percentUsed: number | null
  notificationEmails: string[]
  alertThresholdPercent: number
  anomalyAlertsEnabled: boolean
  billingInterval?: string
  stripeStatus?: string
}

export const SubscriptionSummarySchema = z.object({
  tier: BillingTierSchema,
  tierName: z.string(),
  monthlyLimit: z.number().nullable(),
  currentMonthCount: z.number(),
  percentUsed: z.number().nullable(),
  notificationEmails: z.array(z.string()),
  alertThresholdPercent: z.number(),
  anomalyAlertsEnabled: z.boolean(),
  billingInterval: z.string().optional(),
  stripeStatus: z.string().optional(),
})

export interface UpdateSubscriptionInput {
  notificationEmails?: string[]
  alertThresholdPercent?: number
  anomalyAlertsEnabled?: boolean
}

export const UpdateSubscriptionInputSchema = z.object({
  notificationEmails: z.array(z.string()).optional(),
  alertThresholdPercent: z.number().optional(),
  anomalyAlertsEnabled: z.boolean().optional(),
})

export interface CreateCheckoutSessionInput {
  tier: PurchasableTier
  interval: 'monthly' | 'annual'
  customerEmail?: string
  successUrl: string
  cancelUrl: string
}

export const CreateCheckoutSessionInputSchema = z.object({
  tier: PurchasableTierSchema,
  interval: z.enum(['monthly', 'annual']),
  customerEmail: z.string().optional(),
  successUrl: z.string(),
  cancelUrl: z.string(),
})

export interface CreateCheckoutSessionResult {
  url: string
}

export const CreateCheckoutSessionResultSchema = z.object({
  url: z.string(),
})

export interface CreateCustomerPortalSessionResult {
  url: string
}

export const CreateCustomerPortalSessionResultSchema = z.object({
  url: z.string(),
})

export interface OverageStatus {
  tier: BillingTier
  tierName: string
  includedChecks: number
  currentMonthChecks: number
  overageChecks: number
  overageRatePerMillion: number
  estimatedOverageCharge: number
  isPaused: boolean
  consentCount: number
  nextPauseAtPercent: number
  nextPauseAtChecks: number
  isHardPause: boolean
  billingInterval?: string
  stripeStatus?: string
}

export const OverageStatusSchema = z.object({
  tier: BillingTierSchema,
  tierName: z.string(),
  includedChecks: z.number(),
  currentMonthChecks: z.number(),
  overageChecks: z.number(),
  overageRatePerMillion: z.number(),
  estimatedOverageCharge: z.number(),
  isPaused: z.boolean(),
  consentCount: z.number(),
  nextPauseAtPercent: z.number(),
  nextPauseAtChecks: z.number(),
  isHardPause: z.boolean(),
  billingInterval: z.string().optional(),
  stripeStatus: z.string().optional(),
})

export interface GrantOverageConsentInput {
  ipAddress?: string
}

export const GrantOverageConsentInputSchema = z.object({
  ipAddress: z.string().optional(),
})

export interface GrantOverageConsentResult {
  resumed: boolean
  tier: BillingTier
  consentCount: number
  nextPauseAtPercent: number
  nextPauseAtChecks: number
}

export const GrantOverageConsentResultSchema = z.object({
  resumed: z.boolean(),
  tier: BillingTierSchema,
  consentCount: z.number(),
  nextPauseAtPercent: z.number(),
  nextPauseAtChecks: z.number(),
})
