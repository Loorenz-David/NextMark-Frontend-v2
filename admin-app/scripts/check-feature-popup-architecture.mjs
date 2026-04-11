import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

const isTsFile = (filePath) => /\.(ts|tsx)$/.test(filePath)

const walk = (dir) => {
  const entries = readdirSync(dir)
  const files = []
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      files.push(...walk(fullPath))
      continue
    }
    if (stats.isFile() && isTsFile(fullPath)) {
      files.push(fullPath)
    }
  }
  return files
}

const allFiles = walk(SRC)
const errors = []

const toRepoPath = (filePath) => relative(ROOT, filePath).replaceAll('\\', '/')
const popupRootPattern = /src\/features\/.+\/popups\/.+\.(ts|tsx)$/

for (const filePath of allFiles) {
  const repoPath = toRepoPath(filePath)
  const source = readFileSync(filePath, 'utf8')

  if (repoPath.startsWith('src/shared/popups/featurePopup/')) {
    if (/from\s+['"]@\/features\//.test(source) || /from\s+['"][.]{1,2}\/.*features\//.test(source)) {
      errors.push(`[shared->features forbidden] ${repoPath}`)
    }
  }

  if (/useFeaturePopupCloseController\s*\(/.test(source) && !popupRootPattern.test(repoPath)) {
    errors.push(`[controller must be created in popup root only] ${repoPath}`)
  }

  if (/FeaturePopupClosePrompt/.test(source) && !popupRootPattern.test(repoPath) && !repoPath.startsWith('src/shared/popups/featurePopup/')) {
    errors.push(`[close prompt must be mounted only in popup roots] ${repoPath}`)
  }
}

if (errors.length > 0) {
  console.error('Popup architecture checks failed:\n')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('Popup architecture checks passed.')
