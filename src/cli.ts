#!/usr/bin/env node

import { readFile } from 'fs/promises'
import { WardenAuthClient } from './client'
import { parseCliArgs, usageText, CliArgumentError } from './cli/args'
import { CliRuntimeDependencies, runApplyCommand } from './cli/apply'
import { runGenerateCommand } from './cli/generate-command'

function defaultDependencies(): CliRuntimeDependencies {
  return {
    env: process.env,
    readFile: (filePath: string) => readFile(filePath, 'utf8'),
    stdout: (line: string) => {
      console.log(line)
    },
    stderr: (line: string) => {
      console.error(line)
    },
    createClient: (apiUrl: string, apiKey: string) => new WardenAuthClient({ apiUrl, apiKey }),
  }
}

export async function runCli(argv: string[], deps: CliRuntimeDependencies = defaultDependencies()): Promise<number> {
  try {
    const command = parseCliArgs(argv)
    if (command.command === 'help') {
      deps.stdout(usageText())
      return 0
    }

    if (command.command === 'generate') {
      return await runGenerateCommand(command)
    }

    return await runApplyCommand(command, deps)
  } catch (error) {
    if (error instanceof CliArgumentError || (error instanceof Error && error.name === 'CliArgumentError')) {
      deps.stderr(error.message)
      deps.stderr('')
      deps.stderr(usageText())
      return 2
    }

    const message = error instanceof Error ? error.message : 'Unknown CLI error'
    deps.stderr(`Failed to run command: ${message}`)
    return 1
  }
}

async function main(): Promise<void> {
  const exitCode = await runCli(process.argv.slice(2))
  process.exitCode = exitCode
}

if (require.main === module) {
  void main()
}
