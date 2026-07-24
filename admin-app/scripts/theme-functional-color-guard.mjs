import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const appDirectory = path.dirname(scriptDirectory)
const sourceDirectory = path.join(appDirectory, 'src')
const allowlistPath = path.join(
  scriptDirectory,
  'theme-functional-color-allowlist.json',
)

const FUNCTIONAL_COLOR_PATTERN =
  /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0(?:\.\d+)?|1(?:\.0+)?|\.\d+))?\s*\)/g

const normalizeMatch = (match) =>
  `${match[1]},${match[2]},${match[3]},${Number(match[4] ?? 1)}`

const increment = (counts, key) => {
  counts.set(key, (counts.get(key) ?? 0) + 1)
}

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(absolutePath)))
      continue
    }

    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(absolutePath)
    }
  }

  return files
}

const rawAllowlist = await readFile(allowlistPath, 'utf8')
const allowlist = JSON.parse(rawAllowlist)
const excludedPrefixes = Object.keys(allowlist.excludePathPrefixes)
const scopedCounts = new Map()
const excludedCounts = new Map(
  excludedPrefixes.map((prefix) => [prefix, 0]),
)

for (const absolutePath of await walk(sourceDirectory)) {
  const relativePath = path
    .relative(sourceDirectory, absolutePath)
    .split(path.sep)
    .join('/')
  const source = await readFile(absolutePath, 'utf8')
  const excludedPrefix = excludedPrefixes.find((prefix) =>
    relativePath.startsWith(prefix),
  )

  for (const match of source.matchAll(FUNCTIONAL_COLOR_PATTERN)) {
    if (excludedPrefix) {
      increment(excludedCounts, excludedPrefix)
      continue
    }
    increment(scopedCounts, normalizeMatch(match))
  }
}

const expectedScopedCounts = new Map(
  Object.entries(allowlist.allowedScopedValues),
)
const failures = []

for (const key of new Set([
  ...scopedCounts.keys(),
  ...expectedScopedCounts.keys(),
])) {
  const actual = scopedCounts.get(key) ?? 0
  const expected = expectedScopedCounts.get(key) ?? 0
  if (actual !== expected) {
    failures.push(`${key}: expected ${expected}, found ${actual}`)
  }
}

for (const [prefix, expected] of Object.entries(
  allowlist.excludePathPrefixes,
)) {
  const actual = excludedCounts.get(prefix) ?? 0
  if (actual !== expected) {
    failures.push(`${prefix}: expected ${expected}, found ${actual}`)
  }
}

const totalScoped = [...scopedCounts.values()].reduce(
  (sum, count) => sum + count,
  0,
)
console.log(`Approved scoped functional colors: ${totalScoped}`)
for (const prefix of excludedPrefixes) {
  console.log(`Excluded ${prefix}: ${excludedCounts.get(prefix) ?? 0}`)
}

if (failures.length > 0) {
  console.error('Functional-color regression check failed:')
  for (const failure of failures) {
    console.error(`  ${failure}`)
  }
  process.exitCode = 1
}
