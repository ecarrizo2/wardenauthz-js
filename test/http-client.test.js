const test = require('node:test')
const assert = require('node:assert/strict')

const {
  HttpClient,
  WardenAuthApiError,
  WardenAuthRetryError,
  DEFAULT_RETRY_CONFIG,
} = require('../dist/http-client.js')

const BASE_URL = 'https://api.wardenauthz.test'
const API_KEY = 'sk_test_abc123'

function createClient(retryConfig) {
  const client = new HttpClient(BASE_URL, API_KEY)
  if (retryConfig) {
    client.retryConfig = retryConfig
  }
  return client
}

function mockResponse(status, body, statusText) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: statusText || (status >= 200 && status < 300 ? 'OK' : 'Error'),
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  }
}

function captureFetch() {
  const calls = []
  const fn = async function (url, init) {
    calls.push({ url, init })
    return mockResponse(200, { ok: true })
  }
  fn.calls = calls
  return fn
}

let originalFetch

test.beforeEach(() => {
  originalFetch = globalThis.fetch
})

test.afterEach(() => {
  globalThis.fetch = originalFetch
})

// ── GET ──

test('GET request success — verifies URL, headers, response body', async () => {
  const mock = captureFetch()
  globalThis.fetch = mock

  const client = createClient()
  const result = await client.get('/v1/access/check?subjectId=u1')

  assert.equal(mock.calls.length, 1)
  assert.equal(mock.calls[0].url, `${BASE_URL}/v1/access/check?subjectId=u1`)
  assert.equal(mock.calls[0].init.method, 'GET')
  assert.deepEqual(result, { ok: true })
})

test('GET request sets Content-Type and x-api-key headers', async () => {
  const mock = captureFetch()
  globalThis.fetch = mock

  const client = createClient()
  await client.get('/v1/scope/test')

  assert.equal(mock.calls[0].init.headers['Content-Type'], 'application/json')
  assert.equal(mock.calls[0].init.headers['x-api-key'], API_KEY)
})

// ── POST ──

test('POST request — body is JSON-stringified, Content-Type header set', async () => {
  const mock = captureFetch()
  globalThis.fetch = mock

  const client = createClient()
  await client.post('/v1/permissions/create', { resource: 'documents', action: 'read' })

  assert.equal(mock.calls.length, 1)
  assert.equal(mock.calls[0].init.method, 'POST')
  assert.equal(mock.calls[0].init.headers['Content-Type'], 'application/json')
  assert.equal(JSON.parse(mock.calls[0].init.body).resource, 'documents')
  assert.equal(JSON.parse(mock.calls[0].init.body).action, 'read')
})

test('POST returns parsed JSON response', async () => {
  globalThis.fetch = async () => mockResponse(201, { id: 'perm-1', status: 'created' })

  const client = createClient()
  const result = await client.post('/v1/permissions/create', { id: 'perm-1' })

  assert.equal(result.id, 'perm-1')
  assert.equal(result.status, 'created')
})

// ── PATCH ──

test('PATCH request uses correct HTTP method', async () => {
  const mock = captureFetch()
  globalThis.fetch = mock

  const client = createClient()
  await client.patch('/v1/permissions/perm-1', { name: 'Updated' })

  assert.equal(mock.calls[0].init.method, 'PATCH')
})

// ── PUT ──

test('PUT request uses correct HTTP method', async () => {
  const mock = captureFetch()
  globalThis.fetch = mock

  const client = createClient()
  await client.put('/v1/scope/ws-1', { name: 'New Name' })

  assert.equal(mock.calls[0].init.method, 'PUT')
})

// ── DELETE ──

test('DELETE request uses correct HTTP method', async () => {
  const mock = captureFetch()
  globalThis.fetch = mock

  const client = createClient()
  await client.delete('/v1/permissions/perm-1')

  assert.equal(mock.calls[0].init.method, 'DELETE')
})

test('DELETE request with body', async () => {
  const mock = captureFetch()
  globalThis.fetch = mock

  const client = createClient()
  await client.delete('/v1/policies/pol-1', { reason: 'revoked' })

  assert.equal(mock.calls[0].init.method, 'DELETE')
  assert.equal(JSON.parse(mock.calls[0].init.body).reason, 'revoked')
})

// ── Error handling ──

test('400 error throws WardenAuthApiError with correct properties', async () => {
  globalThis.fetch = async () => mockResponse(400, { error: 'invalid_scope_id', message: 'Scope ID is invalid' }, 'Bad Request')

  const client = createClient({ maxRetries: 0, baseDelayMs: 1 })

  await assert.rejects(
    () => client.get('/v1/scope/bad-id'),
    (err) => {
      assert.ok(err instanceof WardenAuthApiError)
      assert.equal(err.name, 'WardenAuthApiError')
      assert.equal(err.status, 400)
      assert.deepEqual(err.body, { error: 'invalid_scope_id', message: 'Scope ID is invalid' })
      assert.ok(err.message.includes('400'))
      return true
    }
  )
})

test('401 error throws WardenAuthApiError', async () => {
  globalThis.fetch = async () => mockResponse(401, { error: 'unauthorized' }, 'Unauthorized')

  const client = createClient({ maxRetries: 0, baseDelayMs: 1 })

  await assert.rejects(
    () => client.get('/v1/scope/ws-1'),
    (err) => {
      assert.ok(err instanceof WardenAuthApiError)
      assert.equal(err.status, 401)
      return true
    }
  )
})

test('403 error throws WardenAuthApiError (non-retryable)', async () => {
  globalThis.fetch = async () => mockResponse(403, { error: 'forbidden' }, 'Forbidden')

  const client = createClient({ maxRetries: 0, baseDelayMs: 1 })

  await assert.rejects(
    () => client.get('/v1/scope/ws-1'),
    (err) => {
      assert.ok(err instanceof WardenAuthApiError)
      assert.equal(err.status, 403)
      return true
    }
  )
})

test('404 error throws WardenAuthApiError', async () => {
  globalThis.fetch = async () => mockResponse(404, { error: 'not_found' }, 'Not Found')

  const client = createClient({ maxRetries: 0, baseDelayMs: 1 })

  await assert.rejects(
    () => client.get('/v1/scope/ws-1/nonexistent'),
    (err) => {
      assert.ok(err instanceof WardenAuthApiError)
      assert.equal(err.status, 404)
      return true
    }
  )
})

// ── Retry behavior ──

test('retries on 429 and succeeds on second attempt', async () => {
  let callCount = 0
  globalThis.fetch = async () => {
    callCount++
    if (callCount === 1) {
      return mockResponse(429, { error: 'rate_limited' }, 'Too Many Requests')
    }
    return mockResponse(200, { allowed: true })
  }

  const client = createClient({ maxRetries: 3, baseDelayMs: 1 })
  const result = await client.get('/v1/access/check')

  assert.equal(callCount, 2)
  assert.equal(result.allowed, true)
})

test('retries on 500 then succeeds on next attempt', async () => {
  let callCount = 0
  globalThis.fetch = async () => {
    callCount++
    if (callCount <= 2) {
      return mockResponse(500, { error: 'internal' }, 'Internal Server Error')
    }
    return mockResponse(200, { ok: true })
  }

  const client = createClient({ maxRetries: 3, baseDelayMs: 1 })
  const result = await client.get('/v1/test')

  assert.equal(callCount, 3)
  assert.equal(result.ok, true)
})

test('retries on 502 then succeeds on next attempt', async () => {
  let callCount = 0
  globalThis.fetch = async () => {
    callCount++
    if (callCount === 1) {
      return mockResponse(502, { error: 'bad_gateway' }, 'Bad Gateway')
    }
    return mockResponse(200, { ok: true })
  }

  const client = createClient({ maxRetries: 3, baseDelayMs: 1 })
  const result = await client.get('/v1/test')

  assert.equal(callCount, 2)
  assert.equal(result.ok, true)
})

test('retries on 503 then succeeds on next attempt', async () => {
  let callCount = 0
  globalThis.fetch = async () => {
    callCount++
    if (callCount === 1) {
      return mockResponse(503, { error: 'service_unavailable' }, 'Service Unavailable')
    }
    return mockResponse(200, { ok: true })
  }

  const client = createClient({ maxRetries: 3, baseDelayMs: 1 })
  const result = await client.get('/v1/test')

  assert.equal(callCount, 2)
  assert.equal(result.ok, true)
})

test('retries on 504 then succeeds on next attempt', async () => {
  let callCount = 0
  globalThis.fetch = async () => {
    callCount++
    if (callCount === 1) {
      return mockResponse(504, { error: 'gateway_timeout' }, 'Gateway Timeout')
    }
    return mockResponse(200, { ok: true })
  }

  const client = createClient({ maxRetries: 3, baseDelayMs: 1 })
  const result = await client.get('/v1/test')

  assert.equal(callCount, 2)
  assert.equal(result.ok, true)
})

test('exhausts retries on 500 and throws WardenAuthRetryError with attempts', async () => {
  let callCount = 0
  globalThis.fetch = async () => {
    callCount++
    return mockResponse(500, { error: 'internal' }, 'Internal Server Error')
  }

  const client = createClient({ maxRetries: 2, baseDelayMs: 1 })

  await assert.rejects(
    () => client.get('/v1/test'),
    (err) => {
      assert.ok(err instanceof WardenAuthRetryError)
      assert.equal(err.name, 'WardenAuthRetryError')
      assert.equal(err.status, 500)
      assert.equal(err.attempts, 3)
      assert.ok(err.message.includes('500'))
      return true
    }
  )

  assert.equal(callCount, 3)
})

test('WardenAuthRetryError includes attempts count', async () => {
  globalThis.fetch = async () => mockResponse(502, { error: 'bad_gateway' }, 'Bad Gateway')

  const client = createClient({ maxRetries: 1, baseDelayMs: 1 })

  await assert.rejects(
    () => client.get('/v1/test'),
    (err) => {
      assert.ok(err instanceof WardenAuthRetryError)
      assert.equal(err.attempts, 2)
      return true
    }
  )
})

test('non-retryable errors (400, 401, 403) do NOT retry', async () => {
  for (const status of [400, 401, 403]) {
    let callCount = 0
    globalThis.fetch = async () => {
      callCount++
      return mockResponse(status, { error: 'client_error' }, 'Client Error')
    }

    const client = createClient({ maxRetries: 3, baseDelayMs: 1 })

    await assert.rejects(
      () => client.get('/v1/test'),
      (err) => {
        assert.ok(err instanceof WardenAuthApiError)
        assert.equal(err.status, status)
        return true
      }
    )

    assert.equal(callCount, 1, `Status ${status} should not have retried`)
  }
})

test('retry can be disabled per-request with retry: false', async () => {
  let callCount = 0
  globalThis.fetch = async () => {
    callCount++
    return mockResponse(500, { error: 'internal' }, 'Internal Server Error')
  }

  const client = createClient({ maxRetries: 3, baseDelayMs: 1 })

  await assert.rejects(
    () => client.get('/v1/test', { retry: false }),
    (err) => {
      assert.ok(err instanceof WardenAuthApiError)
      assert.equal(err.status, 500)
      return true
    }
  )

  assert.equal(callCount, 1)
})

// ── getRawText ──

test('getRawText returns raw text response', async () => {
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => 'raw text content',
  })

  const client = createClient()
  const result = await client.getRawText('/v1/export')

  assert.equal(result, 'raw text content')
})

test('getRawText throws WardenAuthApiError on non-ok response', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    statusText: 'Bad Request',
    text: async () => 'Invalid export format',
  })

  const client = createClient({ maxRetries: 0, baseDelayMs: 1 })

  await assert.rejects(
    () => client.getRawText('/v1/export'),
    (err) => {
      assert.ok(err instanceof WardenAuthApiError)
      assert.equal(err.status, 400)
      assert.equal(err.body, 'Invalid export format')
      return true
    }
  )
})

// ── AbortSignal ──

test('passes AbortSignal to fetch when provided', async () => {
  const mock = captureFetch()
  globalThis.fetch = mock

  const controller = new AbortController()
  const client = createClient()
  await client.get('/v1/test', { signal: controller.signal })

  assert.equal(mock.calls[0].init.signal, controller.signal)
})

// ── DEFAULT_RETRY_CONFIG ──

test('DEFAULT_RETRY_CONFIG has expected values', () => {
  assert.equal(DEFAULT_RETRY_CONFIG.maxRetries, 3)
  assert.equal(DEFAULT_RETRY_CONFIG.baseDelayMs, 1000)
})

// ── Empty response body ──

test('handles empty response body (204 No Content)', async () => {
  globalThis.fetch = async () => ({
    ok: true,
    status: 204,
    statusText: 'No Content',
    text: async () => '',
  })

  const client = createClient()
  const result = await client.delete('/v1/permissions/perm-1')

  assert.equal(result, undefined)
})
