export class CliArgumentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CliArgumentError'
  }
}

export interface ApplyCommandArgs {
  command: 'apply'
  scopeId: string
  manifestFile: string
  dryRun: boolean
  idempotencyKey?: string
  format?: 'json' | 'yaml'
  apiUrl?: string
  apiKey?: string
}

export interface GenerateCommandArgs {
  command: 'generate'
  outputGo?: string
  outputOpenApi?: string
  outputFrontendSchemas?: string
}

export interface HelpCommandArgs {
  command: 'help'
}

export type ParsedCommandArgs = ApplyCommandArgs | GenerateCommandArgs | HelpCommandArgs

function getFlagValue(argv: string[], index: number, flagName: string): { value: string; nextIndex: number } {
  const token = argv[index]
  if (!token) {
    throw new CliArgumentError(`Missing value for ${flagName}`)
  }

  if (token.includes('=')) {
    const [, value] = token.split('=', 2)
    if (!value) {
      throw new CliArgumentError(`Missing value for ${flagName}`)
    }

    return { value, nextIndex: index }
  }

  const value = argv[index + 1]
  if (!value || value.startsWith('-')) {
    throw new CliArgumentError(`Missing value for ${flagName}`)
  }

  return { value, nextIndex: index + 1 }
}

function normalizeCommand(argv: string[]): { command: 'apply' | 'generate' | 'help'; startIndex: number } {
  const first = argv[0]
  const second = argv[1]

  if (!first || first === 'help' || first === '--help' || first === '-h') {
    return { command: 'help', startIndex: 0 }
  }

  if (first === 'apply') {
    return { command: 'apply', startIndex: 1 }
  }

  if (first === 'manifest' && second === 'apply') {
    return { command: 'apply', startIndex: 2 }
  }

  if (first === 'generate') {
    return { command: 'generate', startIndex: 1 }
  }

  throw new CliArgumentError(`Unknown command '${first}'. Supported commands: apply, generate`)
}

export function parseCliArgs(argv: string[]): ParsedCommandArgs {
  const normalized = normalizeCommand(argv)
  if (normalized.command === 'help') {
    return { command: 'help' }
  }

  if (normalized.command === 'generate') {
    let outputGo: string | undefined
    let outputOpenApi: string | undefined

    for (let index = normalized.startIndex; index < argv.length; index += 1) {
      const token = argv[index]

      if (token.startsWith('--output-go')) {
        const { value, nextIndex } = getFlagValue(argv, index, '--output-go')
        outputGo = value
        index = nextIndex
        continue
      }

      if (token.startsWith('--output-openapi')) {
        const { value, nextIndex } = getFlagValue(argv, index, '--output-openapi')
        outputOpenApi = value
        index = nextIndex
        continue
      }

      throw new CliArgumentError(`Unknown flag '${token}'`)
    }

    return {
      command: 'generate',
      outputGo,
      outputOpenApi,
    }
  }

  let scopeId: string | undefined
  let manifestFile: string | undefined
  let dryRun = false
  let idempotencyKey: string | undefined
  let format: 'json' | 'yaml' | undefined
  let apiUrl: string | undefined
  let apiKey: string | undefined

  for (let index = normalized.startIndex; index < argv.length; index += 1) {
    const token = argv[index]

    if (token === '--dry-run') {
      dryRun = true
      continue
    }

    if (token.startsWith('--scope-id')) {
      const { value, nextIndex } = getFlagValue(argv, index, '--scope-id')
      scopeId = value
      index = nextIndex
      continue
    }

    if (token.startsWith('--file')) {
      const { value, nextIndex } = getFlagValue(argv, index, '--file')
      manifestFile = value
      index = nextIndex
      continue
    }

    if (token.startsWith('--idempotency-key')) {
      const { value, nextIndex } = getFlagValue(argv, index, '--idempotency-key')
      idempotencyKey = value
      index = nextIndex
      continue
    }

    if (token.startsWith('--format')) {
      const { value, nextIndex } = getFlagValue(argv, index, '--format')
      if (value !== 'json' && value !== 'yaml') {
        throw new CliArgumentError("Invalid --format value. Use 'json' or 'yaml'")
      }
      format = value
      index = nextIndex
      continue
    }

    if (token.startsWith('--api-url')) {
      const { value, nextIndex } = getFlagValue(argv, index, '--api-url')
      apiUrl = value
      index = nextIndex
      continue
    }

    if (token.startsWith('--api-key')) {
      const { value, nextIndex } = getFlagValue(argv, index, '--api-key')
      apiKey = value
      index = nextIndex
      continue
    }

    throw new CliArgumentError(`Unknown flag '${token}'`)
  }

  if (!scopeId) {
    throw new CliArgumentError('Missing required --scope-id')
  }

  if (!manifestFile) {
    throw new CliArgumentError('Missing required --file')
  }

  return {
    command: 'apply',
    scopeId,
    manifestFile,
    dryRun,
    idempotencyKey,
    format,
    apiUrl,
    apiKey,
  }
}

export function usageText(): string {
  return [
    'WardenAuth CLI',
    '',
    'Commands:',
    '  ec-warden-auth apply --scope-id <scopeId> --file <manifest.(json|yaml|yml)> [options]',
    '  ec-warden-auth generate [options]',
    '',
    'Apply Options:',
    '  --dry-run                     Preview operations without writes',
    '  --idempotency-key <key>      Override manifest.spec.idempotencyKey',
    '  --format <json|yaml>         Manifest format (auto-detected from file extension by default)',
    '  --api-url <url>              API base URL (or ACCESS_CONTROL_API_URL env var)',
    '  --api-key <key>              API key (or ACCESS_CONTROL_API_KEY env var)',
    '',
    'Generate Options:',
    '  --output-go <path>           Write generated Go types to file',
    '  --output-openapi <path>      Write generated OpenAPI spec to file',
    '',
  ].join('\n')
}
