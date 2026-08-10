const test = require('node:test')
const assert = require('node:assert/strict')

const { HttpClient } = require('../../dist/http-client.js')
const { PermissionsResource } = require('../../dist/resources/permissions.js')

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

test('list calls GET /v1/scope/{scopeId}/permission with no params', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { items: [], nextToken: null })
  }

  const httpClient = createClient()
  const permissions = new PermissionsResource(httpClient)

  const result = await permissions.list('ws-1')

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/permission`)
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
  const permissions = new PermissionsResource(httpClient)

  await permissions.list('ws-1', { limit: 25, nextToken: 'tok_1' })

  assert.ok(capturedUrl.includes('limit=25'))
  assert.ok(capturedUrl.includes('nextToken=tok_1'))
  assert.ok(capturedUrl.startsWith(`${BASE_URL}/v1/scope/ws-1/permission?`))
})

test('list returns items correctly', async () => {
  globalThis.fetch = async () =>
    mockResponse(200, {
      items: [
        { id: 'documents:read', scopeId: 'ws-1', resource: 'documents', action: 'read', effect: 'allow' },
        { id: 'documents:write', scopeId: 'ws-1', resource: 'documents', action: 'write', effect: 'allow' },
      ],
      nextToken: 'next_page',
    })

  const httpClient = createClient()
  const permissions = new PermissionsResource(httpClient)

  const result = await permissions.list('ws-1')

  assert.equal(result.items.length, 2)
  assert.equal(result.items[0].id, 'documents:read')
  assert.equal(result.items[0].resource, 'documents')
  assert.equal(result.items[0].action, 'read')
  assert.equal(result.items[0].effect, 'allow')
  assert.equal(result.items[1].id, 'documents:write')
  assert.equal(result.nextToken, 'next_page')
})

// ── getById ──

test('getById calls GET /v1/scope/{scopeId}/permission/{permissionId}', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { id: 'documents:read', scopeId: 'ws-1', resource: 'documents', action: 'read', effect: 'allow' })
  }

  const httpClient = createClient()
  const permissions = new PermissionsResource(httpClient)

  const result = await permissions.getById('ws-1', 'documents:read')

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/permission/documents:read`)
  assert.equal(capturedInit.method, 'GET')
  assert.equal(result.id, 'documents:read')
  assert.equal(result.resource, 'documents')
  assert.equal(result.action, 'read')
})

// ── create ──

test('create calls POST /v1/scope/{scopeId}/permission with body including scopeId', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(201, { id: 'documents:read', scopeId: 'ws-1', resource: 'documents', action: 'read', effect: 'allow', name: 'Read docs' })
  }

  const httpClient = createClient()
  const permissions = new PermissionsResource(httpClient)

  const result = await permissions.create('ws-1', {
    id: 'documents:read',
    resource: 'documents',
    action: 'read',
    effect: 'allow',
    name: 'Read docs',
  })

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/permission`)
  assert.equal(capturedInit.method, 'POST')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.equal(parsedBody.id, 'documents:read')
  assert.equal(parsedBody.scopeId, 'ws-1')
  assert.equal(parsedBody.resource, 'documents')
  assert.equal(parsedBody.action, 'read')
  assert.equal(parsedBody.effect, 'allow')
  assert.equal(parsedBody.name, 'Read docs')

  assert.equal(result.id, 'documents:read')
  assert.equal(result.name, 'Read docs')
})

// ── update ──

test('update calls PATCH /v1/scope/{scopeId}/permission/{permissionId} with input', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { id: 'documents:read', scopeId: 'ws-1', resource: 'documents', action: 'read', effect: 'allow', description: 'Updated description' })
  }

  const httpClient = createClient()
  const permissions = new PermissionsResource(httpClient)

  const result = await permissions.update('ws-1', 'documents:read', { description: 'Updated description' })

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/permission/documents:read`)
  assert.equal(capturedInit.method, 'PATCH')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.equal(parsedBody.description, 'Updated description')

  assert.equal(result.description, 'Updated description')
})

// ── delete ──

test('delete calls DELETE /v1/scope/{scopeId}/permission/{permissionId}', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(204, '')
  }

  const httpClient = createClient()
  const permissions = new PermissionsResource(httpClient)

  const result = await permissions.delete('ws-1', 'documents:read')

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/permission/documents:read`)
  assert.equal(capturedInit.method, 'DELETE')
  assert.equal(result, undefined)
})

// ── bulkCreate ──

test('bulkCreate calls POST /v1/scope/{scopeId}/permission/bulk with permissions array', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, {})
  }

  const httpClient = createClient()
  const permissions = new PermissionsResource(httpClient)

  const result = await permissions.bulkCreate('ws-1', [
    { id: 'docs:read', resource: 'docs', action: 'read', effect: 'allow' },
    { id: 'docs:write', resource: 'docs', action: 'write', effect: 'allow' },
  ])

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/permission/bulk`)
  assert.equal(capturedInit.method, 'POST')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.equal(parsedBody.permissions.length, 2)
  assert.equal(parsedBody.permissions[0].id, 'docs:read')
  assert.equal(parsedBody.permissions[0].scopeId, 'ws-1')
  assert.equal(parsedBody.permissions[1].id, 'docs:write')
  assert.equal(parsedBody.permissions[1].effect, 'allow')
})

// ── bulkDelete ──

test('bulkDelete calls DELETE /v1/scope/{scopeId}/permission/bulk with ids', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { deleted: 3 })
  }

  const httpClient = createClient()
  const permissions = new PermissionsResource(httpClient)

  const result = await permissions.bulkDelete('ws-1', ['p1', 'p2', 'p3'])

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/permission/bulk`)
  assert.equal(capturedInit.method, 'DELETE')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.deepEqual(parsedBody.ids, ['p1', 'p2', 'p3'])

  assert.equal(result.deleted, 3)
})

// ── importCsv ──

test('importCsv calls POST /v1/scope/{scopeId}/permission/import-csv with csv content', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { imported: 5, errors: [] })
  }

  const httpClient = createClient()
  const permissions = new PermissionsResource(httpClient)

  const csv = 'resource,action,effect\ndocuments,read,allow\ndocuments,write,allow'
  const result = await permissions.importCsv('ws-1', csv)

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/permission/import-csv`)
  assert.equal(capturedInit.method, 'POST')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.equal(parsedBody.csv, csv)

  assert.equal(result.imported, 5)
  assert.equal(result.errors.length, 0)
})

test('importCsv returns errors array from import result', async () => {
  globalThis.fetch = async () =>
    mockResponse(200, {
      imported: 2,
      errors: [
        { row: 3, message: 'Invalid effect value' },
        { row: 5, message: 'Missing resource' },
      ],
    })

  const httpClient = createClient()
  const permissions = new PermissionsResource(httpClient)

  const result = await permissions.importCsv('ws-1', 'csv content')

  assert.equal(result.imported, 2)
  assert.equal(result.errors.length, 2)
  assert.equal(result.errors[0].row, 3)
  assert.equal(result.errors[0].message, 'Invalid effect value')
})

// ── Error propagation ──

test('error propagates from HttpClient through resource methods', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 404,
    statusText: 'Not Found',
    text: async () => JSON.stringify({ error: 'permission not found' }),
  })

  const httpClient = createClient()
  const permissions = new PermissionsResource(httpClient)

  await assert.rejects(
    () => permissions.getById('ws-1', 'nonexistent'),
    (err) => {
      assert.equal(err.status, 404)
      assert.equal(err.name, 'WardenAuthApiError')
      return true
    }
  )
})
