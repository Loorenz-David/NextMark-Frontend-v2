import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { useThemeStore } from './theme.store'

const CENTER = 12
const RAY_INNER_RADIUS = 6.9
const RAY_OUTER_RADIUS = 9.6

/**
 * Ray endpoints, precomputed in viewBox units.
 *
 * Deliberately not per-line CSS rotation: `transform-origin` on an SVG child
 * resolves against that child's own bounding box, so rotating each ray spins it
 * in place rather than around the disc.
 */
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315].map((degrees) => {
  const radians = (degrees * Math.PI) / 180
  const sin = Math.sin(radians)
  const cos = Math.cos(radians)

  return {
    degrees,
    x1: CENTER + RAY_INNER_RADIUS * sin,
    y1: CENTER - RAY_INNER_RADIUS * cos,
    x2: CENTER + RAY_OUTER_RADIUS * sin,
    y2: CENTER - RAY_OUTER_RADIUS * cos,
  }
})

/**
 * Sun/moon theme switch.
 *
 * One shape does the work: the disc grows and a second circle slides across it
 * to bite out a crescent, while the rays retract into it. There is no track and
 * no thumb — the icon itself is the state.
 */
export const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const prefersReducedMotion = useReducedMotion()

  // The crescent mask is referenced by id, so each instance needs its own.
  const maskId = useId()
  const isDark = theme === 'dark'

  const spring = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 22 }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-raised text-[var(--color-muted)] transition-colors duration-200 hover:bg-surface-hover hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] active:scale-95"
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
        animate={{ rotate: isDark ? -55 : 0 }}
        transition={spring}
      >
        <mask id={maskId}>
          <rect x="0" y="0" width="24" height="24" fill="white" />
          {/* Parked off-canvas for the sun; slides in to carve the crescent. */}
          <motion.circle
            r="9.2"
            fill="black"
            initial={false}
            animate={{ cx: isDark ? 18.5 : 32, cy: isDark ? 5.5 : -8 }}
            transition={spring}
          />
        </mask>

        <motion.circle
          cx={CENTER}
          cy={CENTER}
          fill="currentColor"
          mask={`url(#${maskId})`}
          initial={false}
          animate={{ r: isDark ? 9.2 : 4.8 }}
          transition={spring}
        />

        <motion.g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={{
            opacity: isDark ? 0 : 1,
            scale: isDark ? 0.45 : 1,
            rotate: isDark ? 40 : 0,
          }}
          transition={spring}
          // The ray group is radially symmetric, so its own bounding-box centre
          // is the disc centre — `fill-box` is correct and unambiguous here.
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          {RAYS.map((ray) => (
            <line
              key={ray.degrees}
              x1={ray.x1}
              y1={ray.y1}
              x2={ray.x2}
              y2={ray.y2}
            />
          ))}
        </motion.g>
      </motion.svg>
    </button>
  )
}
