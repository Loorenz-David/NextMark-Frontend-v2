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

const CLASS_SHADOW_TOKENS = new Map([
  ['0_6px_14px_color-mix(in_srgb,var(--color-green-turquess)_6%,transparent)', '--shadow-button-xs-accent'],
  ['0_8px_18px_rgba(0,0,0,0.14)', '--shadow-button-muted'],
  ['0_8px_18px_rgba(0,0,0,0.16)', '--shadow-button-action'],
  ['0_10px_22px_rgba(0,0,0,0.12)', '--shadow-button-compact'],
  ['0_10px_24px_rgba(0,0,0,0.14)', '--shadow-button-soft'],
  ['0_10px_24px_color-mix(in_srgb,var(--color-primary)_14%,transparent)', '--shadow-button-badge'],
  ['0_12px_26px_rgba(0,0,0,0.18)', '--shadow-button-date'],
  ['0_12px_28px_rgba(0,0,0,0.14)', '--shadow-button-case'],
  ['0_12px_28px_color-mix(in_srgb,var(--color-primary)_10%,transparent)', '--shadow-button-accent-subtle'],
  ['0_16px_34px_rgba(0,0,0,0.18)', '--shadow-button-route'],
  ['0_18px_38px_color-mix(in_srgb,var(--color-primary)_24%,transparent)', '--shadow-button-auth-accent'],
  ['0_18px_40px_rgba(0,0,0,0.18)', '--shadow-button-auth'],
  ['0_10px_24px_rgba(22,49,46,0.18),inset_0_1px_0_var(--paper-raised)', '--shadow-button-calendar-sm'],
  ['0_12px_28px_rgba(22,49,46,0.18),inset_0_1px_0_var(--paper-raised)', '--shadow-button-calendar-md'],
  ['0_10px_22px_rgba(22,49,46,0.18),inset_0_1px_0_var(--paper-raised)', '--shadow-button-calendar-compact'],
  ['inset_0_1px_0_var(--rule-strong),0_10px_22px_rgba(29,74,102,0.14)', '--shadow-button-stop-avatar'],
  ['0_8px_18px_rgba(56,103,108,0.08)', '--shadow-panel-subtle-color'],
  ['0_10px_24px_rgba(0,0,0,0.36)', '--shadow-panel-popover'],
  ['0_12px_30px_rgba(0,0,0,0.12)', '--shadow-panel-section'],
  ['0_14px_32px_rgba(0,0,0,0.18)', '--shadow-panel-notice'],
  ['0_16px_38px_rgba(0,0,0,0.16)', '--shadow-panel-card'],
  ['0_18px_38px_rgba(0,0,0,0.28)', '--shadow-panel-filter'],
  ['0_18px_40px_rgba(0,0,0,0.24)', '--shadow-panel-soft'],
  ['0_18px_40px_rgba(0,0,0,0.26)', '--shadow-panel-floating'],
  ['0_18px_42px_rgba(45,95,170,0.18)', '--shadow-panel-state-soft'],
  ['0_18px_42px_rgba(45,95,170,0.22)', '--shadow-panel-state-strong'],
  ['0_18px_48px_rgba(0,0,0,0.28)', '--shadow-panel-phone'],
  ['0_20px_44px_rgba(var(--theme-overlay-shadow-r),0.45)', '--shadow-panel-overlay-soft'],
  ['0_20px_44px_rgba(var(--theme-overlay-shadow-r),0.55)', '--shadow-panel-overlay-strong'],
  ['0_20px_48px_rgba(0,0,0,0.38)', '--shadow-panel-image'],
  ['0_24px_50px_rgba(0,0,0,0.3)', '--shadow-panel-notifications'],
  ['0_28px_80px_rgba(0,0,0,0.42)', '--shadow-panel-external'],
  ['0_28px_90px_rgba(0,0,0,0.34)', '--shadow-panel-auth'],
])

const INLINE_SHADOW_TOKENS = new Map([
  ['0 14px 32px rgba(0, 0, 0, 0.18)', '--shadow-panel-notice'],
  ['0 16px 34px rgba(0, 0, 0, 0.18)', '--shadow-button-route'],
  [
    'inset 0 1px 0 color-mix(in srgb, var(--foreground-mark) 18%, transparent), 0 10px 22px rgba(29,74,102,0.14)',
    '--shadow-button-avatar',
  ],
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
const totalsByToken = new Map()

for (const absolutePath of await walk(SOURCE_ROOT)) {
  const relativePath = path
    .relative(SOURCE_ROOT, absolutePath)
    .split(path.sep)
    .join('/')

  if (isExcluded(relativePath)) {
    continue
  }

  const source = await readFile(absolutePath, 'utf8')
  let nextSource = source

  for (const [shadow, token] of CLASS_SHADOW_TOKENS) {
    const search = `shadow-[${shadow}]`
    const replacement = `shadow-[var(${token})]`
    const occurrences = nextSource.split(search).length - 1
    if (occurrences === 0) {
      continue
    }
    nextSource = nextSource.split(search).join(replacement)
    totalReplacements += occurrences
    totalsByToken.set(token, (totalsByToken.get(token) ?? 0) + occurrences)
  }

  for (const [shadow, token] of INLINE_SHADOW_TOKENS) {
    const search = `${shadow}`
    const replacement = `var(${token})`
    const occurrences = nextSource.split(search).length - 1
    if (occurrences === 0) {
      continue
    }
    nextSource = nextSource.split(search).join(replacement)
    totalReplacements += occurrences
    totalsByToken.set(token, (totalsByToken.get(token) ?? 0) + occurrences)
  }

  if (nextSource === source) {
    continue
  }

  changedFiles += 1
  if (WRITE) {
    await writeFile(absolutePath, nextSource)
  }
}

console.log(`Mode: ${WRITE ? 'write' : 'dry-run'}`)
console.log(`Files with replacements: ${changedFiles}`)
console.log(`Total replacements: ${totalReplacements}`)
for (const [token, count] of [...totalsByToken].sort(([left], [right]) =>
  left.localeCompare(right),
)) {
  console.log(`  ${token}: ${count}`)
}

if (CHECK && totalReplacements > 0) {
  process.exitCode = 1
}
