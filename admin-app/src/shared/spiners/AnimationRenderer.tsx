import type { CSSProperties } from 'react'

import Lottie from 'lottie-react'

import {
  SPINNER_ANIMATION_REGISTRY,
  type SpinnerAnimationKey,
} from './animation.registry'
import type { SpinnerSize } from './types'

type AnimationRendererProps = {
  animation: SpinnerAnimationKey
  width?: SpinnerSize
  height?: SpinnerSize
  className?: string
  style?: CSSProperties
  loop?: boolean
}

export const AnimationRenderer = ({
  animation,
  width = "120px",
  height = "120px",
  className,
  style,
  loop = true,
}: AnimationRendererProps) => {
  const entry = SPINNER_ANIMATION_REGISTRY[animation]

  if (entry.kind === 'lottie') {
    return (
      <Lottie
        animationData={entry.animationData}
        loop={loop}
        className={className}
        style={{
          width,
          height,
          ...style,
        }}
      />
    )
  }

  const Component = entry.Component
  return (
    <Component
      width={width}
      height={height}
      className={className}
      style={style}
    />
  )
}
