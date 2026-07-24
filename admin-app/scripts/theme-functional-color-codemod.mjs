import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const SRC_ROOT = path.resolve('src')
const WRITE = process.argv.includes('--write')

const EXCLUDED_PREFIXES = [
  'features/templates/printDocument/',
  'features/messaging/emailMessage/components/',
  'shared/map/',
]

const FUNCTIONAL_COLOR_PATTERN =
  /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0(?:\.\d+)?|1(?:\.0+)?|\.\d+))?\s*\)/g

const FULL_VALUE_TOKENS = new Map([
  ['255,255,255,0.04', '--paper-raised'],
  ['255,255,255,0.05', '--glass-surface-weak'],
  ['255,255,255,0.06', '--rule-subtle'],
  ['255,255,255,0.08', '--color-ligth-bg'],
  ['255,255,255,0.12', '--rule'],
  ['255,255,255,0.22', '--rule-strong'],
  ['14,22,23,0.72', '--glass-overlay'],
  ['239,68,68,1', '--danger-solid'],
])

const EXISTING_CHANNEL_TOKENS = new Map([
  ['104,214,195', '--color-turques-r'],
])

const EXISTING_COLOR_TOKENS = new Map([
  ['131,204,185', '--color-primary'],
  ['96,165,250', '--color-blue-500'],
  ['96,141,232', '--color-dark-blue'],
  ['54,182,194', '--color-green-turquess'],
])

const EXACT_PARITY_CHANNEL_TOKENS = new Map([
  ['15,23,42', '--theme-surface-slate-r'],
  ['15,23,25', '--theme-surface-workspace-r'],
  ['9,16,26', '--theme-surface-popover-r'],
  ['33,45,46', '--theme-surface-control-top-r'],
  ['24,34,35', '--theme-surface-control-bottom-r'],
  ['13,21,22', '--theme-surface-shell-top-r'],
  ['10,17,18', '--theme-surface-shell-mid-r'],
  ['8,14,15', '--theme-surface-shell-deep-r'],
  ['11,18,19', '--theme-surface-shell-solid-r'],
  ['19,29,30', '--theme-surface-editor-top-r'],
  ['16,26,27', '--theme-surface-message-r'],
  ['20,31,32', '--theme-surface-external-r'],
  ['23,35,36', '--theme-surface-time-top-r'],
  ['18,27,28', '--theme-surface-time-bottom-r'],
  ['9,15,16', '--theme-surface-button-hover-r'],
  ['11,21,24', '--theme-surface-avatar-r'],
  ['19,30,34', '--theme-surface-avatar-top-r'],
  ['12,21,24', '--theme-surface-avatar-mid-r'],
  ['7,14,16', '--theme-surface-avatar-bottom-r'],
  ['4,12,22', '--theme-overlay-shadow-r'],
  ['13,31,34', '--theme-accent-on-solid-r'],
  ['255,201,71', '--warning-highlight-r'],
  ['255,205,93', '--warning-state-r'],
  ['226,197,94', '--warning-muted-r'],
  ['255,213,3', '--warning-vivid-r'],
  ['255,223,83', '--warning-marker-r'],
  ['255,236,173', '--warning-copy-r'],
  ['255,120,120', '--danger-highlight-r'],
  ['251,113,133', '--danger-rose-r'],
  ['0,197,49', '--success-vivid-r'],
  ['11,138,61', '--success-deep-r'],
  ['148,163,184', '--neutral-slate-r'],
  ['116,116,116', '--neutral-mid-r'],
  ['120,130,150', '--neutral-cool-r'],
  ['201,218,224', '--neutral-pale-r'],
  ['94,94,94', '--neutral-dark-r'],
])

const formatPercent = (alpha) => {
  const percentage = Number(alpha) * 100
  return Number.isInteger(percentage)
    ? String(percentage)
    : String(Number(percentage.toFixed(4)))
}

const isInsideArbitraryValue = (source, index) => {
  const lineStart = source.lastIndexOf('\n', index) + 1
  const beforeMatch = source.slice(lineStart, index)
  return beforeMatch.lastIndexOf('[') > beforeMatch.lastIndexOf(']')
}

const colorMix = ({ source, index, token, alpha }) => {
  if (Number(alpha) === 1) {
    return `var(${token})`
  }

  const percentage = formatPercent(alpha)
  return isInsideArbitraryValue(source, index)
    ? `color-mix(in_srgb,var(${token})_${percentage}%,transparent)`
    : `color-mix(in srgb, var(${token}) ${percentage}%, transparent)`
}

const channelColor = ({ functionName, token, alpha }) =>
  functionName === 'rgb' && Number(alpha) === 1
    ? `rgb(var(${token}))`
    : `rgba(var(${token}),${alpha})`

const replaceFunctionalColors = (source) => {
  let replacements = 0
  const byToken = new Map()

  const nextSource = source.replace(
    FUNCTIONAL_COLOR_PATTERN,
    (match, red, green, blue, rawAlpha, index) => {
      const alpha = rawAlpha ?? '1'
      const rgbKey = `${red},${green},${blue}`
      const fullKey = `${rgbKey},${Number(alpha)}`
      const functionName = match.startsWith('rgba') ? 'rgba' : 'rgb'

      const fullValueToken = FULL_VALUE_TOKENS.get(fullKey)
      if (fullValueToken) {
        replacements += 1
        byToken.set(fullValueToken, (byToken.get(fullValueToken) ?? 0) + 1)
        return `var(${fullValueToken})`
      }

      if (rgbKey === '255,255,255') {
        replacements += 1
        byToken.set('--foreground-mark', (byToken.get('--foreground-mark') ?? 0) + 1)
        return colorMix({
          source,
          index,
          token: '--foreground-mark',
          alpha,
        })
      }

      const existingChannelToken = EXISTING_CHANNEL_TOKENS.get(rgbKey)
      if (existingChannelToken) {
        replacements += 1
        byToken.set(
          existingChannelToken,
          (byToken.get(existingChannelToken) ?? 0) + 1,
        )
        return channelColor({
          functionName,
          token: existingChannelToken,
          alpha,
        })
      }

      const existingColorToken = EXISTING_COLOR_TOKENS.get(rgbKey)
      if (existingColorToken) {
        replacements += 1
        byToken.set(
          existingColorToken,
          (byToken.get(existingColorToken) ?? 0) + 1,
        )
        return colorMix({
          source,
          index,
          token: existingColorToken,
          alpha,
        })
      }

      const exactParityToken = EXACT_PARITY_CHANNEL_TOKENS.get(rgbKey)
      if (exactParityToken) {
        replacements += 1
        byToken.set(
          exactParityToken,
          (byToken.get(exactParityToken) ?? 0) + 1,
        )
        return channelColor({
          functionName,
          token: exactParityToken,
          alpha,
        })
      }

      return match
    },
  )

  return { nextSource, replacements, byToken }
}

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

const files = await walk(SRC_ROOT)
const totalsByToken = new Map()
let changedFiles = 0
let totalReplacements = 0

for (const absolutePath of files) {
  const relativePath = path
    .relative(SRC_ROOT, absolutePath)
    .split(path.sep)
    .join('/')

  if (isExcluded(relativePath)) {
    continue
  }

  const source = await readFile(absolutePath, 'utf8')
  const result = replaceFunctionalColors(source)

  if (result.replacements === 0) {
    continue
  }

  changedFiles += 1
  totalReplacements += result.replacements
  for (const [token, count] of result.byToken) {
    totalsByToken.set(token, (totalsByToken.get(token) ?? 0) + count)
  }

  if (WRITE) {
    await writeFile(absolutePath, result.nextSource)
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
