/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.svg?react' {
  import type { FunctionComponent, SVGProps } from 'react'

  const component: FunctionComponent<SVGProps<SVGSVGElement>>
  export default component
}
