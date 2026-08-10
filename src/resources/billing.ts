import { HttpClient } from '../http-client'
import {
  SubscriptionSummary,
  UpdateSubscriptionInput,
  CreateCheckoutSessionInput,
  CreateCheckoutSessionResult,
  CreateCustomerPortalSessionResult,
  OverageStatus,
  GrantOverageConsentInput,
  GrantOverageConsentResult,
} from '../types'

export class BillingResource {
  constructor(private readonly client: HttpClient) {}

  async getSubscription(): Promise<SubscriptionSummary> {
    return this.client.get('/v1/billing/subscription')
  }

  async updateSubscription(input: UpdateSubscriptionInput): Promise<SubscriptionSummary> {
    return this.client.patch('/v1/billing/subscription', input)
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult> {
    return this.client.post('/v1/billing/checkout', input)
  }

  async createCustomerPortalSession(): Promise<CreateCustomerPortalSessionResult> {
    return this.client.post('/v1/billing/portal', {})
  }

  async getOverageStatus(): Promise<OverageStatus> {
    return this.client.get('/v1/billing/overage-status')
  }

  async grantOverageConsent(input?: GrantOverageConsentInput): Promise<GrantOverageConsentResult> {
    return this.client.post('/v1/billing/grant-overage-consent', input ?? {})
  }
}
