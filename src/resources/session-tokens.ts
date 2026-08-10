import { HttpClient } from '../http-client'
import {
  MintSessionTokenInput,
  MintSessionTokenResult,
  MintIntentSessionTokenInput,
  MintIntentSessionTokenResult,
  VerifyIntentCallInput,
  VerifyIntentCallResult,
} from '../types'

export class SessionTokensResource {
  constructor(private readonly client: HttpClient) {}

  async mint(input?: MintSessionTokenInput): Promise<MintSessionTokenResult> {
    return this.client.post('/v1/session-token/mint', input ?? {})
  }

  async mintWithIntent(input: MintIntentSessionTokenInput): Promise<MintIntentSessionTokenResult> {
    return this.client.post('/v1/session-token/intent-mint', input)
  }

  async verifyIntentCall(input: VerifyIntentCallInput): Promise<VerifyIntentCallResult> {
    return this.client.post('/v1/session-token/verify-intent-call', input)
  }

  async revoke(jti: string): Promise<void> {
    return this.client.delete(`/v1/session-token/${jti}`)
  }
}
