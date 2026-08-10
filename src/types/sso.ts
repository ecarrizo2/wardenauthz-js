import { z } from 'zod'

export type SsoProtocol = 'saml' | 'oidc'

export const SsoProtocolSchema = z.enum(['saml', 'oidc'])

export type SsoProvider = 'okta' | 'azure' | 'google'

export type SsoConfigStatus = 'pending' | 'active' | 'error'

export interface SsoConfigItem {
  orgId: string
  provider: SsoProvider
  protocol: SsoProtocol
  cognitoIdpName: string
  status: SsoConfigStatus
  ssoLoginUrl: string
  clientId?: string
  issuerUrl?: string
  spMetadataUrl?: string
  callbackUrl?: string
}

export const SsoConfigItemSchema = z.object({
  orgId: z.string(),
  provider: z.enum(['okta', 'azure', 'google']),
  protocol: SsoProtocolSchema,
  cognitoIdpName: z.string(),
  status: z.enum(['pending', 'active', 'error']),
  ssoLoginUrl: z.string(),
  clientId: z.string().optional(),
  issuerUrl: z.string().optional(),
  spMetadataUrl: z.string().optional(),
  callbackUrl: z.string().optional(),
})

export interface CreateSsoConfigInput {
  provider: SsoProvider
  protocol: SsoProtocol
  metadataUrl?: string
  metadataXml?: string
  clientId?: string
  clientSecret?: string
  issuerUrl?: string
}

export const CreateSsoConfigInputSchema = z.object({
  provider: z.enum(['okta', 'azure', 'google']),
  protocol: SsoProtocolSchema,
  metadataUrl: z.string().optional(),
  metadataXml: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  issuerUrl: z.string().optional(),
})

export interface UpdateSsoConfigInput {
  metadataUrl?: string
  metadataXml?: string
  clientId?: string
  clientSecret?: string
  issuerUrl?: string
}

export const UpdateSsoConfigInputSchema = z.object({
  metadataUrl: z.string().optional(),
  metadataXml: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  issuerUrl: z.string().optional(),
})

export interface SsoTestResult {
  success: boolean
  error?: string
}

export const SsoTestResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
})

export interface RotateScimTokenResult {
  token: string
  createdAt: string
}

export const RotateScimTokenResultSchema = z.object({
  token: z.string(),
  createdAt: z.string(),
})

export interface ScimConfig {
  orgId: string
  scimBaseUrl: string
  bearerToken: string
}

export const ScimConfigSchema = z.object({
  orgId: z.string(),
  scimBaseUrl: z.string(),
  bearerToken: z.string(),
})
