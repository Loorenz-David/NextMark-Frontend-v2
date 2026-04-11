import loadingAnimation from './lottie-spinner/loading.json'
import sandClockAnimation from './lottie-spinner/SandClock.json'
import { CircularSpinner } from './circular-spinner/CircularSpinner'
import type { SpinnerRegistryEntry } from './types'

export const SPINNER_ANIMATION_REGISTRY = {
  jumpUp: {
    kind: 'lottie',
    animationData: loadingAnimation,
  },
  sandClock: {
    kind: 'lottie',
    animationData: sandClockAnimation,
  },
  circular: {
    kind: 'component',
    Component: CircularSpinner,
  },
} as const satisfies Record<string, SpinnerRegistryEntry>

export type SpinnerAnimationKey = keyof typeof SPINNER_ANIMATION_REGISTRY
