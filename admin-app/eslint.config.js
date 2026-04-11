import js from '@eslint/js'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}', '../packages/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.app.json'],
        },
      },
    },
    rules: {
      'import/no-cycle': 'error',
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@shared-utils/*', '@shared-domain/*', '@shared-api/*', '@shared-store/*', '@shared-optimistic/*', '@shared-message-handler/*', '@shared-google-maps/*', '@nextmark/ai-panel/*', '@packages/*'],
            message: 'Import shared packages from their root barrel only.',
          },
        ],
      }],
    },
  },
  {
    files: ['../packages/shared-store/**/*.{ts,tsx}', '../packages/shared-optimistic/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          {
            name: 'react',
            message: 'shared-store must remain app-independent.',
          },
        ],
        patterns: [
          {
            group: ['react/*', '@tanstack/*'],
            message: 'shared-store must remain app-independent.',
          },
          {
            group: ['@/*', '@app', '@app/*', '@features', '@features/*'],
            message: 'Shared packages cannot import admin-app code.',
          },
          {
            group: ['@shared-utils/*', '@shared-domain/*', '@shared-api/*', '@shared-store/*', '@shared-optimistic/*', '@shared-message-handler/*', '@shared-google-maps/*'],
            message: 'Shared packages must be imported from their root barrel only.',
          },
          {
            group: ['../admin-app/*', '../../admin-app/*', '../../../admin-app/*'],
            message: 'Shared packages cannot import app code via relative paths.',
          },
        ],
      }],
    },
  },
  {
    files: ['../packages/shared-message-handler/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/*', '@app', '@app/*', '@features', '@features/*'],
            message: 'Shared packages cannot import admin-app code.',
          },
          {
            group: ['@shared-utils/*', '@shared-domain/*', '@shared-api/*', '@shared-store/*', '@shared-optimistic/*', '@shared-message-handler/*', '@shared-google-maps/*'],
            message: 'Shared packages must be imported from their root barrel only.',
          },
          {
            group: ['../admin-app/*', '../../admin-app/*', '../../../admin-app/*'],
            message: 'Shared packages cannot import app code via relative paths.',
          },
        ],
      }],
    },
  },
  {
    files: ['../packages/ai-panel/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/*', '@app', '@app/*', '@features', '@features/*'],
            message: 'Shared packages cannot import admin-app code.',
          },
          {
            group: ['@shared-utils/*', '@shared-domain/*', '@shared-api/*', '@shared-store/*', '@shared-optimistic/*', '@shared-message-handler/*', '@shared-google-maps/*', '@nextmark/ai-panel/*'],
            message: 'Shared packages must be imported from their root barrel only.',
          },
          {
            group: ['../admin-app/*', '../../admin-app/*', '../../../admin-app/*'],
            message: 'Shared packages cannot import app code via relative paths.',
          },
        ],
      }],
    },
  },
  {
    files: ['../packages/shared-domain/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['../delivery-planning/*', '../items/*', '../orders/*'],
            message: 'shared-domain/core cannot depend on higher-level domains.',
          },
        ],
      }],
    },
  },
  {
    files: ['../packages/shared-domain/delivery-planning/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['../items/*', '../orders/*'],
            message: 'shared-domain/delivery-planning cannot depend on higher-level domains.',
          },
        ],
      }],
    },
  },
  {
    files: ['../packages/shared-domain/items/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['../orders/*'],
            message: 'shared-domain/items cannot depend on higher-level domains.',
          },
        ],
      }],
    },
  },
  {
    files: ['../packages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [
          {
            name: 'react',
            message: 'Shared packages must remain framework-agnostic.',
          },
        ],
        patterns: [
          {
            group: ['react/*', '@tanstack/*'],
            message: 'Shared packages must remain framework-agnostic.',
          },
          {
            group: ['@/*', '@app', '@app/*', '@features', '@features/*'],
            message: 'Shared packages cannot import admin-app code.',
          },
          {
            group: ['@shared-utils/*', '@shared-domain/*', '@shared-api/*', '@shared-store/*', '@shared-optimistic/*', '@shared-message-handler/*', '@shared-google-maps/*', '@nextmark/ai-panel/*'],
            message: 'Shared packages must be imported from their root barrel only.',
          },
          {
            group: ['../admin-app/*', '../../admin-app/*', '../../../admin-app/*'],
            message: 'Shared packages cannot import app code via relative paths.',
          },
        ],
      }],
    },
  },
])
