import type { CSSProperties } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'toolbarSecondary' | 'ghost' | 'darkBlue' | 'rounded' | 'darkGray' | 'text' | 'textInvers' | 'secondaryInvers' | 'lightBlue'

export const buttonBaseClass =
  'cursor-pointer transition active:scale-[0.98] duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-inherit backdrop-blur-xl'

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  text: 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]',
  textInvers:
    'bg-[var(--color-primary)] border border-white/10 hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,white)] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)] shadow-[0_12px_30px_rgba(131,204,185,0.22)]',
  secondaryInvers:
    'bg-[rgba(14,22,23,0.72)] text-[var(--color-primary-foreground)] border border-white/12 hover:bg-[rgba(9,15,16,0.82)] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium shadow-[0_12px_28px_rgba(0,0,0,0.18)]',
  primary:
    'bg-[var(--color-primary)] text-[var(--color-secondary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,white)] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium shadow-[0_8px_18px_rgba(131,204,185,0.18)]',
  darkGray:
    'bg-white/[0.08] text-[var(--color-primary-foreground)] border border-white/10 hover:bg-white/[0.12] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium',
  darkBlue:
    'bg-[var(--color-dark-blue)]/85 text-[var(--color-primary-foreground)] border border-white/12 hover:bg-[var(--color-dark-blue)] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium shadow-[0_12px_28px_rgba(96,141,232,0.20)]',
  secondary:
    'bg-white/[0.06] text-[var(--color-text)] border border-white/12 hover:bg-white/[0.1] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium shadow-[0_12px_28px_rgba(0,0,0,0.14)]',
  toolbarSecondary:
    'bg-white/[0.055] text-[var(--color-text)] border border-white/12 hover:bg-white/[0.09] inline-flex items-center justify-center rounded-xl px-3 py-1 text-sm font-medium shadow-[0_10px_22px_rgba(0,0,0,0.12)]',
  rounded:
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.07] shadow-[0_10px_24px_rgba(0,0,0,0.16)] transition hover:bg-white/[0.11] active:scale-95',
  ghost: 'bg-transparent text-[var(--color-text)] border border-transparent hover:bg-white/[0.06] rounded-xl',

  lightBlue:'bg-[var(--color-green-turquess)] text-[var(--color-secondary)] hover:bg-[color-mix(in_srgb,var(--color-green-turquess)_88%,white)] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium shadow-[0_12px_28px_rgba(54,182,194,0.18)]'
}

export type ButtonParams = {
  variant?: ButtonVariant
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  ariaLabel?: string
  style?: CSSProperties
}
