# @ecarrizo/access-control

TypeScript SDK for the [WardenAuth](https://wardenauthz.com) WardenAuth API.

Fine-grained, multi-tenant role-based access control for serverless SaaS — 80× cheaper than Auth0 FGA.

## Installation

```bash
npm install @ecarrizo/access-control
```

## Quick Start

```typescript
import { WardenAuthClient } from '@ecarrizo/access-control'

const rbac = new WardenAuthClient({
  apiUrl: 'https://api.wardenauthz.com',
  apiKey: process.env.ACCESS_CONTROL_API_KEY!,
})

// Check if a user has access
const { allowed } = await rbac.access.hasAccess({
  subjectId: user.id,
  scopeId: workspace.id,
  resource: 'documents',
  action: 'read',
})

if (!allowed) {
  throw new Error('Forbidden')
}
```

## API Reference

## CLI (Declarative Manifest Apply)

The package now ships with an `ec-access-control` CLI for declarative authorization manifest apply:

```bash
# Uses ACCESS_CONTROL_API_URL and ACCESS_CONTROL_API_KEY env vars
ec-access-control apply \
  --scope-id workspace-abc \
  --file ./authorization-manifest.yaml \
  --dry-run \
  --idempotency-key deploy-2025-06-03
```

Supported features:

- JSON or YAML manifest input (`--file`, auto-detected by extension, or `--format`)
- Dry-run apply (`--dry-run`)
- Idempotency key override (`--idempotency-key`) with key echoed in output
- Human-readable apply summary with operation counts/details

Alternative command form:

```bash
ec-access-control manifest apply --scope-id workspace-abc --file ./manifest.json
```

## MCP Endpoint (AI Agent Integrations)

WardenAuth also exposes a Streamable HTTP MCP endpoint at `POST /v1/mcp` with tool `access.hasAccessBulk`.
This is intended for integrations with MCP-capable agent runtimes (for example Claude Desktop-compatible flows or LangChain adapters).

### `rbac.access` — Access Evaluation

```typescript
// Single check
const { allowed } = await rbac.access.hasAccess({
  subjectId: 'user-123',
  scopeId: 'workspace-abc',
  resource: 'documents',
  action: 'read',
})

// Bulk check (multiple resources/actions in one call)
const results = await rbac.access.hasAccessBulk([
  { subjectId: 'user-123', scopeId: 'workspace-abc', resource: 'documents', action: 'read' },
  { subjectId: 'user-123', scopeId: 'workspace-abc', resource: 'documents', action: 'write' },
  { subjectId: 'user-123', scopeId: 'workspace-abc', type: 'role', id: 'editor' },
])
// results: [{ allowed: true, id: 'documents:read', ... }, ...]

// List all effective permissions for a subject
const { permissions } = await rbac.access.listPermissions({
  subjectId: 'user-123',
  scopeId: 'workspace-abc',
})

// List all effective roles for a subject
const { roles } = await rbac.access.listRoles({
  subjectId: 'user-123',
  scopeId: 'workspace-abc',
})

// Permission receipts — portable, HMAC-signed proof of a decision (non-repudiation).
// Verification is metered (no offline check).
const { receipt, decision } = await rbac.access.issueReceipt({
  subjectId: 'user-123',
  resource: 'documents',
  action: 'read',
})

const { valid, claims, reason } = await rbac.access.verifyReceipt({ receipt })
```

### `rbac.permissions` — Permission Management

```typescript
// Create a permission
await rbac.permissions.create('workspace-abc', {
  id: 'documents:read',
  resource: 'documents',
  action: 'read',
  effect: 'allow',
  name: 'Read Documents',
})

// List with cursor pagination
const page1 = await rbac.permissions.list('workspace-abc', { limit: 50 })
const page2 = await rbac.permissions.list('workspace-abc', { limit: 50, nextToken: page1.nextToken })

// Bulk create (for seeding)
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
  id: 'editor',
  name: 'Editor',
  permissionIds: ['documents:read', 'documents:write'],
})

// List roles
const { items } = await rbac.roles.list('workspace-abc', { limit: 20 })

// Assign permissions to a role
await rbac.roles.update('workspace-abc', 'editor', {
  permissionIds: ['documents:read', 'documents:write', 'documents:delete'],
})
```

### `rbac.accessPolicies` — Assign Roles to Subjects

```typescript
// Assign a role to a user in a workspace
await rbac.accessPolicies.create('workspace-abc', {
  subjectId: 'user-123',
  roleIds: ['editor'],
  permissionIds: ['billing:read'], // optional direct permissions
  expiresAt: '2025-12-31T23:59:59Z', // optional expiry
})

// List policies for a scope
const items = await rbac.accessPolicies.listByScope('workspace-abc')

// List policies for a specific user
const userPolicies = await rbac.accessPolicies.listBySubject('user-123')

// Update (change roles/permissions)
await rbac.accessPolicies.update('workspace-abc', policyId, {
  roleIds: ['viewer'],
})

// Revoke
await rbac.accessPolicies.delete('workspace-abc', policyId)
```

### `rbac.scopes` — Scope Management

Scopes represent tenants, workspaces, or any organizational unit. They form a hierarchy: organization → workspace → application.

```typescript
// Create a workspace under an org
await rbac.scopes.create({
  id: 'workspace-abc',
  name: 'Acme Corp',
  type: 'workspace',
  parentId: 'org-xyz',
})

// List all accessible scopes
const { items } = await rbac.scopes.list({ type: 'workspace', limit: 20 })

// Get a specific scope
const scope = await rbac.scopes.getById('workspace-abc')
```

### `rbac.apiKeys` — API Key Management

```typescript
// Create an evaluation key (for access checks in your app)
const { key } = await rbac.apiKeys.create('workspace-abc', {
  name: 'Production evaluation key',
  type: 'evaluation',
})
// Store `key` securely — it's only shown once

// List keys (masked)
const keys = await rbac.apiKeys.list('workspace-abc')

// Revoke a key
await rbac.apiKeys.delete('workspace-abc', keyId)
```

### `rbac.webhooks` — Webhook Endpoints

```typescript
// Register a webhook
const { secret } = await rbac.webhooks.create('workspace-abc', {
  url: 'https://your-app.com/webhooks/rbac',
  events: ['permission.created', 'role.updated', 'access-policy.created'],
  active: true,
})
// Store `secret` to verify webhook signatures

// List webhooks
const { items } = await rbac.webhooks.list('workspace-abc')

// Send a test delivery
await rbac.webhooks.test('workspace-abc', endpointId)
```

### `rbac.resourceTypes` — Resource Catalog

```typescript
// Define a resource type
await rbac.resourceTypes.create('workspace-abc', {
  id: 'documents',
  name: 'Documents',
  description: 'User-created documents',
})

// List resource types
const { items } = await rbac.resourceTypes.list('workspace-abc')
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
// tuples: [{ subject: 'alice', relation: 'editor', object: 'document:123', ... }]

// List subjects with access to a resource
const { tuples: subjects } = await rbac.tuples.listByResource('scope-1', 'document', '123')
// subjects: [{ subject: 'alice', ... }, { subject: 'bob', ... }]
```

### `rbac.audit` — Audit Logs

```typescript
// Paginate through audit events
const { items, nextToken } = await rbac.audit.list('workspace-abc', { limit: 50 })

// Export audit events (CSV or JSON, with optional eventType filter)
const csv = await rbac.audit.export({
  scopeId: 'workspace-abc',
  format: 'csv',
  eventTypes: ['permission.created', 'role.updated'],
  startDate: '2026-01-01',
  endDate: '2026-06-01',
})

// Verify HMAC signatures for tamper detection (SOC2)
const result = await rbac.audit.verify({
  scopeId: 'workspace-abc',
  startDate: '2026-01-01',
  endDate: '2026-06-01',
})
// result: { total: 1420, matched: 1420, mismatchCount: 0, mismatches: [] }
```

## Error Handling

```typescript
import { WardenAuthClient, AccessControlApiError, AccessControlRetryError } from '@ecarrizo/access-control'

try {
  await rbac.permissions.getById('workspace-abc', 'unknown-permission')
} catch (err) {
  if (err instanceof AccessControlRetryError) {
    console.error(`Request failed after ${err.attempts} retry attempts`)
  } else if (err instanceof AccessControlApiError) {
    console.error(`API error ${err.status}:`, err.body)
  }
}
```

## Automatic Retries

All HTTP methods automatically retry on transient errors (429, 500, 502, 503, 504) with exponential backoff. Configure retry behavior globally via the `WardenAuthClientConfig` or per-request via `RequestOptions`:

```typescript
// Global retry config (in WardenAuthClientConfig)
const rbac = new WardenAuthClient({
  apiUrl: '...',
  apiKey: '...',
  // Retry is enabled by default with maxRetries: 3, baseDelayMs: 1000
})

// Per-request: customize retry
await rbac.permissions.list(
  'workspace-abc',
  {},
  {
    retry: { maxRetries: 5, baseDelayMs: 2000 }, // 5 retries, 2s initial delay
  }
)

// Per-request: disable retry entirely
await rbac.permissions.list(
  'workspace-abc',
  {},
  {
    retry: false,
  }
)
```

**Default retry behavior:**

- Retries on status codes: `429`, `500`, `502`, `503`, `504`
- Max 3 retry attempts
- Exponential backoff: 1s, 2s, 4s
- Non-retryable errors (4xx except 429) are thrown immediately

## Connection Keep-Alive

On Node.js runtimes the client installs a tuned global keep-alive dispatcher (longer
keep-alive timeout, larger connection pool) so repeated calls reuse warm TLS
connections instead of paying a handshake each time. This is a no-op in browser/edge
runtimes, where the platform manages keep-alive. No configuration required.

## Request Abort / Timeout

Set per-request abort signals for deadline control:

```typescript
// Manually create an AbortController with a timeout
const controller = rbac.createAbortController(5000) // 5 second timeout

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

// Use with your own AbortController
const controller = new AbortController()
setTimeout(() => controller.abort(), 2000)

await rbac.permissions.list('workspace-abc', {}, { signal: controller.signal })
```

All resource methods accept an optional `RequestOptions` parameter as the last argument:

```typescript
interface RequestOptions {
  signal?: AbortSignal
  retry?: Partial<RetryConfig> | false
}
```

## Zod Validation

Version `0.5.0+` of the SDK exports Zod schemas for all input types. Use them to validate user input before sending to the API:

```typescript
import { z } from 'zod'
import { schemas } from '@ecarrizo/access-control'

// Validate a create permission input
const parsed = schemas.createPermissionInput.parse({
  id: 'documents:read',
  resource: 'documents',
  action: 'read',
  effect: 'allow',
})

// Validate access check input
const check = schemas.hasAccessInput.parse({
  subjectId: 'user-123',
  scopeId: 'workspace-abc',
  resource: 'documents',
  action: 'read',
})

// The SDK also exports inferred TypeScript types from Zod:
import type { CreatePermissionInput, HasAccessInput } from '@ecarrizo/access-control'
```

Available schemas:

| Schema                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `schemas.createPermissionInput`     | Permission creation validation       |
| `schemas.updatePermissionInput`     | Permission update validation         |
| `schemas.createRoleInput`           | Role creation validation             |
| `schemas.updateRoleInput`           | Role update validation               |
| `schemas.createAccessPolicyInput`   | Policy assignment validation         |
| `schemas.updateAccessPolicyInput`   | Policy update validation             |
| `schemas.hasAccessInput`            | Access check input validation        |
| `schemas.accessCheckInput`          | Bulk check item validation           |
| `schemas.createScopeInput`          | Scope creation validation            |
| `schemas.createApiKeyInput`         | API key creation validation          |
| `schemas.createWebhookInput`        | Webhook creation validation          |
| `schemas.registerOrganizationInput` | Organization registration validation |

## Express / Next.js Middleware Example

```typescript
import { WardenAuthClient } from '@ecarrizo/access-control'

const rbac = new WardenAuthClient({
  apiUrl: process.env.ACCESS_CONTROL_API_URL!,
  apiKey: process.env.ACCESS_CONTROL_API_KEY!,
})

// Express middleware
function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { allowed } = await rbac.access.hasAccess({
      subjectId: req.user.id,
      scopeId: req.workspace.id,
      resource,
      action,
    })

    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}

// Usage
app.delete('/documents/:id', requirePermission('documents', 'delete'), deleteDocument)
```

## Next.js App Router Example

```typescript
// app/api/documents/route.ts
import { rbac } from '@/lib/rbac'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { userId, workspaceId } = await getSession(req)

  const { allowed } = await rbac.access.hasAccess({
    subjectId: userId,
    scopeId: workspaceId,
    resource: 'documents',
    action: 'delete',
  })

  if (!allowed) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ... delete document
}
```

## TypeScript Types

All methods are fully typed. Key types exported from the package:

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
  Effect, // 'allow' | 'deny'
  ScopeType, // 'organization' | 'workspace' | 'application'
  ApiKeyType, // 'management' | 'evaluation'
  WebhookEventType,
} from '@ecarrizo/access-control'
```

## Links

- [Documentation](https://wardenauthz.com/docs)
- [Pricing](https://wardenauthz.com/pricing)
- [Dashboard](https://wardenauthz.com/dashboard)

## License

Proprietary — see the main repository [LICENSE](../../LICENSE).
