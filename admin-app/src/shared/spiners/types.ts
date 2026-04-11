import type { CSSProperties, ComponentType } from 'react'

export type SpinnerSize = number | string

export type SpinnerPrimitiveProps = {
  width: SpinnerSize
  height: SpinnerSize
  className?: string
  style?: CSSProperties
}

export type LottieRegistryEntry = {
  kind: 'lottie'
  animationData: object
}

export type ComponentRegistryEntry = {
  kind: 'component'
  Component: ComponentType<SpinnerPrimitiveProps>
}

export type SpinnerRegistryEntry = LottieRegistryEntry | ComponentRegistryEntry
