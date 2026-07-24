import { BasicButton } from '@/shared/buttons/BasicButton'

import { ClientFormSectionLayout } from '../components/ClientFormSectionLayout'
import { ClientFormToggleRow } from '../components/ClientFormToggleRow'
import { TermsEditor } from '../components/TermsEditor'
import { TermsVersionList } from '../components/TermsVersionList'
import { useClientFormSettingsController } from '../controllers/useClientFormSettingsController'
import { useClientFormTermsController } from '../controllers/useClientFormTermsController'

export const ClientFormTermsPage = () => {
  const { settings, setFlag } = useClientFormSettingsController()
  const {
    versions,
    activeVersion,
    isLoading,
    isPublishing,
    draft,
    setDraft,
    editorKey,
    sourceVersionId,
    canPublish,
    matchesActiveVersion,
    publish,
    replaceDraft,
    startBlankDraft,
  } = useClientFormTermsController()

  return (
    <ClientFormSectionLayout
      title="Terms & Conditions"
      description="Versions are append-only — publishing writes a new one and never edits an existing one, so a customer's recorded acceptance stays provable."
      toggles={
        <>
          <ClientFormToggleRow
            label="Show terms on the form"
            description="Renders the terms section for customers filling in the form."
            value={settings.terms_enabled}
            onChange={(value) => setFlag('terms_enabled', value)}
          />
          <ClientFormToggleRow
            label="Require acceptance before submitting"
            description="Blocks submission until the customer accepts the live version."
            value={settings.require_acceptance}
            onChange={(value) => setFlag('require_acceptance', value)}
            disabled={!settings.terms_enabled}
            disabledHint="Only applies while the terms section is shown."
          />
        </>
      }
      bodyClassName="flex flex-1 gap-4 overflow-hidden bg-[var(--color-page)]/30 p-4 pt-6"
    >
      {/* The editor takes every pixel the fixed-width history column does not. */}
      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-auto pr-1 scroll-thin">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {activeVersion
                ? `Editing from version ${activeVersion.version_number}`
                : 'No version published yet'}
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              {settings.terms_enabled
                ? 'Customers see the live version.'
                : 'Customers see nothing until "Show terms on the form" is on.'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={startBlankDraft}
              className="rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              Start blank
            </button>
            <BasicButton params={{ onClick: () => void publish(), variant: 'primary', disabled: !canPublish }}>
              {isPublishing ? 'Publishing…' : 'Publish new version'}
            </BasicButton>
          </div>
        </div>

        {matchesActiveVersion ? (
          <p className="text-xs text-[var(--color-muted)]/70">
            This draft matches the live version — edit it to publish a new one.
          </p>
        ) : null}

        <TermsEditor value={draft} onChange={setDraft} editorKey={editorKey} />
      </div>

      {/* Version cards need a readable, stable column — not a share of the width. */}
      <div className="flex w-64 shrink-0 flex-col gap-3 overflow-auto border-l border-border-subtle pl-4 scroll-thin xl:w-72">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
          Version history
        </p>
        <TermsVersionList
          versions={versions}
          isLoading={isLoading}
          sourceVersionId={sourceVersionId}
          onLoadVersion={replaceDraft}
        />
      </div>
    </ClientFormSectionLayout>
  )
}
