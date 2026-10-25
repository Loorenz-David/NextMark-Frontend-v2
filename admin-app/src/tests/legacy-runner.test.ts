import { it } from 'vitest'

const legacyTests = import.meta.glob<Record<string, unknown>>('/src/**/*.test.ts')

for (const [path, load] of Object.entries(legacyTests)) {
  if (path.endsWith('/legacy-runner.test.ts') || path.endsWith('.vitest.test.ts')) continue

  it(path, async () => {
    const module = await load()
    const runners = Object.entries(module).filter(
      ([name, value]) => /^run\w+Tests$/.test(name) && typeof value === 'function',
    )
    for (const [, runner] of runners) {
      await (runner as () => void | Promise<void>)()
    }
  })
}
