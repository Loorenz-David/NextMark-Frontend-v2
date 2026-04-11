import { useEffect, useMemo, useRef, useState } from 'react'

import { ChevronDownIcon } from '@/assets/icons'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

import type { LocalDeliveryGaussianMetricCard } from './LocalDeliveryStatsOverlay.types'

type GaussianMetricCardProps = {
  card: LocalDeliveryGaussianMetricCard
  routeScopeKey: string
}

const TRACK_PATH = 'M 18 112 A 62 62 0 0 1 142 112'

const hasMeaningfulChange = (previous: number, next: number, compareMode?: 'strict' | 'epsilon' | 'threshold', epsilon?: number, threshold?: number) => {
  if (compareMode === 'epsilon') {
    return Math.abs(previous - next) >= Math.max(0.0001, epsilon ?? 0.01)
  }

  if (compareMode === 'threshold') {
    return Math.abs(previous - next) >= Math.max(0.0001, threshold ?? 1)
  }

  return previous !== next
}

export const GaussianMetricCard = ({ card, routeScopeKey }: GaussianMetricCardProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const activeFace = useMemo(
    () => card.faces[activeIndex] ?? card.faces[0],
    [activeIndex, card.faces],
  )
  const [progressPathLength, setProgressPathLength] = useState(
    Math.max(0, Math.min(100, activeFace.progressValue)) / 100,
  )
  const [progressDuration, setProgressDuration] = useState(0)
  const [pulseTick, setPulseTick] = useState(0)

  const routeScopeRef = useRef(routeScopeKey)
  const hasHydratedRef = useRef(false)
  const previousProgressByFaceRef = useRef<Map<string, number>>(new Map())
  const previousNumericByFaceRef = useRef<Map<string, number>>(new Map())

  const isInteractive = card.faces.length > 1

  const handleToggle = () => {
    if (!isInteractive) return
    setActiveIndex((current) => (current + 1) % card.faces.length)
  }

  useEffect(() => {
    if (routeScopeRef.current !== routeScopeKey) {
      routeScopeRef.current = routeScopeKey
      hasHydratedRef.current = false
      previousProgressByFaceRef.current = new Map()
      previousNumericByFaceRef.current = new Map()
      setProgressDuration(0)
      setProgressPathLength(Math.max(0, Math.min(100, activeFace.progressValue)) / 100)
      return
    }

    const nextProgress = Math.max(0, Math.min(100, activeFace.progressValue)) / 100
    const previousProgress = previousProgressByFaceRef.current.get(activeFace.id) ?? nextProgress
    const previousNumericValue = previousNumericByFaceRef.current.get(activeFace.id)
    const nextNumericValue = activeFace.animation?.numericValue

    const progressChanged = Math.abs(nextProgress - previousProgress) >= 0.01
    const valueChanged =
      typeof nextNumericValue === 'number' && Number.isFinite(nextNumericValue)
        ? previousNumericValue == null
          ? false
          : hasMeaningfulChange(
              previousNumericValue,
              nextNumericValue,
              activeFace.animation?.compareMode,
              activeFace.animation?.epsilon,
              activeFace.animation?.threshold,
            )
        : false

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true
      setProgressDuration(0)
      setProgressPathLength(nextProgress)
    } else {
      const shouldAnimate = (progressChanged || valueChanged) && !prefersReducedMotion
      setProgressDuration(shouldAnimate ? 0.5 : 0)
      setProgressPathLength(nextProgress)
      if (shouldAnimate) {
        setPulseTick((value) => value + 1)
      }
    }

    previousProgressByFaceRef.current.set(activeFace.id, nextProgress)
    if (typeof nextNumericValue === 'number' && Number.isFinite(nextNumericValue)) {
      previousNumericByFaceRef.current.set(activeFace.id, nextNumericValue)
    }
  }, [
    activeFace.animation?.compareMode,
    activeFace.animation?.epsilon,
    activeFace.animation?.numericValue,
    activeFace.animation?.threshold,
    activeFace.id,
    activeFace.progressValue,
    prefersReducedMotion,
    routeScopeKey,
  ])

  const isEstimated = activeFace.animation?.sourceType === 'estimated'

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleToggle : undefined}
      onKeyDown={
        isInteractive
          ? (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') {
                return
              }
              event.preventDefault()
              handleToggle()
            }
          : undefined
      }
      className="pointer-events-auto relative flex min-h-[150px] w-full flex-col rounded-2xl border border-white/45 bg-black/28 p-4 pt-3 text-left text-sm text-white backdrop-blur-md transition-colors hover:bg-black/34"
    >
      <ChevronDownIcon className="-rotate-90 absolute right-3 top-[10px] h-4 w-4 text-white/70" />

      <div className="flex gap-1 pr-6">
        {card.faces.map((face, index) => (
          <button
            key={face.id}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setActiveIndex(index)
            }}
            aria-label={`Show ${face.label}`}
            className={cn(
              'h-[1px] flex-1 rounded-full transition-colors',
              index === activeIndex ? 'bg-white/92' : 'bg-white/24 hover:bg-white/40',
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeFace.id}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-full flex-col gap-2"
        >
          <div className="relative flex items-start justify-center pt-4">
            <div className="relative h-[60px] w-[150px]">
              <svg
                viewBox="0 50 160 60"
                className="h-full w-full overflow-visible"
                aria-hidden="true"
              >
                <path
                  d={TRACK_PATH}
                  fill="none"
                  stroke="rgba(255,255,255,0.88)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  pathLength={100}
                />
                <motion.path
                  d={TRACK_PATH}
                  fill="none"
                  strokeLinecap="round"
                  strokeWidth="12"
                  pathLength={100}
                  initial={false}
                  animate={{ pathLength: progressPathLength }}
                  transition={{ duration: progressDuration, ease: [0.22, 1, 0.36, 1] }}
                  className={cn('stroke-lime-400', activeFace.accentClassName)}
                />
              </svg>

              <div className="pointer-events-none absolute inset-x-0 bottom-[5px] flex items-end justify-center px-7">
                <motion.span
                  key={`${activeFace.id}-${pulseTick}`}
                  initial={prefersReducedMotion ? undefined : { scale: 1.1 }}
                  animate={prefersReducedMotion ? undefined : { scale: 1 }}
                  transition={prefersReducedMotion ? undefined : { duration: 0.26, ease: 'easeOut' }}
                  className={`text-center text-sm font-semibold leading-tight ${isEstimated ? 'text-white/82' : 'text-white'}`}
                >
                  {activeFace.displayValue} 
                </motion.span>
              </div>
            </div>
          </div>

          <div className="  flex justify-center">
            <div className="text-center text-xs font-semibold text-white">
              {activeFace.label}
              {isEstimated ? (
                <span className="ml-1 rounded-full border border-white/22 px-1.5 py-[1px] text-[9px] uppercase tracking-[0.08em] text-white/62">
                  Est.
                </span>
              ) : null}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
