import { HttpClient } from '../http-client'
import {
  AccessCheckInput,
  AccessCheckResult,
  HasAccessInput,
  HasAccessResult,
  ListPermissionsInput,
  ListPermissionsResult,
  ListRolesInput,
  ListRolesResult,
  SelfAccessCheckInput,
  SelfAccessCheckResult,
  SimulateAccessInput,
  SimulateAccessResult,
  ReceiptIssueInput,
  ReceiptIssueResult,
  ReceiptVerifyInput,
  ReceiptVerifyResult,
} from '../types'

export class AccessResource {
  constructor(private readonly client: HttpClient) {}

  async hasAccess(input: HasAccessInput): Promise<HasAccessResult> {
    return this.client.post('/v1/access/check', input)
  }

  /** M2M self-check: evaluates the authenticated API key's own permissions. */
  async hasAccessSelf(input: SelfAccessCheckInput): Promise<SelfAccessCheckResult> {
    return this.client.post('/v1/access/check-self', input)
  }

  async hasAccessBulk(input: AccessCheckInput[]): Promise<AccessCheckResult[]> {
    return this.client.post('/v1/access/check-bulk', input)
  }

  async listPermissions(input: ListPermissionsInput): Promise<ListPermissionsResult> {
    return this.client.post('/v1/access/list-permissions', input)
  }

  async listRoles(input: ListRolesInput): Promise<ListRolesResult> {
    return this.client.post('/v1/access/list-roles', input)
  }

  async simulate(input: SimulateAccessInput): Promise<SimulateAccessResult> {
    return this.client.post('/v1/access/simulate', input)
  }

  async issueReceipt(input: ReceiptIssueInput): Promise<ReceiptIssueResult> {
    return this.client.post('/v1/access/receipt', input)
  }

  async verifyReceipt(input: ReceiptVerifyInput): Promise<ReceiptVerifyResult> {
    return this.client.post('/v1/access/receipt/verify', input)
  }
}
