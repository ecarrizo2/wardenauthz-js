import { HttpClient } from '../http-client'
import {
  SsoConfigItem,
  CreateSsoConfigInput,
  UpdateSsoConfigInput,
  SsoTestResult,
  RotateScimTokenResult,
} from '../types'

export class SsoResource {
  constructor(private readonly client: HttpClient) {}

  async create(orgId: string, input: CreateSsoConfigInput): Promise<SsoConfigItem> {
    return this.client.post(`/v1/admin/org/${orgId}/sso/configs`, input)
  }

  async list(orgId: string): Promise<SsoConfigItem[]> {
    return this.client.get(`/v1/admin/org/${orgId}/sso/configs`)
  }

  async get(orgId: string, idpId: string): Promise<SsoConfigItem> {
    return this.client.get(`/v1/admin/org/${orgId}/sso/configs/${idpId}`)
  }

  async update(orgId: string, idpId: string, input: UpdateSsoConfigInput): Promise<SsoConfigItem> {
    return this.client.patch(`/v1/admin/org/${orgId}/sso/configs/${idpId}`, input)
  }

  async delete(orgId: string, idpId: string): Promise<void> {
    return this.client.delete(`/v1/admin/org/${orgId}/sso/configs/${idpId}`)
  }

  async test(orgId: string, idpId: string): Promise<SsoTestResult> {
    return this.client.post(`/v1/admin/org/${orgId}/sso/configs/${idpId}/test`, {})
  }

  async rotateScimToken(orgId: string): Promise<RotateScimTokenResult> {
    return this.client.post(`/v1/admin/org/${orgId}/sso/scim-token`, {})
  }
}
