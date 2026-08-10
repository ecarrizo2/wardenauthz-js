import { z } from 'zod'

export type IdentityProvider = 'cognito' | 'okta' | 'azure' | 'google' | 'scim'

export type IdentityStatus = 'active' | 'deprovisioned'

export interface UserIdentityItem {
  subjectId: string
  email?: string
  provisionedVia?: IdentityProvider
  status?: IdentityStatus
  externalId?: string
}

export const UserIdentityItemSchema = z.object({
  subjectId: z.string(),
  email: z.string().optional(),
  provisionedVia: z.enum(['cognito', 'okta', 'azure', 'google', 'scim']).optional(),
  status: z.enum(['active', 'deprovisioned']).optional(),
  externalId: z.string().optional(),
})
