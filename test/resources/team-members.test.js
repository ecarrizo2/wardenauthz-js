const test = require('node:test')
const assert = require('node:assert/strict')

const { HttpClient } = require('../../dist/http-client.js')
const { TeamMembersResource } = require('../../dist/resources/team-members.js')

const BASE_URL = 'https://api.wardenauthz.test'

let originalFetch

test.beforeEach(() => {
  originalFetch = globalThis.fetch
})

test.afterEach(() => {
  globalThis.fetch = originalFetch
})

test('resendInvite calls POST /v1/scope/{scopeId}/team-members/{subjectId}/resend-invite', async () => {
  let capturedUrl, capturedInit
  const member = { subjectId: 'pending-invite-1', status: 'pending', inviteSendCount: 2, inviteEmailFailed: false }

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init

    return { ok: true, status: 200, statusText: 'OK', text: async () => JSON.stringify(member) }
  }

  const resource = new TeamMembersResource(new HttpClient(BASE_URL, 'sk_test_abc123'))
  const result = await resource.resendInvite('ws-1', 'pending-invite-1')

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/team-members/pending-invite-1/resend-invite`)
  assert.equal(capturedInit.method, 'POST')
  assert.deepEqual(result, member)
})
