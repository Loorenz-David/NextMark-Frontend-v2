import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src')
const excluded = [
  'features/templates/printDocument/',
  'features/messaging/emailMessage/',
  'shared/map/',
]
const mode = process.argv[2] ?? '--dry-run'
if (!['--dry-run', '--write', '--check'].includes(mode) || process.argv.length > 3) {
  throw new Error('Use exactly one of --dry-run, --write or --check')
}

const walk = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const location = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(location))
    else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) files.push(location)
  }
  return files
}

// Match complete utilities, including utilities in template strings and variants.
// The left boundary avoids changing e.g. a background or an arbitrary CSS value.
const typographyUtility = /(^|[^\w./\[\]-])(text-\[([\d.]+)(px|rem)\]|text-md)(?![\w./\[\]-])/gm
const supportedPixels = new Set(['8', '9', '10', '10.5', '11', '12', '12.5', '13', '14', '15', '19'])
const supportedRems = new Set(['0.54', '0.55', '0.58', '0.6', '0.62', '0.64', '0.65', '0.66', '0.68', '0.7', '0.72', '0.8', '0.82', '0.85', '0.95', '0.98', '2', '2.8'])

const mapUtility = (utility, number, unit) => {
  if (utility === 'text-md') return 'text-sm'
  if (unit === 'px') {
    if (!supportedPixels.has(number)) throw new Error(`No typography token for ${utility}`)
    if (number === '10') return 'text-micro'
    if (number === '11') return 'text-2xs'
    if (number === '9') return 'text-nano'
    return `text-px-${number.replace('.', '_')}`
  }
  if (!supportedRems.has(number)) throw new Error(`No typography token for ${utility}`)
  return `text-rem-${number.replace('.', '_')}`
}

let filesWithChanges = 0
let replacements = 0
for (const file of await walk(sourceDirectory)) {
  const relative = path.relative(sourceDirectory, file).split(path.sep).join('/')
  if (excluded.some((prefix) => relative.startsWith(prefix))) continue
  const source = await fs.readFile(file, 'utf8')
  let fileChanges = 0
  const output = source.replace(typographyUtility, (match, prefix, utility, number, unit) => {
    fileChanges += 1
    return `${prefix}${mapUtility(utility, number, unit)}`
  })
  if (fileChanges === 0) continue
  filesWithChanges += 1
  replacements += fileChanges
  console.log(`${relative}: ${fileChanges}`)
  if (mode === '--write') await fs.writeFile(file, output)
}
console.log(`Mode: ${mode}; files: ${filesWithChanges}; replacements: ${replacements}`)
if (mode === '--check' && replacements > 0) process.exitCode = 1
