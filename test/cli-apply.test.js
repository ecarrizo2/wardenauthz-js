const test = require('node:test')
const assert = require('node:assert/strict')

const { runCli } = require('../dist/cli.js')

test('runCli applies YAML manifest and prints summary', async () => {
  const outputs = []
  let capturedScopeId
  let capturedPayload

  const exitCode = await runCli(
    ['apply', '--scope-id', 'scope-123', '--file', 'manifest.yaml', '--dry-run', '--idempotency-key', 'idem-cli'],
    {
      env: { RBAC_API_URL: 'https://api.example.com', RBAC_API_KEY: 'sk_test' },
      readFile: async () =>
        [
          'apiVersion: access-control.barksoft/v1alpha1',
          'kind: AuthorizationManifest',
          'spec:',
          '  mode: authoritative',
          '  deletionPolicy: delete-missing',
          '  permissions:',
          '    - id: documents_read',
          '      name: Read Documents',
          '      resource: documents',
          '      action: read',
          '      effect: allow',
          '  roles:',
          '    - id: viewer',
          '      name: Viewer',
          '      permissionIds:',
          '        - documents_read',
          '  accessPolicies:',
          '    - subjectId: user-1',
          '      roleIds:',
          '        - viewer',
        ].join('\n'),
      stdout: (line) => outputs.push(line),
      stderr: (line) => outputs.push(`ERR:${line}`),
      createClient: () => ({
        scopes: {
          applyManifest: async (scopeId, payload) => {
            capturedScopeId = scopeId
            capturedPayload = payload
            return {
              scopeId: 'scope-123',
              dryRun: true,
              idempotencyKey: 'idem-cli',
              manifestHash: 'hash-123',
              summary: { totalPlanned: 3, applied: 0, planned: 3, failed: 0 },
              operations: [
                { resourceType: 'permission', operation: 'create', resourceKey: 'documents_read', status: 'planned' },
              ],
            }
          },
        },
      }),
    }
  )

  assert.equal(exitCode, 0)
  assert.equal(capturedScopeId, 'scope-123')
  assert.equal(capturedPayload.serialization, 'yaml')
  assert.equal(capturedPayload.manifest.spec.dryRun, true)
  assert.equal(capturedPayload.manifest.spec.idempotencyKey, 'idem-cli')
  assert.ok(outputs.some((line) => line.includes('Idempotency key: idem-cli')))
  assert.ok(outputs.some((line) => line.includes('Operation details:')))
})

test('runCli returns argument error exit code for missing credentials', async () => {
  const outputs = []

  const exitCode = await runCli(['apply', '--scope-id', 'scope-1', '--file', 'manifest.json'], {
    env: {},
    readFile: async () => '{}',
    stdout: (line) => outputs.push(line),
    stderr: (line) => outputs.push(line),
    createClient: () => {
      throw new Error('should not be called')
    },
  })

  assert.equal(exitCode, 2)
  assert.ok(outputs.some((line) => line.includes('Missing API URL')))
})
