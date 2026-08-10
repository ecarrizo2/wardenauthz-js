const test = require('node:test')
const assert = require('node:assert/strict')

const { HttpClient } = require('../../dist/http-client.js')
const { RolesResource } = require('../../dist/resources/roles.js')

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

test('list calls GET /v1/scope/{scopeId}/role with no params', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { items: [], nextToken: null })
  }

  const httpClient = createClient()
  const roles = new RolesResource(httpClient)

  const result = await roles.list('ws-1')

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/role`)
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
  const roles = new RolesResource(httpClient)

  await roles.list('ws-1', { limit: 50, nextToken: 'page_1' })

  assert.ok(capturedUrl.includes('limit=50'))
  assert.ok(capturedUrl.includes('nextToken=page_1'))
  assert.ok(capturedUrl.startsWith(`${BASE_URL}/v1/scope/ws-1/role?`))
})

test('list returns items correctly', async () => {
  globalThis.fetch = async () =>
    mockResponse(200, {
      items: [
        { id: 'admin', scopeId: 'ws-1', name: 'Admin', permissionIds: ['all:manage'], description: 'Full access' },
        { id: 'viewer', scopeId: 'ws-1', name: 'Viewer', permissionIds: ['docs:read'], description: 'Read only' },
      ],
      nextToken: 'next_page',
    })

  const httpClient = createClient()
  const roles = new RolesResource(httpClient)

  const result = await roles.list('ws-1')

  assert.equal(result.items.length, 2)
  assert.equal(result.items[0].id, 'admin')
  assert.equal(result.items[0].name, 'Admin')
  assert.equal(result.items[0].permissionIds.length, 1)
  assert.equal(result.items[1].id, 'viewer')
  assert.equal(result.items[1].name, 'Viewer')
  assert.equal(result.nextToken, 'next_page')
})

// ── getById ──

test('getById calls GET /v1/scope/{scopeId}/role/{roleId}', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { id: 'editor', scopeId: 'ws-1', name: 'Editor', permissionIds: ['docs:read', 'docs:write'], description: 'Can edit' })
  }

  const httpClient = createClient()
  const roles = new RolesResource(httpClient)

  const result = await roles.getById('ws-1', 'editor')

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/role/editor`)
  assert.equal(capturedInit.method, 'GET')
  assert.equal(result.id, 'editor')
  assert.equal(result.name, 'Editor')
  assert.equal(result.permissionIds.length, 2)
  assert.equal(result.permissionIds[0], 'docs:read')
  assert.equal(result.permissionIds[1], 'docs:write')
})

// ── create ──

test('create calls POST /v1/scope/{scopeId}/role with body including scopeId', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(201, { id: 'editor', scopeId: 'ws-1', name: 'Editor', permissionIds: ['docs:read', 'docs:write'], description: 'Can edit content' })
  }

  const httpClient = createClient()
  const roles = new RolesResource(httpClient)

  const result = await roles.create('ws-1', {
    id: 'editor',
    name: 'Editor',
    permissionIds: ['docs:read', 'docs:write'],
    description: 'Can edit content',
  })

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/role`)
  assert.equal(capturedInit.method, 'POST')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.equal(parsedBody.id, 'editor')
  assert.equal(parsedBody.scopeId, 'ws-1')
  assert.equal(parsedBody.name, 'Editor')
  assert.deepEqual(parsedBody.permissionIds, ['docs:read', 'docs:write'])
  assert.equal(parsedBody.description, 'Can edit content')

  assert.equal(result.id, 'editor')
  assert.equal(result.name, 'Editor')
})

// ── update ──

test('update calls PATCH /v1/scope/{scopeId}/role/{roleId} with input', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { id: 'editor', scopeId: 'ws-1', name: 'Editor', permissionIds: ['docs:read', 'docs:write', 'docs:delete'], description: 'Updated' })
  }

  const httpClient = createClient()
  const roles = new RolesResource(httpClient)

  const result = await roles.update('ws-1', 'editor', {
    permissionIds: ['docs:read', 'docs:write', 'docs:delete'],
    description: 'Updated',
  })

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/role/editor`)
  assert.equal(capturedInit.method, 'PATCH')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.deepEqual(parsedBody.permissionIds, ['docs:read', 'docs:write', 'docs:delete'])
  assert.equal(parsedBody.description, 'Updated')

  assert.equal(result.permissionIds.length, 3)
  assert.equal(result.description, 'Updated')
})

// ── delete ──

test('delete calls DELETE /v1/scope/{scopeId}/role/{roleId}', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(204, '')
  }

  const httpClient = createClient()
  const roles = new RolesResource(httpClient)

  const result = await roles.delete('ws-1', 'viewer')

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/role/viewer`)
  assert.equal(capturedInit.method, 'DELETE')
  assert.equal(result, undefined)
})

// ── clone ──

test('clone calls POST /v1/scope/{targetScopeId}/role/clone-from/{templateRoleId}', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { id: 'editor', scopeId: 'ws-2', name: 'Editor', permissionIds: ['docs:read', 'docs:write'], description: 'Cloned from ws-1' })
  }

  const httpClient = createClient()
  const roles = new RolesResource(httpClient)

  const result = await roles.clone('ws-1', 'editor', 'ws-2')

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-2/role/clone-from/editor`)
  assert.equal(capturedInit.method, 'POST')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.deepEqual(parsedBody, {})

  assert.equal(result.id, 'editor')
  assert.equal(result.scopeId, 'ws-2')
})

// ── bulkDelete ──

test('bulkDelete calls DELETE /v1/scope/{scopeId}/role/bulk with ids', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, { deleted: 2 })
  }

  const httpClient = createClient()
  const roles = new RolesResource(httpClient)

  const result = await roles.bulkDelete('ws-1', ['viewer', 'editor'])

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/role/bulk`)
  assert.equal(capturedInit.method, 'DELETE')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.deepEqual(parsedBody.ids, ['viewer', 'editor'])

  assert.equal(result.deleted, 2)
})

// ── bulkCreate ──

test('bulkCreate calls POST /v1/scope/{scopeId}/role/bulk with roles array', async () => {
  let capturedUrl, capturedInit

  globalThis.fetch = async (url, init) => {
    capturedUrl = url
    capturedInit = init
    return mockResponse(200, {})
  }

  const httpClient = createClient()
  const roles = new RolesResource(httpClient)

  const result = await roles.bulkCreate('ws-1', [
    { id: 'admin', name: 'Admin', permissionIds: ['all:manage'] },
    { id: 'viewer', name: 'Viewer', permissionIds: ['docs:read'] },
  ])

  assert.equal(capturedUrl, `${BASE_URL}/v1/scope/ws-1/role/bulk`)
  assert.equal(capturedInit.method, 'POST')

  const parsedBody = JSON.parse(capturedInit.body)
  assert.equal(parsedBody.roles.length, 2)
  assert.equal(parsedBody.roles[0].id, 'admin')
  assert.equal(parsedBody.roles[0].scopeId, 'ws-1')
  assert.equal(parsedBody.roles[1].id, 'viewer')
})

// ── Error propagation ──

test('error propagates from HttpClient through resource methods', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 404,
    statusText: 'Not Found',
    text: async () => JSON.stringify({ error: 'role not found' }),
  })

  const httpClient = createClient()
  const roles = new RolesResource(httpClient)

  await assert.rejects(
    () => roles.getById('ws-1', 'nonexistent'),
    (err) => {
      assert.equal(err.status, 404)
      assert.equal(err.name, 'WardenAuthApiError')
      return true
    }
  )
})
