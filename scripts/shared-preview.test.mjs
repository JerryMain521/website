import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const source = readFileSync(new URL('../src/plugins/shared-preview.ts', import.meta.url), 'utf8')
const code = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
}).outputText
const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64')
const { default: sharedPreview } = await import(moduleUrl)

test('one cache writer per project; reload, duplicate launch, crash recovery and exit cleanup', () => {
  const folder = mkdtempSync(join(tmpdir(), 'island-preview-check-'))
  const root = pathToFileURL(folder + '/')
  const registration = join(folder, '.astro/island-preview.json')
  const setup = (integration, command = 'dev') =>
    integration.hooks['astro:config:setup']({ config: { root }, command })
  try {
    const first = sharedPreview()
    setup(first)
    first.hooks['astro:server:start']({ address: { port: 4322 } })
    const owner = JSON.parse(readFileSync(registration, 'utf8'))
    setup(sharedPreview())
    assert.deepEqual(JSON.parse(readFileSync(registration, 'utf8')), owner)
    setup(sharedPreview(), 'build')
    assert.deepEqual(JSON.parse(readFileSync(registration, 'utf8')), owner)
    const launch = `const {default: sharedPreview} = await import(${JSON.stringify(moduleUrl)}); const i = sharedPreview(); i.hooks['astro:config:setup']({config: {root: new URL(${JSON.stringify(root.href)})}, command:'dev'});`
    const duplicate = spawnSync(process.execPath, ['--input-type=module', '-e', launch], {
      encoding: 'utf8'
    })
    assert.notEqual(duplicate.status, 0)
    assert.match(duplicate.stderr, /already running at http:\/\/127\.0\.0\.1:4322/)
    assert.deepEqual(JSON.parse(readFileSync(registration, 'utf8')), owner)
    // A killed server leaves a registration. A new process may reclaim it.
    writeFileSync(registration, JSON.stringify({ ...owner, pid: 2147483647 }))
    const recovered = spawnSync(process.execPath, ['--input-type=module', '-e', launch], {
      encoding: 'utf8'
    })
    assert.equal(recovered.status, 0, recovered.stderr)
    assert.throws(() => readFileSync(registration), { code: 'ENOENT' })
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
})
