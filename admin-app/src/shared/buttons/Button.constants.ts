import type { CSSProperties } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'toolbarSecondary' | 'ghost' | 'darkBlue' | 'rounded' | 'darkGray' | 'text' | 'textInvers' | 'secondaryInvers' | 'lightBlue'

export const buttonBaseClass =
  'cursor-pointer transition active:scale-[0.98] duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-inherit backdrop-blur-xl'

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  text: 'bg-surface-raised border border-border hover:bg-surface-hover inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]',
  textInvers:
    'bg-[var(--color-primary)] border border-border hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,white)] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)] shadow-[0_12px_30px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]',
  secondaryInvers:
    'bg-[var(--glass-overlay)] text-[var(--color-text)] border border-border hover:bg-[rgba(var(--theme-surface-button-hover-r),0.82)] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium shadow-[0_12px_28px_rgba(0,0,0,0.18)]',
  primary:
    'bg-[var(--color-primary)] text-[var(--color-secondary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,white)] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium shadow-[0_8px_18px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]',
  darkGray:
    'bg-surface-hover text-[var(--color-text)] border border-border hover:bg-surface-sunken inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium',
  darkBlue:
    'bg-[var(--color-dark-blue)]/85 text-[var(--color-primary-foreground)] border border-border hover:bg-[var(--color-dark-blue)] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium shadow-[0_12px_28px_color-mix(in_srgb,var(--color-dark-blue)_20%,transparent)]',
  secondary:
    'bg-surface-hover text-[var(--color-text)] border border-border hover:bg-surface-sunken inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium shadow-[0_12px_28px_rgba(0,0,0,0.14)]',
  toolbarSecondary:
    'bg-surface-raised text-[var(--color-text)] border border-border hover:bg-surface-sunken inline-flex items-center justify-center rounded-xl px-3 py-1 text-sm font-medium shadow-[0_10px_22px_rgba(0,0,0,0.12)]',
  rounded:
    'inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-hover shadow-[0_10px_24px_rgba(0,0,0,0.16)] transition hover:bg-surface-sunken active:scale-95',
  ghost: 'bg-transparent text-[var(--color-text)] border border-transparent hover:bg-surface-hover rounded-xl',

  lightBlue:'bg-[var(--color-green-turquess)] text-[var(--color-secondary)] hover:bg-[color-mix(in_srgb,var(--color-green-turquess)_88%,white)] inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium shadow-[0_12px_28px_color-mix(in_srgb,var(--color-green-turquess)_18%,transparent)]'
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
