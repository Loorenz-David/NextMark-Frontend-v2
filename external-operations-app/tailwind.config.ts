import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../packages/shared-inputs/src/**/*.{ts,tsx}',
    '../packages/client-form-kit/src/**/*.{ts,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
