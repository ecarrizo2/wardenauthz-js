# WardenAuthz TypeScript SDK

[![CI](https://github.com/ecarrizo2/wardenauthz-js/actions/workflows/ci.yml/badge.svg)](https://github.com/ecarrizo2/wardenauthz-js/actions/workflows/ci.yml) [![npm](https://img.shields.io/npm/v/@ecarrizo2/wardenauthz-js)](https://www.npmjs.com/package/@ecarrizo2/wardenauthz-js) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official TypeScript/JavaScript client for [WardenAuthz](https://wardenauthz.com) — fine-grained, multi-tenant role-based access control for serverless SaaS.

## Installation

```bash
npm install @ecarrizo2/wardenauthz-js
```

## Quick Start

```typescript
import { WardenAuthClient } from '@ecarrizo2/wardenauthz-js'

const rbac = new WardenAuthClient({
  apiUrl: 'https://api.wardenauthz.com',
  apiKey: process.env.WARDENAUTHZ_API_KEY!,
})

const { allowed } = await rbac.access.hasAccess({
  subjectId: 'user-123',
  scopeId: 'workspace-abc',
  resource: 'documents',
  action: 'read',
})

if (!allowed) {
  throw new Error('Forbidden')
}
```

## CLI Usage

The package ships with an `ec-warden-auth` CLI for declarative authorization manifests:

```bash
ec-warden-auth apply \
  --scope-id workspace-abc \
  --file ./authorization-manifest.yaml \
  --dry-run \
  --idempotency-key deploy-2026-08-10
```

Alternative command form:

```bash
ec-warden-auth manifest apply --scope-id workspace-abc --file ./manifest.json
```

Supports JSON and YAML manifests. Auto-detects format by file extension (`--format json|yaml` for explicit).

## Resources

### `rbac.access` — Access Evaluation

```typescript
// Single check
const { allowed } = await rbac.access.hasAccess({
  subjectId: 'user-123', scopeId: 'workspace-abc',
  resource: 'documents', action: 'read',
})

// M2M self-check — the authenticated API key is the subject (no subjectId)
const { allowed: selfAllowed } = await rbac.access.hasAccessSelf({
  scopeId: 'workspace-abc', resource: 'orders', action: 'find-by-id',
})

// Bulk check
const results = await rbac.access.hasAccessBulk([
  { subjectId: 'user-123', scopeId: 'workspace-abc', resource: 'documents', action: 'read' },
  { subjectId: 'user-123', scopeId: 'workspace-abc', resource: 'documents', action: 'write' },
])

// List effective permissions for a subject
const { permissions } = await rbac.access.listPermissions({
  subjectId: 'user-123', scopeId: 'workspace-abc',
})

// List effective roles for a subject
const { roles } = await rbac.access.listRoles({
  subjectId: 'user-123', scopeId: 'workspace-abc',
})

// Simulate access (what-if analysis)
const simResult = await rbac.access.simulate({
  subjectId: 'user-123', scopeId: 'ws-1',
  checks: [{ resource: 'documents', action: 'delete' }],
  permissions: [{ id: 'documents:read', resource: 'documents', action: 'read', effect: 'allow' }],
  roles: [], subjectRoleIds: [],
})

// Permission receipts — portable, HMAC-signed proof of a decision (non-repudiation)
const { receipt, decision } = await rbac.access.issueReceipt({
  subjectId: 'user-123', resource: 'documents', action: 'read',
})
const { valid, claims, reason } = await rbac.access.verifyReceipt({ receipt })
```

### `rbac.permissions` — Permission Management

```typescript
// Create
await rbac.permissions.create('workspace-abc', {
  id: 'documents:read', resource: 'documents', action: 'read', effect: 'allow',
  name: 'Read Documents', description: 'Can view documents',
})

// List with cursor pagination
const { items, nextToken } = await rbac.permissions.list('workspace-abc', { limit: 50 })
const page2 = await rbac.permissions.list('workspace-abc', { limit: 50, nextToken })

// Get by ID
const perm = await rbac.permissions.getById('workspace-abc', 'documents:read')

// Bulk create (seeding)
await rbac.permissions.bulkCreate('workspace-abc', [
  { id: 'documents:read', resource: 'documents', action: 'read', effect: 'allow', name: 'Read Documents' },
  { id: 'documents:write', resource: 'documents', action: 'write', effect: 'allow', name: 'Write Documents' },
])

// Update
await rbac.permissions.update('workspace-abc', 'documents:read', { name: 'View Documents' })

// Delete
await rbac.permissions.delete('workspace-abc', 'documents:read')
```

### `rbac.roles` — Role Management

```typescript
// Create a role
await rbac.roles.create('workspace-abc', {
  id: 'editor', name: 'Editor',
  permissionIds: ['documents:read', 'documents:write'],
})

// List roles
const { items } = await rbac.roles.list('workspace-abc', { limit: 20 })

// Get by ID
const role = await rbac.roles.getById('workspace-abc', 'editor')

// Update (reassign permissions)
await rbac.roles.update('workspace-abc', 'editor', {
  permissionIds: ['documents:read'],
})

// Delete
await rbac.roles.delete('workspace-abc', 'editor')
```

### `rbac.accessPolicies` — Policy Assignment

```typescript
// Assign roles/permissions to a subject
const policy = await rbac.accessPolicies.create('workspace-abc', {
  subjectId: 'user-123',
  roleIds: ['editor'],
  permissionIds: ['billing:read'], // optional direct permissions
  expiresAt: '2026-12-31T23:59:59Z', // optional expiry
})

// List by scope
const items = await rbac.accessPolicies.listByScope('workspace-abc')

// List by subject
const policies = await rbac.accessPolicies.listBySubject('user-123')

// Update
await rbac.accessPolicies.update('workspace-abc', policyId, { roleIds: ['viewer'] })

// Revoke
await rbac.accessPolicies.delete('workspace-abc', policyId)
```

### `rbac.scopes` — Scope Management

```typescript
// Create a workspace under an org
await rbac.scopes.create({
  id: 'workspace-abc', name: 'Acme Corp',
  type: 'workspace', parentId: 'org-xyz',
})

// Clone a scope (deep copy permissions, roles, and policies)
await rbac.scopes.clone('source-scope', {
  id: 'new-scope', name: 'Cloned Workspace',
})

// List
const { items } = await rbac.scopes.list({ type: 'workspace', limit: 20 })

// Get by ID
const scope = await rbac.scopes.getById('workspace-abc')

// Update
await rbac.scopes.update('workspace-abc', { name: 'Acme Corp v2' })

// Delete
await rbac.scopes.delete('workspace-abc')

// Apply declarative manifest (create and delete modes)
const result = await rbac.scopes.applyManifest('workspace-abc', {
  serialization: 'yaml',
  manifest: {
    apiVersion: 'access-control.barksoft/v1alpha1',
    kind: 'AuthorizationManifest',
    spec: {
      mode: 'authoritative',
      deletionPolicy: 'delete-missing',
      permissions: [
        { id: 'documents:read', name: 'Read Documents', resource: 'documents', action: 'read', effect: 'allow' },
      ],
      roles: [
        { id: 'viewer', name: 'Viewer', permissionIds: ['documents:read'] },
      ],
      accessPolicies: [
        { subjectId: 'user-1', roleIds: ['viewer'] },
      ],
    },
  },
})
// result: { scopeId, dryRun, manifestHash, summary: { totalPlanned, applied, planned, failed }, operations }
```

### `rbac.apiKeys` — API Key Management

```typescript
// Create
const { key, keyId } = await rbac.apiKeys.create('workspace-abc', {
  name: 'Production key', type: 'management',
})

// List keys (masked)
const { items } = await rbac.apiKeys.list('workspace-abc')

// Rotate
await rbac.apiKeys.rotate('workspace-abc', keyId)

// Delete (revoke)
await rbac.apiKeys.delete('workspace-abc', keyId)
```

### `rbac.webhooks` — Webhook Endpoints

```typescript
// Create
const { secret, id } = await rbac.webhooks.create('workspace-abc', {
  url: 'https://your-app.com/webhooks/rbac',
  events: ['permission.created', 'role.updated', 'access-policy.created'],
  active: true,
})

// List
const { items } = await rbac.webhooks.list('workspace-abc')

// Update
await rbac.webhooks.update('workspace-abc', id, { events: ['access-policy.deleted'] })

// Send a test delivery
await rbac.webhooks.test('workspace-abc', id)

// List delivery history
const deliveries = await rbac.webhooks.listDeliveries('workspace-abc', id)

// Delete
await rbac.webhooks.delete('workspace-abc', id)
```

### `rbac.resourceTypes` — Resource Catalog

```typescript
// Define a resource type
await rbac.resourceTypes.create('workspace-abc', {
  id: 'documents', name: 'Documents', description: 'User-created documents',
})

// List resource types
const { items } = await rbac.resourceTypes.list('workspace-abc')

// Update
await rbac.resourceTypes.update('workspace-abc', 'documents', { description: 'Shared documents' })

// Delete
await rbac.resourceTypes.delete('workspace-abc', 'documents')
```

### `rbac.tuples` — Relationship Tuples

```typescript
// Write relationship tuples (creates and deletes)
const { written, deleted } = await rbac.tuples.write('scope-1', {
  writes: [
    { subject: 'alice', relation: 'editor', object: 'document:123' },
    { subject: 'bob', relation: 'viewer', object: 'document:123' },
  ],
  deletes: [{ subject: 'charlie', relation: 'viewer', object: 'document:123' }],
})

// List tuples for a subject
const { tuples, nextToken } = await rbac.tuples.list('scope-1', 'alice')

// List subjects with access to a resource
const { tuples: subjects } = await rbac.tuples.listByResource('scope-1', 'document', '123')
```

### `rbac.audit` — Audit Logs

```typescript
// Paginate through audit events
const { items, nextToken } = await rbac.audit.list('workspace-abc', { limit: 50 })

// Export audit events (CSV or JSON)
const csv = await rbac.audit.export({
  scopeId: 'workspace-abc', format: 'csv',
  eventTypes: ['permission.created', 'role.updated'],
  startDate: '2026-01-01', endDate: '2026-06-01',
})

// Verify HMAC signatures for tamper detection (SOC2)
const result = await rbac.audit.verify({
  scopeId: 'workspace-abc',
  startDate: '2026-01-01', endDate: '2026-06-01',
})
```

### `rbac.sessionTokens` — Session Tokens

```typescript
// Mint a session token
const { token, expiresAt } = await rbac.sessionTokens.mint({
  subjectId: 'user-123', scopeId: 'workspace-abc',
})

// Mint with intent (restricted scope)
const intentResult = await rbac.sessionTokens.mintWithIntent({
  subjectId: 'user-123', scopeId: 'workspace-abc',
  resources: ['documents'], actions: ['read'],
})

// Verify an intent call
await rbac.sessionTokens.verifyIntentCall({ token: '...', resource: 'documents', action: 'read' })

// Revoke
await rbac.sessionTokens.revoke('jti-123')
```

### `rbac.sodConstraints` — Separation of Duties

```typescript
// Create constraint
await rbac.sodConstraints.create('workspace-abc', {
  id: 'approver-submitter',
  name: 'Approver cannot be Submitter',
  mutuallyExclusiveRoleIds: ['approver', 'submitter'],
})

// List
const constraints = await rbac.sodConstraints.list('workspace-abc')

// Delete
await rbac.sodConstraints.delete('workspace-abc', 'approver-submitter')
```

### `rbac.teamMembers` — Team Management

```typescript
// Add a member
await rbac.teamMembers.add('workspace-abc', {
  subjectId: 'user-456', role: 'admin',
})

// List members
const members = await rbac.teamMembers.list('workspace-abc')

// Remove
await rbac.teamMembers.remove('workspace-abc', 'user-456')
```

### `rbac.mcpServers` — MCP Integrations

```typescript
// Create an MCP server integration
await rbac.mcpServers.create('workspace-abc', {
  id: 'claude-internal', name: 'Claude Internal Tools',
})

// List
const servers = await rbac.mcpServers.list('workspace-abc')

// Get by ID
const server = await rbac.mcpServers.getById('workspace-abc', 'claude-internal')

// Update
await rbac.mcpServers.update('workspace-abc', 'claude-internal', { name: 'Updated Name' })

// Delete
await rbac.mcpServers.delete('workspace-abc', 'claude-internal')
```

### `rbac.consent` — MCP Consent & Approvals

```typescript
// List servers requiring consent
const servers = await rbac.consent.getServers('workspace-abc')

// Get consent context for a server
const ctx = await rbac.consent.getContext('server-key', 'workspace-abc')

// Get full portal context (all servers with access-aware tool views)
const portalContext = await rbac.consent.getPortalContext('workspace-abc')

// Grant consent
await rbac.consent.grant({ authRequestId: 'req-1', serverKey: 'sk', toolId: 'tool-1' })

// Deny
await rbac.consent.deny('req-1')

// List active grants
const grants = await rbac.consent.listGrants()

// Revoke a grant
await rbac.consent.revokeGrant('grant-1')

// List pending approvals
const approvals = await rbac.consent.listApprovals()

// Approve/deny an approval with optional reason
await rbac.consent.approveApproval('id-1', 'Approved by admin')
await rbac.consent.denyApproval('id-2', 'Policy violation')

// Approval history
const history = await rbac.consent.listApprovalHistory()

// Push notification support
const { enabled, publicKey } = await rbac.consent.getPushPublicKey()
await rbac.consent.subscribePush({ endpoint: '...', keys: { p256dh: '...', auth: '...' } })
await rbac.consent.unsubscribePush('endpoint-url')

// Velocity config
const config = await rbac.consent.getVelocityConfig()
await rbac.consent.updateVelocityConfig({ enabled: true, perGrantPerMinute: 10 })

// User assignments
const assignments = await rbac.consent.listAssignments('ws-1', 'user-1')
await rbac.consent.setAssignment('ws-1', 'user-1', 'server-key', 'medium', { tool: ['read'] })
await rbac.consent.deleteAssignment('ws-1', 'user-1', 'server-key')
```

### `rbac.agent` — Agent Identity & Access

```typescript
// Identify an agent
const { agentId } = await rbac.agent.identify('ws-1', { name: 'Claude', version: '3.5' })

// Check agent access
const { allowed } = await rbac.agent.check('ws-1', {
  agentId: 'agent-123', resource: 'documents', action: 'read',
})
```

## Error Handling

```typescript
import { WardenAuthApiError, WardenAuthRetryError } from '@ecarrizo2/wardenauthz-js'

try {
  await rbac.permissions.getById('workspace-abc', 'unknown')
} catch (err) {
  if (err instanceof WardenAuthRetryError) {
    console.error(`Request failed after ${err.attempts} retry attempts`)
  } else if (err instanceof WardenAuthApiError) {
    console.error(`API error ${err.status}:`, err.body)
  }
}
```

### Error Classes

| Class                    | Name                      | Properties                  |
| ------------------------ | ------------------------- | --------------------------- |
| `WardenAuthApiError`     | `'WardenAuthApiError'`    | `status`, `body`, `message` |
| `WardenAuthRetryError`   | `'WardenAuthRetryError'`  | `status`, `body`, `message`, `attempts` |

`WardenAuthRetryError` extends `WardenAuthApiError`, so `instanceof WardenAuthApiError` matches both.

## Retry Behavior

All HTTP methods automatically retry on transient errors with exponential backoff.

### Retryable Status Codes

| Status | Meaning              |
| ------ | -------------------- |
| 429    | Rate limited         |
| 500    | Internal server error|
| 502    | Bad gateway          |
| 503    | Service unavailable  |
| 504    | Gateway timeout      |

Non-retryable status codes (400, 401, 403, 404, etc.) throw immediately.

### Configuration

```typescript
// Default: maxRetries: 3, baseDelayMs: 1000 (1s, 2s, 4s)

// Per-request: customize retry
await rbac.permissions.list('workspace-abc', {}, {
  retry: { maxRetries: 5, baseDelayMs: 2000 }, // 5 retries, 2s initial delay
})

// Per-request: disable retry entirely
await rbac.permissions.list('workspace-abc', {}, {
  retry: false,
})
```

## Advanced Configuration

### Request Timeouts (Abort Controller)

```typescript
// Built-in helper with 5s timeout
const controller = rbac.createAbortController(5000)

try {
  const { allowed } = await rbac.access.hasAccess(
    { subjectId: 'user-123', scopeId: 'workspace-abc', resource: 'documents', action: 'read' },
    { signal: controller.signal }
  )
} catch (err) {
  if (err.name === 'AbortError') {
    console.error('Request timed out')
  }
}

// Custom AbortController
const controller = new AbortController()
setTimeout(() => controller.abort(), 2000)
await rbac.permissions.list('workspace-abc', {}, { signal: controller.signal })
```

### Connection Keep-Alive

On Node.js runtimes the client installs a tuned global keep-alive dispatcher (60s keep-alive timeout, 128 connections) so repeated calls reuse warm TLS connections. This is a silent no-op in browser/edge runtimes. No configuration required.

### Zod Validation

The SDK exports Zod schemas for all input types:

```typescript
import { schemas } from '@ecarrizo2/wardenauthz-js'

const parsed = schemas.hasAccessInput.parse({
  subjectId: 'user-123', scopeId: 'workspace-abc',
  resource: 'documents', action: 'read',
})
```

Available schemas: `createPermissionInput`, `updatePermissionInput`, `createRoleInput`, `updateRoleInput`, `createAccessPolicyInput`, `updateAccessPolicyInput`, `hasAccessInput`, `accessCheckInput`, `createScopeInput`, `createApiKeyInput`, `createWebhookInput`, `registerOrganizationInput`.

## TypeScript Types

```typescript
import type {
  WardenAuthClientConfig,
  PermissionItem,
  RoleItem,
  AccessPolicyItem,
  ScopeItem,
  ApiKeyItem,
  WebhookEndpointItem,
  AuditLogItem,
  ResourceTypeItem,
  HasAccessResult,
  PaginatedResult,
  Effect,          // 'allow' | 'deny'
  ScopeType,       // 'organization' | 'workspace' | 'application'
  ApiKeyType,      // 'management' | 'application'
  WebhookEventType,
} from '@ecarrizo2/wardenauthz-js'
```

## API Reference

Full API documentation: [https://wardenauthz.com/docs](https://wardenauthz.com/docs)

## License

[MIT](LICENSE) — Copyright (c) 2024 Barksoft
