import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const SOURCE_ROOT = path.resolve('src')
const WRITE = process.argv.includes('--write')
const CHECK = process.argv.includes('--check')

const EXCLUDED_PREFIXES = [
  'features/templates/printDocument/',
  'features/messaging/emailMessage/components/',
  'shared/map/',
]

const ARBITRARY_HEX_PATTERN =
  /\b(bg|text|border|ring|from|to|via|fill|stroke|divide|shadow|outline)-\[#([0-9a-fA-F]{3,8})\](\/[0-9]+)?/g

const TOKEN_EXPRESSIONS = new Map([
  ['83ccb9', 'var(--accent)'],
  ['67cfc9', 'var(--accent)'],
  ['78d8d2', 'var(--accent)'],
  ['8fe3de', 'var(--accent)'],
  ['a7f0de', 'var(--accent-ink)'],
  ['b9f7e8', 'var(--accent-ink)'],
  ['b8fff5', 'var(--accent-ink)'],
  ['a6f1dc', 'var(--accent-ink)'],
  ['9be9d7', 'var(--accent-ink)'],
  ['94f0e7', 'var(--accent-ink)'],
  ['d8fff3', 'var(--accent-ink)'],
  ['112526', 'var(--accent-on-solid)'],
  ['b42318', 'rgb(var(--danger-state-r))'],
  ['ff8f8f', 'var(--danger-notice-border)'],
  ['ffd1d1', 'var(--danger-notice-ink)'],
  ['0b8a3d', 'rgb(var(--success-deep-r))'],
  ['00c531', 'rgb(var(--success-vivid-r))'],
  ['16c060', 'rgb(var(--success-action-r))'],
  ['131a1b', 'rgb(var(--theme-surface-auth-r))'],
  ['0f172a', 'rgb(var(--theme-surface-slate-r))'],
  ['07100f', 'rgb(var(--theme-surface-map-panel-r))'],
  ['111819', 'var(--page-external)'],
])

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
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

const isExcluded = (relativePath) =>
  EXCLUDED_PREFIXES.some((prefix) => relativePath.startsWith(prefix))

let changedFiles = 0
let totalReplacements = 0
let excludedOccurrences = 0
const totalsByToken = new Map()
const unmapped = new Map()

for (const absolutePath of await walk(SOURCE_ROOT)) {
  const relativePath = path
    .relative(SOURCE_ROOT, absolutePath)
    .split(path.sep)
    .join('/')
  const source = await readFile(absolutePath, 'utf8')

  if (isExcluded(relativePath)) {
    excludedOccurrences += [...source.matchAll(ARBITRARY_HEX_PATTERN)].length
    continue
  }

  let replacements = 0
  const nextSource = source.replace(
    ARBITRARY_HEX_PATTERN,
    (match, utility, rawHex, opacity = '') => {
      const expression = TOKEN_EXPRESSIONS.get(rawHex.toLowerCase())
      if (!expression) {
        unmapped.set(match, (unmapped.get(match) ?? 0) + 1)
        return match
      }

      replacements += 1
      totalReplacements += 1
      totalsByToken.set(
        expression,
        (totalsByToken.get(expression) ?? 0) + 1,
      )
      return `${utility}-[${expression}]${opacity}`
    },
  )

  if (replacements === 0) {
    continue
  }

  changedFiles += 1
  if (WRITE) {
    await writeFile(absolutePath, nextSource)
  }
}

console.log(`Mode: ${WRITE ? 'write' : CHECK ? 'check' : 'dry-run'}`)
console.log(`Files with replacements: ${changedFiles}`)
console.log(`Total replacements: ${totalReplacements}`)
for (const [token, count] of [...totalsByToken].sort(([left], [right]) =>
  left.localeCompare(right),
)) {
  console.log(`  ${token}: ${count}`)
}
console.log(`Excluded occurrences: ${excludedOccurrences}`)

if (unmapped.size > 0) {
  console.error('Unmapped arbitrary hex utilities:')
  for (const [utility, count] of [...unmapped].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    console.error(`  ${utility}: ${count}`)
  }
}

if (CHECK && (totalReplacements > 0 || unmapped.size > 0)) {
  process.exitCode = 1
}
