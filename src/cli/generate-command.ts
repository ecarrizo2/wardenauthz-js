import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { generate } from '../codegen/generate'
import { generateFrontendSchemas } from '../codegen/frontend-schema-generator'
import { GenerateCommandArgs } from './args'

export interface GenerateCliDependencies {
  stdout: (line: string) => void
  writeFile: (path: string, content: string) => Promise<void>
  mkdir: (path: string) => Promise<void>
}

export function defaultGenerateDeps(): GenerateCliDependencies {
  return {
    stdout: (line: string) => {
      console.log(line)
    },
    writeFile: (path: string, content: string) => writeFile(path, content, 'utf8'),
    mkdir: (path: string) => mkdir(path, { recursive: true }).then(() => {}),
  }
}

export async function runGenerateCommand(
  args: GenerateCommandArgs,
  deps: GenerateCliDependencies = defaultGenerateDeps()
): Promise<number> {
  if (args.outputFrontendSchemas) {
    const result = generateFrontendSchemas()
    await deps.mkdir(args.outputFrontendSchemas)
    for (const file of result.files) {
      const filePath = join(args.outputFrontendSchemas, file.path)
      await deps.writeFile(filePath, file.content)
      deps.stdout(`Written: ${filePath}`)
    }
    deps.stdout(`Frontend schemas generated in ${args.outputFrontendSchemas}`)
    return 0
  }

  const result = generate()

  if (result.goCode) {
    if (args.outputGo) {
      await deps.writeFile(args.outputGo, result.goCode)
      deps.stdout(`Go types written to ${args.outputGo}`)
    } else {
      deps.stdout(result.goCode)
    }
  }

  if (result.openApiYaml) {
    if (args.outputOpenApi) {
      await deps.writeFile(args.outputOpenApi, result.openApiYaml)
      deps.stdout(`OpenAPI spec written to ${args.outputOpenApi}`)
    } else {
      deps.stdout(result.openApiYaml)
    }
  }

  return 0
}
