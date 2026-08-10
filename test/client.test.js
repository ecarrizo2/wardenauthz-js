const test = require('node:test')
const assert = require('node:assert/strict')

// Polyfill DOMException for Node.js versions that lack it (pre-v17)
if (typeof DOMException === 'undefined') {
  globalThis.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message)
      this.name = name
    }
  }
}

const { WardenAuthClient } = require('../dist/client.js')

test('WardenAuthClient initializes with config (apiUrl, apiKey)', () => {
  const client = new WardenAuthClient({
    apiUrl: 'https://api.wardenauthz.test',
    apiKey: 'sk_test_abc123',
  })

  assert.ok(client instanceof WardenAuthClient)
})

test('all 16 resource properties are instantiated', () => {
  const client = new WardenAuthClient({
    apiUrl: 'https://api.wardenauthz.test',
    apiKey: 'sk_test_abc123',
  })

  const expectedResources = [
    'scopes',
    'permissions',
    'roles',
    'accessPolicies',
    'apiKeys',
    'webhooks',
    'access',
    'audit',
    'sessionTokens',
    'sodConstraints',
    'teamMembers',
    'resourceTypes',
    'tuples',
    'mcpServers',
    'consent',
    'agent',
  ]

  for (const resourceName of expectedResources) {
    assert.ok(client[resourceName] !== undefined, `Resource "${resourceName}" should be instantiated`)
    assert.ok(client[resourceName] !== null, `Resource "${resourceName}" should not be null`)
    assert.equal(typeof client[resourceName], 'object', `Resource "${resourceName}" should be an object`)
  }

  assert.equal(expectedResources.length, 16)
})

test('createAbortController returns AbortController', () => {
  const client = new WardenAuthClient({
    apiUrl: 'https://api.wardenauthz.test',
    apiKey: 'sk_test_abc123',
  })

  const controller = client.createAbortController(100)
  assert.ok(controller instanceof AbortController)
  assert.equal(controller.signal.aborted, false)

  // Clean up the timer
  controller.abort()
})

test('createAbortController aborts after timeout', async () => {
  const client = new WardenAuthClient({
    apiUrl: 'https://api.wardenauthz.test',
    apiKey: 'sk_test_abc123',
  })

  const controller = client.createAbortController(10)

  assert.equal(controller.signal.aborted, false)

  await new Promise((resolve) => setTimeout(resolve, 50))

  assert.equal(controller.signal.aborted, true)
})
