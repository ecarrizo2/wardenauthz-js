import { WardenAuthClient } from '../client'
import { ApplyScopeManifestResult } from '../types'
import { ApplyCommandArgs, CliArgumentError } from './args'
import { parseManifestFile } from './manifest'

export interface CliRuntimeDependencies {
  env: Record<string, string | undefined>
  readFile: (filePath: string) => Promise<string>
  stdout: (line: string) => void
  stderr: (line: string) => void
  createClient: (apiUrl: string, apiKey: string) => Pick<WardenAuthClient, 'scopes'>
}

function buildOperationSummary(result: ApplyScopeManifestResult): string {
  return [
    `Scope: ${result.scopeId}`,
    `Dry run: ${result.dryRun ? 'yes' : 'no'}`,
    `Idempotency key: ${result.idempotencyKey ?? '(none)'}`,
    `Manifest hash: ${result.manifestHash}`,
    `Operations: total=${result.summary.totalPlanned}, applied=${result.summary.applied}, planned=${result.summary.planned}, failed=${result.summary.failed}`,
  ].join('\n')
}

function buildOperationLines(result: ApplyScopeManifestResult): string[] {
  return result.operations.map((operation) => {
    const suffix = operation.error ? ` (${operation.error})` : ''
    return ` - ${operation.resourceType} ${operation.operation} ${operation.resourceKey}: ${operation.status}${suffix}`
  })
}

export async function runApplyCommand(command: ApplyCommandArgs, deps: CliRuntimeDependencies): Promise<number> {
  const apiUrl = command.apiUrl ?? deps.env.ACCESS_CONTROL_API_URL
  const apiKey = command.apiKey ?? deps.env.ACCESS_CONTROL_API_KEY

  if (!apiUrl) {
    throw new CliArgumentError('Missing API URL. Provide --api-url or ACCESS_CONTROL_API_URL')
  }

  if (!apiKey) {
    throw new CliArgumentError('Missing API key. Provide --api-key or ACCESS_CONTROL_API_KEY')
  }

  const manifestRaw = await deps.readFile(command.manifestFile)
  const parsedManifest = parseManifestFile(command.manifestFile, manifestRaw, command.format)

  const manifest = {
    ...parsedManifest.manifest,
    spec: {
      ...parsedManifest.manifest.spec,
      ...(command.dryRun ? { dryRun: true } : {}),
      ...(command.idempotencyKey ? { idempotencyKey: command.idempotencyKey } : {}),
    },
  }

  const client = deps.createClient(apiUrl, apiKey)
  const result = await client.scopes.applyManifest(command.scopeId, {
    manifest,
    serialization: parsedManifest.serialization,
  })

  deps.stdout('Authorization manifest apply result')
  deps.stdout(buildOperationSummary(result))

  if (result.operations.length > 0) {
    deps.stdout('Operation details:')
    for (const line of buildOperationLines(result)) {
      deps.stdout(line)
    }
  }

  return result.summary.failed > 0 ? 1 : 0
}
