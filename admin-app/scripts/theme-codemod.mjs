import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const appDirectory = path.dirname(scriptDirectory)
const sourceDirectory = path.join(appDirectory, 'src')
const mapPath = path.join(scriptDirectory, 'theme-map.json')

const palettePattern =
  '(?:white|black|slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)'
const utilityPattern =
  '(?:bg|text|border|ring|from|to|via|fill|stroke|divide|shadow|outline)'
const tokenBoundaryCharacters = 'A-Za-z0-9_./\\[\\]-'

const paletteUtilityRegex = () =>
  new RegExp(
    `(^|[^${tokenBoundaryCharacters}])` +
      `(${utilityPattern}-${palettePattern}` +
      '(?:-[0-9]{2,3})?' +
      '(?:\\/(?:\\[[0-9.]+\\]|[0-9]{1,3}))?)' +
      `(?![${tokenBoundaryCharacters}])`,
    'g',
  )

const arbitraryRadiusRegex = () =>
  new RegExp(
    `(^|[^${tokenBoundaryCharacters}])` +
      '(rounded-\\[[^\\]\\s]+\\])' +
      `(?![${tokenBoundaryCharacters}])`,
    'g',
  )

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const parseMode = () => {
  const argumentsList = process.argv.slice(2)
  if (argumentsList.length === 0 || argumentsList[0] === '--dry-run') {
    if (argumentsList.length > 1) {
      throw new Error('Use exactly one of --dry-run or --write')
    }
    return 'dry-run'
  }
  if (argumentsList.length === 1 && argumentsList[0] === '--write') {
    return 'write'
  }
  throw new Error('Use exactly one of --dry-run or --write')
}

const readConfiguration = async () => {
  const rawConfiguration = await fs.readFile(mapPath, 'utf8')
  const configuration = JSON.parse(rawConfiguration)

  if (
    !Array.isArray(configuration.excludePathPrefixes) ||
    !Array.isArray(configuration.excludeFiles) ||
    typeof configuration.mapping !== 'object' ||
    configuration.mapping === null
  ) {
    throw new Error('theme-map.json has an invalid shape')
  }

  return configuration
}

const walkTypeScriptFiles = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkTypeScriptFiles(entryPath)))
      continue
    }
    if (entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name)) {
      files.push(entryPath)
    }
  }

  return files
}

const scanQuotedString = (source, start, delimiter) => {
  let index = start + 1
  while (index < source.length) {
    if (source[index] === '\\') {
      index += 2
      continue
    }
    if (source[index] === delimiter) {
      return index
    }
    index += 1
  }
  return source.length
}

const scanBlockComment = (source, start) => {
  const end = source.indexOf('*/', start + 2)
  return end === -1 ? source.length : end + 2
}

const scanLineComment = (source, start) => {
  const end = source.indexOf('\n', start + 2)
  return end === -1 ? source.length : end + 1
}

const scanTemplateString = (source, start) => {
  let index = start + 1
  while (index < source.length) {
    if (source[index] === '\\') {
      index += 2
      continue
    }
    if (source[index] === '`') {
      return index
    }
    if (source[index] === '$' && source[index + 1] === '{') {
      index = scanTemplateExpression(source, index + 2)
      continue
    }
    index += 1
  }
  return source.length
}

const scanTemplateExpression = (source, start) => {
  let depth = 1
  let index = start

  while (index < source.length && depth > 0) {
    const character = source[index]
    if (character === "'" || character === '"') {
      index = scanQuotedString(source, index, character) + 1
      continue
    }
    if (character === '`') {
      index = scanTemplateString(source, index) + 1
      continue
    }
    if (character === '/' && source[index + 1] === '*') {
      index = scanBlockComment(source, index)
      continue
    }
    if (character === '/' && source[index + 1] === '/') {
      index = scanLineComment(source, index)
      continue
    }
    if (character === '{') {
      depth += 1
    } else if (character === '}') {
      depth -= 1
    }
    index += 1
  }

  return index
}

const findClassStringRanges = (source) => {
  const ranges = []
  let index = 0

  while (index < source.length) {
    const character = source[index]
    if (character === '/' && source[index + 1] === '*') {
      index = scanBlockComment(source, index)
      continue
    }
    if (character === '/' && source[index + 1] === '/') {
      index = scanLineComment(source, index)
      continue
    }
    if (character === "'" || character === '"') {
      const end = scanQuotedString(source, index, character)
      const contentStart = index + 1
      const content = source.slice(contentStart, end)
      if (
        paletteUtilityRegex().test(content) ||
        arbitraryRadiusRegex().test(content)
      ) {
        ranges.push({ start: contentStart, end })
      }
      index = end + 1
      continue
    }
    if (character === '`') {
      const end = scanTemplateString(source, index)
      const contentStart = index + 1
      const content = source.slice(contentStart, end)
      if (
        paletteUtilityRegex().test(content) ||
        arbitraryRadiusRegex().test(content)
      ) {
        ranges.push({ start: contentStart, end })
      }
      index = end + 1
      continue
    }
    index += 1
  }

  return ranges
}

const replaceMappedUtilities = (source, mappingEntries) => {
  const ranges = findClassStringRanges(source)
  let output = ''
  let cursor = 0
  let replacements = 0

  for (const range of ranges) {
    output += source.slice(cursor, range.start)
    let content = source.slice(range.start, range.end)

    for (const [from, to] of mappingEntries) {
      const matcher = new RegExp(
        `(^|[^${tokenBoundaryCharacters}])` +
          `(${escapeRegExp(from)})` +
          `(?![${tokenBoundaryCharacters}])`,
        'g',
      )
      content = content.replace(matcher, (_match, prefix) => {
        replacements += 1
        return `${prefix}${to}`
      })
    }

    output += content
    cursor = range.end
  }

  output += source.slice(cursor)
  return { output, replacements }
}

const countMatchesInClassStrings = (source, createMatcher) => {
  const counts = new Map()
  for (const range of findClassStringRanges(source)) {
    const content = source.slice(range.start, range.end)
    const matcher = createMatcher()
    for (const match of content.matchAll(matcher)) {
      const token = match[2]
      counts.set(token, (counts.get(token) ?? 0) + 1)
    }
  }
  return counts
}

const mergeCounts = (target, source) => {
  for (const [token, count] of source) {
    target.set(token, (target.get(token) ?? 0) + count)
  }
}

const isExcluded = (relativePath, configuration) =>
  configuration.excludeFiles.includes(relativePath) ||
  configuration.excludePathPrefixes.some((prefix) =>
    relativePath.startsWith(prefix),
  )

const printCounts = (heading, counts) => {
  const entries = [...counts.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  )
  const total = entries.reduce((sum, [, count]) => sum + count, 0)

  console.log(`${heading}: ${entries.length} distinct, ${total} occurrences`)
  if (entries.length === 0) {
    console.log('  (none)')
    return
  }
  for (const [token, count] of entries) {
    console.log(`  ${token}: ${count}`)
  }
}

const mode = parseMode()
const configuration = await readConfiguration()
const mappingEntries = Object.entries(configuration.mapping).sort(
  ([left], [right]) => right.length - left.length,
)
const files = await walkTypeScriptFiles(sourceDirectory)
const perFileReplacements = []
const unmappedPaletteUtilities = new Map()
const unmappedArbitraryRadii = new Map()
let excludedFileCount = 0
let scannedFileCount = 0
let totalReplacements = 0

for (const filePath of files) {
  const relativePath = path
    .relative(sourceDirectory, filePath)
    .split(path.sep)
    .join('/')

  if (isExcluded(relativePath, configuration)) {
    excludedFileCount += 1
    continue
  }

  scannedFileCount += 1
  const source = await fs.readFile(filePath, 'utf8')
  const result = replaceMappedUtilities(source, mappingEntries)

  if (result.replacements > 0) {
    perFileReplacements.push([relativePath, result.replacements])
    totalReplacements += result.replacements
    if (mode === 'write') {
      await fs.writeFile(filePath, result.output)
    }
  }

  mergeCounts(
    unmappedPaletteUtilities,
    countMatchesInClassStrings(result.output, paletteUtilityRegex),
  )
  mergeCounts(
    unmappedArbitraryRadii,
    countMatchesInClassStrings(result.output, arbitraryRadiusRegex),
  )
}

console.log(`Mode: ${mode}`)
console.log(`Scanned files: ${scannedFileCount}`)
console.log(`Excluded files: ${excludedFileCount}`)
console.log(`Files with replacements: ${perFileReplacements.length}`)
for (const [relativePath, count] of perFileReplacements) {
  console.log(`  ${relativePath}: ${count}`)
}
console.log(`Total replacements: ${totalReplacements}`)
printCounts('Unmapped hardcoded palette utilities', unmappedPaletteUtilities)
printCounts('Unmapped arbitrary radii', unmappedArbitraryRadii)
