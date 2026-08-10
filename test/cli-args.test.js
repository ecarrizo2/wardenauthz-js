const test = require('node:test')
const assert = require('node:assert/strict')

const { parseCliArgs, CliArgumentError } = require('../dist/cli/args.js')

test('parseCliArgs parses apply command', () => {
  const parsed = parseCliArgs([
    'apply',
    '--scope-id',
    'scope-1',
    '--file',
    'manifest.yaml',
    '--dry-run',
    '--idempotency-key',
    'idem-123',
    '--api-url',
    'https://api.example.com',
    '--api-key',
    'sk_test',
  ])

  assert.deepEqual(parsed, {
    command: 'apply',
    scopeId: 'scope-1',
    manifestFile: 'manifest.yaml',
    dryRun: true,
    idempotencyKey: 'idem-123',
    apiUrl: 'https://api.example.com',
    apiKey: 'sk_test',
    format: undefined,
  })
})

test('parseCliArgs parses manifest apply alias', () => {
  const parsed = parseCliArgs(['manifest', 'apply', '--scope-id=scope-1', '--file=manifest.json'])

  assert.equal(parsed.command, 'apply')
  assert.equal(parsed.scopeId, 'scope-1')
  assert.equal(parsed.manifestFile, 'manifest.json')
})

test('parseCliArgs throws for missing required args', () => {
  assert.throws(
    () => parseCliArgs(['apply', '--scope-id', 'scope-1']),
    (error) => error instanceof CliArgumentError && error.message.includes('Missing required --file')
  )
})
