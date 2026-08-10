const test = require('node:test')
const assert = require('node:assert/strict')

const { HttpClient } = require('../../dist/http-client.js')
const { ScopesResource } = require('../../dist/resources/scopes.js')

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

// ── list ──

test('list calls GET /v1/scope with no params', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { items: [], nextToken: null })
  }

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  const result = await scopes.list()

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope`)
  assert.equal(capturedInit.method, 'GET')
  assert.equal(capturedInit.headers['Content-Type'], 'application/json')
  assert.equal(capturedInit.headers['x-api-key'], API_KEY)
  assert.equal(result.items.length, 0)
  assert.equal(result.nextToken, null)
})

test('list with limit and nextToken appends query params', async () => {
  let capturedUrl

  globalThis.fetch = async (url) => {
    capturedUrl = url
    return mockResponse(200, { items: [], nextToken: 'tok_2' })
  }

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  await scopes.list({ limit: 10, nextToken: 'tok_1' })

  assert.ok(capturedUrl.includes('limit=10'))
  assert.ok(capturedUrl.includes('nextToken=tok_1'))
  assert.ok(capturedUrl.startsWith(`${BASE_URL}/v1/scope?`))
})

test('list with type param appends type query param', async () => {
  let capturedUrl

  globalThis.fetch = async (url) => {
    capturedUrl = url
    return mockResponse(200, { items: [], nextToken: null })
  }

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  await scopes.list({ type: 'organization' })

  assert.ok(capturedUrl.includes('type=organization'))
})

test('list with all params appends all query params', async () => {
  let capturedUrl

  globalThis.fetch = async (url) => {
    capturedUrl = url
    return mockResponse(200, { items: [], nextToken: null })
  }

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  await scopes.list({ limit: 50, nextToken: 'tok_abc', type: 'workspace' })

  assert.ok(capturedUrl.includes('limit=50'))
  assert.ok(capturedUrl.includes('nextToken=tok_abc'))
  assert.ok(capturedUrl.includes('type=workspace'))
})

test('list returns items correctly', async () => {
  globalThis.fetch = async () =>
    mockResponse(200, {
      items: [
        { id: 'scope-1', name: 'Org A', type: 'organization' },
        { id: 'scope-2', name: 'WS B', type: 'workspace' },
      ],
      nextToken: 'next_tok',
    })

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  const result = await scopes.list()

  assert.equal(result.items.length, 2)
  assert.equal(result.items[0].id, 'scope-1')
  assert.equal(result.items[0].name, 'Org A')
  assert.equal(result.items[1].id, 'scope-2')
  assert.equal(result.nextToken, 'next_tok')
})

// ── getById ──

test('getById calls GET /v1/scope/{scopeId}', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { id: 'scope-42', name: 'My Scope', type: 'workspace' })
  }

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  const result = await scopes.getById('scope-42')

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/scope-42`)
  assert.equal(capturedInit.method, 'GET')
  assert.equal(result.id, 'scope-42')
  assert.equal(result.name, 'My Scope')
  assert.equal(result.type, 'workspace')
})

// ── create ──

test('create calls POST /v1/scope with input body', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(201, { id: 'new-scope', name: 'Acme', type: 'organization' })
  }

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  const result = await scopes.create({ name: 'Acme', type: 'organization' })

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope`)
  assert.equal(capturedInit.method, 'POST')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.equal(parsedBody.name, 'Acme')
  assert.equal(parsedBody.type, 'organization')

  assert.equal(result.id, 'new-scope')
})

// ── update ──

test('update calls PATCH /v1/scope/{scopeId} with input', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { id: 'scope-1', name: 'Updated Name', type: 'workspace' })
  }

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  const result = await scopes.update('scope-1', { name: 'Updated Name' })

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/scope-1`)
  assert.equal(capturedInit.method, 'PATCH')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.equal(parsedBody.name, 'Updated Name')

  assert.equal(result.name, 'Updated Name')
})

// ── delete ──

test('delete calls DELETE /v1/scope/{scopeId}', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(204, '')
  }

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  const result = await scopes.delete('scope-42')

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/scope-42`)
  assert.equal(capturedInit.method, 'DELETE')
  assert.equal(result, undefined)
})

// ── applyManifest ──

test('applyManifest calls POST /v1/scope/{scopeId}/apply with manifest input', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, {
      created: { permissions: 3, roles: 1 },
      updated: { permissions: 0, roles: 0 },
      deleted: { permissions: 0, roles: 0 },
    })
  }

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  const manifestInput = {
    permissions: [
      { id: 'documents:read', resource: 'documents', action: 'read', effect: 'allow' },
      { id: 'documents:write', resource: 'documents', action: 'write', effect: 'allow' },
    ],
    roles: [{ id: 'editor', name: 'Editor', permissionIds: ['documents:read', 'documents:write'] }],
    policies: [
      { id: 'dev-policy', subjectId: 'dev-team', scopeId: 'scope-1', roleIds: [{ scopeId: 'scope-1', roleIds: ['editor'] }] },
    ],
    mode: 'overwrite',
  }

  const result = await scopes.applyManifest('scope-1', manifestInput)

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/scope-1/apply`)
  assert.equal(capturedInit.method, 'POST')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.equal(parsedBody.permissions.length, 2)
  assert.equal(parsedBody.roles.length, 1)
  assert.equal(parsedBody.policies.length, 1)
  assert.equal(parsedBody.mode, 'overwrite')

  assert.equal(result.created.permissions, 3)
  assert.equal(result.created.roles, 1)
})

// ── export ──

test('export calls GET /v1/scope/{scopeId}/export', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, {
      permissions: [{ id: 'p1', resource: 'docs', action: 'read', effect: 'allow' }],
      roles: [{ id: 'r1', name: 'Viewer', permissionIds: ['p1'] }],
      policies: [],
    })
  }

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  const result = await scopes.export('scope-1')

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/scope-1/export`)
  assert.equal(capturedInit.method, 'GET')
  assert.equal(result.permissions.length, 1)
  assert.equal(result.roles.length, 1)
  assert.equal(result.policies.length, 0)
})

// ── move ──

test('move calls POST /v1/scope/{scopeId}/move with input', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { id: 'scope-1', name: 'Moved Scope', type: 'workspace', parentScopeId: 'org-1' })
  }

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  const result = await scopes.move('scope-1', { newParentScopeId: 'org-1' })

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/scope-1/move`)
  assert.equal(capturedInit.method, 'POST')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.equal(parsedBody.newParentScopeId, 'org-1')

  assert.equal(result.parentScopeId, 'org-1')
})

// ── Error propagation ──

test('error propagates from HttpClient through resource methods', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 403,
    statusText: 'Forbidden',
    text: async () => JSON.stringify({ error: 'forbidden' }),
  })

  const httpClient = createClient()
  const scopes = new ScopesResource(httpClient)

  await assert.rejects(
    () => scopes.getById('nonexistent'),
    (err) => {
      assert.equal(err.status, 403)
      assert.equal(err.name, 'WardenAuthApiError')
      return true
    }
  )
})
