import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { AstroIntegration } from 'astro'

// Astro 5 keeps its development content store in .astro regardless of cacheDir.
// Allow one writer per project; the desktop manager discovers and reuses it.
export default function sharedPreview(): AstroIntegration {
  let registration: URL
  let root: string
  let token: string

  const readOwner = () => JSON.parse(readFileSync(registration, 'utf8'))
  const writeOwner = (port: number | null) => {
    writeFileSync(registration, JSON.stringify({ pid: process.pid, root, token, port }))
  }

  return {
    name: 'island-shared-preview',
    hooks: {
      'astro:config:setup': ({ config, command }) => {
        if (command !== 'dev') return
        root = fileURLToPath(config.root)
        registration = new URL('.astro/island-preview.json', config.root)
        mkdirSync(new URL('.astro/', config.root), { recursive: true })
        for (let attempt = 0; attempt < 3; attempt++) {
          token = randomUUID()
          try {
            writeFileSync(
              registration,
              JSON.stringify({ pid: process.pid, root, token, port: null }),
              {
                flag: 'wx'
              }
            )
            process.once('exit', () => {
              try {
                if (readOwner().token === token) unlinkSync(registration)
              } catch {
                /* Already removed during shutdown. */
              }
            })
            return
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
          }
          const owner = readOwner()
          if (!Number.isInteger(owner.pid) || owner.pid <= 0 || typeof owner.token !== 'string') {
            throw new Error('Invalid preview registration: ' + fileURLToPath(registration))
          }
          // Config reloads belong to the same server and keep the same identity.
          if (owner.pid === process.pid) {
            token = owner.token
            return
          }
          try {
            process.kill(owner.pid, 0)
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ESRCH') {
              // Recheck before removing a crashed process's registration.
              if (readOwner().token === owner.token) unlinkSync(registration)
              continue
            }
            throw error
          }
          const location = owner.port
            ? `http://127.0.0.1:${owner.port}`
            : `PID ${owner.pid} (starting)`
          throw new Error(
            `Website preview is already running at ${location}. Reuse it to avoid concurrent Astro content-cache writes.`
          )
        }
        throw new Error('Could not claim the website preview. Please retry.')
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use('/__island_preview', (request, response, next) => {
          if (request.method !== 'GET' || request.url !== '/') return next()
          response.setHeader('Content-Type', 'application/json')
          response.setHeader('Cache-Control', 'no-store')
          response.end(JSON.stringify({ root, token }))
        })
      },
      'astro:server:start': ({ address }) => writeOwner(address.port)
    }
  }
}
