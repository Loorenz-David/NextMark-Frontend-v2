/// <reference types="vite-plugin-svgr/client" />

declare module '*.svg?react' {
  import type { ComponentType, SVGProps } from 'react'
  const Component: ComponentType<SVGProps<SVGSVGElement>>
  export default Component
}

declare module '*.svg?raw' {
  const content: string
  export default content
}
