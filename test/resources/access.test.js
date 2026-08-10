const test = require('node:test')
const assert = require('node:assert/strict')

const { HttpClient } = require('../../dist/http-client.js')
const { AccessResource } = require('../../dist/resources/access.js')

const BASE_URL = 'https://api.wardenauthz.test'
const API_KEY = 'sk_test_abc123'

function createClient() {
  return new HttpClient(BASE_URL, API_KEY)
}

function mockResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  }
}

let originalFetch

test.beforeEach(() => {
  originalFetch = globalThis.fetch
})

test.afterEach(() => {
  globalThis.fetch = originalFetch
})

// ── hasAccess ──

test('hasAccess calls POST /v1/access/check with correct body', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { allowed: true })
  }

  const httpClient = createClient()
  const access = new AccessResource(httpClient)

  const result = await access.hasAccess({
    subjectId: 'user-123',
    scopeId: 'workspace-abc',
    resource: 'documents',
    action: 'read',
  })

  assert.equal(capturedUrl, `${BASE_URL}/v1/access/check`)
  assert.equal(capturedInit.method, 'POST')
  assert.equal(capturedInit.headers['Content-Type'], 'application/json')
  assert.equal(capturedInit.headers['x-api-key'], API_KEY)

  const parsedBody = JSON.parse(capturedInit.body)
  assert.equal(parsedBody.subjectId, 'user-123')
  assert.equal(parsedBody.scopeId, 'workspace-abc')
  assert.equal(parsedBody.resource, 'documents')
  assert.equal(parsedBody.action, 'read')

  assert.equal(result.allowed, true)
})

test('hasAccess returns denied result correctly', async () => {
  globalThis.fetch = async () =>
    mockResponse(200, {
      allowed: false,
      resource: 'documents',
      action: 'delete',
      reasoning: {
        deniedBy: [{ roleId: 'viewer', roleName: 'Viewer', permissionId: 'documents:read', scopeId: 'ws-1' }],
        matchedBy: [],
        scopeChain: ['ws-1', 'org-1'],
      },
    })

  const httpClient = createClient()
  const access = new AccessResource(httpClient)

  const result = await access.hasAccess({
    subjectId: 'user-123',
    scopeId: 'workspace-abc',
    resource: 'documents',
    action: 'delete',
  })

  assert.equal(result.allowed, false)
  assert.equal(result.resource, 'documents')
  assert.equal(result.action, 'delete')
  assert.equal(result.reasoning.deniedBy.length, 1)
})

// ── hasAccessBulk ──

test('hasAccessBulk calls POST /v1/access/check-bulk with array', async () => {
  let capturedUrl, capturedBody

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedBody = JSON.parse(init.body)
    return mockResponse(200, [
      { allowed: true, resource: 'documents', action: 'read', subjectId: 'u1', scopeId: 'ws-1' },
      { allowed: false, resource: 'documents', action: 'write', subjectId: 'u1', scopeId: 'ws-1' },
    ])
  }

  const httpClient = createClient()
  const access = new AccessResource(httpClient)

  const results = await access.hasAccessBulk([
    { subjectId: 'u1', scopeId: 'ws-1', resource: 'documents', action: 'read' },
    { subjectId: 'u1', scopeId: 'ws-1', resource: 'documents', action: 'write' },
  ])

  assert.equal(capturedUrl, `${BASE_URL}/v1/access/check-bulk`)
  assert.equal(capturedBody.length, 2)
  assert.equal(capturedBody[0].resource, 'documents')
  assert.equal(capturedBody[0].action, 'read')
  assert.equal(capturedBody[1].resource, 'documents')
  assert.equal(capturedBody[1].action, 'write')
  assert.equal(results.length, 2)
  assert.equal(results[0].allowed, true)
  assert.equal(results[1].allowed, false)
})

// ── listPermissions ──

test('listPermissions calls POST /v1/access/list-permissions', async () => {
  let capturedUrl, capturedBody

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedBody = JSON.parse(init.body)
    return mockResponse(200, {
      permissions: [
        { resource: 'documents', action: 'read', effect: 'allow' },
        { resource: 'documents', action: 'write', effect: 'deny' },
      ],
    })
  }

  const httpClient = createClient()
  const access = new AccessResource(httpClient)

  const result = await access.listPermissions({
    subjectId: 'user-123',
    scopeId: 'workspace-abc',
  })

  assert.equal(capturedUrl, `${BASE_URL}/v1/access/list-permissions`)
  assert.equal(capturedBody.subjectId, 'user-123')
  assert.equal(capturedBody.scopeId, 'workspace-abc')
  assert.equal(result.permissions.length, 2)
  assert.equal(result.permissions[0].resource, 'documents')
  assert.equal(result.permissions[0].effect, 'allow')
})

// ── listRoles ──

test('listRoles calls POST /v1/access/list-roles', async () => {
  let capturedUrl, capturedBody

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedBody = JSON.parse(init.body)
    return mockResponse(200, {
      roles: [{ id: 'editor', name: 'Editor', scopeId: 'ws-1' }],
    })
  }

  const httpClient = createClient()
  const access = new AccessResource(httpClient)

  const result = await access.listRoles({
    subjectId: 'user-123',
    scopeId: 'workspace-abc',
  })

  assert.equal(capturedUrl, `${BASE_URL}/v1/access/list-roles`)
  assert.equal(capturedBody.subjectId, 'user-123')
  assert.equal(capturedBody.scopeId, 'workspace-abc')
  assert.equal(result.roles.length, 1)
  assert.equal(result.roles[0].id, 'editor')
})

// ── simulate ──

test('simulate calls POST /v1/access/simulate', async () => {
  let capturedUrl, capturedBody

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedBody = JSON.parse(init.body)
    return mockResponse(200, {
      subjectId: 'user-123',
      scopeId: 'ws-1',
      results: [{ resource: 'documents', action: 'read', allowed: true }],
    })
  }

  const httpClient = createClient()
  const access = new AccessResource(httpClient)

  const result = await access.simulate({
    subjectId: 'user-123',
    scopeId: 'ws-1',
    checks: [{ resource: 'documents', action: 'read' }],
    permissions: [{ id: 'documents:read', resource: 'documents', action: 'read', effect: 'allow' }],
    roles: [],
    subjectRoleIds: [],
  })

  assert.equal(capturedUrl, `${BASE_URL}/v1/access/simulate`)
  assert.equal(capturedBody.subjectId, 'user-123')
  assert.equal(capturedBody.scopeId, 'ws-1')
  assert.equal(capturedBody.checks.length, 1)
  assert.equal(result.results[0].allowed, true)
})

// ── issueReceipt ──

test('issueReceipt calls POST /v1/access/receipt', async () => {
  let capturedUrl, capturedBody

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedBody = JSON.parse(init.body)
    return mockResponse(200, {
      receipt: 'eyJhbGciOi...',
      decision: { allowed: true, resource: 'documents', action: 'read' },
    })
  }

  const httpClient = createClient()
  const access = new AccessResource(httpClient)

  const result = await access.issueReceipt({
    subjectId: 'user-123',
    resource: 'documents',
    action: 'read',
  })

  assert.equal(capturedUrl, `${BASE_URL}/v1/access/receipt`)
  assert.equal(capturedBody.subjectId, 'user-123')
  assert.equal(capturedBody.resource, 'documents')
  assert.equal(capturedBody.action, 'read')
  assert.equal(result.receipt, 'eyJhbGciOi...')
  assert.equal(result.decision.allowed, true)
})

// ── verifyReceipt ──

test('verifyReceipt calls POST /v1/access/receipt/verify', async () => {
  let capturedUrl, capturedBody

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedBody = JSON.parse(init.body)
    return mockResponse(200, {
      valid: true,
      claims: { subjectId: 'user-123', resource: 'documents', action: 'read', allowed: true },
    })
  }

  const httpClient = createClient()
  const access = new AccessResource(httpClient)

  const result = await access.verifyReceipt({ receipt: 'eyJhbGciOi...' })

  assert.equal(capturedUrl, `${BASE_URL}/v1/access/receipt/verify`)
  assert.equal(capturedBody.receipt, 'eyJhbGciOi...')
  assert.equal(result.valid, true)
  assert.equal(result.claims.subjectId, 'user-123')
})

// ── Error propagation ──

test('error propagates from HttpClient through resource methods', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    text: async () => JSON.stringify({ error: 'unauthorized' }),
  })

  const httpClient = createClient()
  const access = new AccessResource(httpClient)

  await assert.rejects(
    () => access.hasAccess({ subjectId: 'u1', scopeId: 'ws-1', resource: 'r', action: 'a' }),
    (err) => {
      assert.equal(err.status, 401)
      assert.equal(err.name, 'WardenAuthApiError')
      return true
    }
  )
})
