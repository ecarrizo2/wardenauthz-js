#!/usr/bin/env node
/**
 * Codegen entry point — run from the SDK workspace:
 *   node src/codegen/generate-cli.mjs [--openapi] [--go] [--schemas]
 */
import { generate } from './generate.js'
import { generateFrontendSchemas } from './frontend-schema-generator.js'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..', '..', '..', '..')

const args = process.argv.slice(2)
const all = args.length === 0
const writeOpenApi = all || args.includes('--openapi')
const writeGo = all || args.includes('--go')
const writeSchemas = all || args.includes('--schemas')

try {
  const result = generate({
    outputGo: writeGo,
    outputOpenApi: writeOpenApi,
    openApiTitle: 'WardenAuth API',
    openApiVersion: '1.0.0',
  })

  if (writeOpenApi && result.openApiYaml) {
    const dest = resolve(repoRoot, 'apps', 'web', 'public', 'openapi.yaml')
    writeFileSync(dest, result.openApiYaml)
    console.log(`✅ OpenAPI spec written: ${dest}`)
  }

  if (writeGo && result.goCode) {
    const dest = resolve(repoRoot, 'packages', 'go-sdk', 'types_codegen.go')
    writeFileSync(dest, result.goCode)
    console.log(`✅ Go SDK written: ${dest}`)
  }

  if (writeSchemas) {
    const schemasDir = resolve(repoRoot, 'apps', 'web', 'schemas')
    mkdirSync(schemasDir, { recursive: true })
    const frontendResult = generateFrontendSchemas()
    for (const file of frontendResult.files) {
      const fpath = resolve(schemasDir, file.path)
      writeFileSync(fpath, file.content)
      console.log(`✅ Frontend schema written: ${fpath}`)
    }
    console.log(`✅ ${frontendResult.files.length} frontend schemas written`)
  }
} catch (err) {
  console.error('❌ Codegen failed:', err instanceof Error ? err.message : err)
  process.exit(1)
}
