# Changelog

All notable changes to the `@ecarrizo/access-control` SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-06-26

### Added
- `TierPolicyResource` — `get()`, `update()` for per-scope agent tool trust-tier policy (`allow` / `approve` / `deny`)
- `AccessResource` — `issueReceipt()`, `verifyReceipt()` for HMAC-signed permission receipts (non-repudiation)
- `SessionTokensResource` — `mintWithIntent()`, `verifyIntentCall()`, `revoke()` for intent-bound tokens and runtime HITL
- `OrganizationResource` — `get()`, `update()`, `delete()` for org CRUD
- `ApiKeysResource` — `rotate()`, `revealRotation()`, `updateAutoRotation()` for key lifecycle
- `AuditResource` — `export()` with CSV/JSON format support
- `AccessResource` — `simulate()` for hypothetical permission/role evaluation
- `DashboardResource` — `getStats()` for scope-level metrics and usage
- `SessionTokensResource` — `mint()` for short-lived bearer tokens with permission downscoping
- `TeamMembersResource` — `add()`, `list()`, `remove()` for scope-level team management
- `HttpClient.getRawText()` — for non-JSON responses (CSV exports)

### Changed
- HTTP keep-alive — the client now installs a tuned Node keep-alive dispatcher (longer keep-alive timeout, larger connection pool) so concurrent calls reuse warm TLS connections; a no-op on browser/edge runtimes

## [0.1.0] - Initial Release

### Added
- `AccessControlClient` with resource wrappers for:
  - `ScopesResource` — create, list, get, update, delete, apply manifest
  - `PermissionsResource` — create, bulk create, list, get, update, delete
  - `RolesResource` — create, bulk create, list, get, update, delete, clone
  - `AccessPoliciesResource` — create, list, get, update, delete, list by subject
  - `ApiKeysResource` — create, list, get, delete
  - `WebhooksResource` — create, list, get, update, delete, test, list deliveries
  - `AccessResource` — check access, bulk check, list permissions, list roles
  - `AuditResource` — list audit events
  - `ResourceTypesResource` — create, list, get, delete
  - `OrganizationResource` — IP allowlist, SSO test
- CLI tool (`ec-access-control`) with YAML manifest support
- HTTP client with API key authentication
- Full TypeScript types for all API resources

### Known Gaps
- SSO configuration endpoints not yet wrapped
- Billing/subscription endpoints not yet wrapped
- Import/export endpoints not yet wrapped
- SoD constraint endpoints not yet wrapped
