import { BasicButton } from '@/shared/buttons/BasicButton'

type EmailPreviewProps = {
  html: string
  isLoading: boolean
  onRefresh: () => void
}

export const EmailPreview = ({ html, isLoading, onRefresh }: EmailPreviewProps) => (
  <section className="admin-glass-panel-strong flex min-h-[360px] flex-col gap-4 rounded-[28px] p-5 shadow-none">
    <div className="flex items-center justify-between">
      <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Preview</h3>
      <BasicButton
        params={{
          variant: 'secondary',
          className: 'px-3 py-1 text-xs',
          onClick: onRefresh,
          disabled: isLoading,
          ariaLabel: 'Refresh email preview',
        }}
      >
        {isLoading ? 'Loading...' : 'Refresh preview'}
      </BasicButton>
    </div>
    <div className="h-full overflow-hidden rounded-[24px] border border-white/[0.08] bg-white">
      <iframe
        title="Email template preview"
        srcDoc={html}
        className="h-[420px] w-full"
      />
    </div>
  </section>
)
