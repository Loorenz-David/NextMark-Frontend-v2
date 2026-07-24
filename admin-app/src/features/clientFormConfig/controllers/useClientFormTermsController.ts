import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Descendant } from 'slate'

import {
  createEmptyTermsDocument,
  isTermsDocumentEmpty,
  slateToTermsDocument,
  termsDocumentToSlate,
} from '../domain/termsDocument'
import { useClientFormTermsFlow } from '../flows/clientFormTerms.flow'
import {
  useActiveClientFormTermsVersion,
  useClientFormTermsVersions,
} from '../store/clientFormConfig.selector'
import { useClientFormTermsDraftStore } from '../store/clientFormTermsDraft.store'
import type { ClientFormTermsVersion } from '../types/clientFormTerms'

export const useClientFormTermsController = () => {
  const { publishVersion, isLoading } = useClientFormTermsFlow()
  const versions = useClientFormTermsVersions()
  const activeVersion = useActiveClientFormTermsVersion()

  const draft = useClientFormTermsDraftStore((state) => state.draft)
  const editorKey = useClientFormTermsDraftStore((state) => state.editorKey)
  const sourceVersionId = useClientFormTermsDraftStore((state) => state.sourceVersionId)
  const setDraft = useClientFormTermsDraftStore((state) => state.setDraft)
  const replaceDraftValue = useClientFormTermsDraftStore((state) => state.replaceDraft)
  const setSourceVersionId = useClientFormTermsDraftStore((state) => state.setSourceVersionId)

  const [isPublishing, setIsPublishing] = useState(false)

  // Seeded exactly once per session: `draft === null` is the un-seeded signal, so
  // a background refetch — or leaving and returning to the tab — never overwrites
  // work in progress.
  useEffect(() => {
    if (draft !== null || isLoading) {
      return
    }
    if (activeVersion) {
      replaceDraftValue(termsDocumentToSlate(activeVersion.content), activeVersion.id)
      return
    }
    replaceDraftValue(termsDocumentToSlate(createEmptyTermsDocument()), null)
  }, [activeVersion, draft, isLoading, replaceDraftValue])

  const replaceDraft = useCallback(
    (version: ClientFormTermsVersion) => {
      replaceDraftValue(termsDocumentToSlate(version.content), version.id)
    },
    [replaceDraftValue],
  )

  const startBlankDraft = useCallback(() => {
    replaceDraftValue(termsDocumentToSlate(createEmptyTermsDocument()), null)
  }, [replaceDraftValue])

  const editorValue: Descendant[] = useMemo(
    () => draft ?? termsDocumentToSlate(createEmptyTermsDocument()),
    [draft],
  )

  const draftDocument = useMemo(() => slateToTermsDocument(editorValue), [editorValue])

  const isEmpty = useMemo(() => isTermsDocumentEmpty(draftDocument), [draftDocument])

  /** Publishing identical content would add a redundant version, so it is blocked. */
  const matchesActiveVersion = useMemo(
    () =>
      activeVersion !== null
      && JSON.stringify(activeVersion.content) === JSON.stringify(draftDocument),
    [activeVersion, draftDocument],
  )

  const publish = useCallback(async () => {
    setIsPublishing(true)
    const published = await publishVersion(draftDocument)
    setIsPublishing(false)
    if (published) {
      setSourceVersionId(published.id)
    }
  }, [draftDocument, publishVersion, setSourceVersionId])

  return {
    versions,
    activeVersion,
    isLoading,
    isPublishing,
    draft: editorValue,
    setDraft,
    editorKey,
    sourceVersionId,
    canPublish: !isEmpty && !matchesActiveVersion && !isPublishing,
    isEmpty,
    matchesActiveVersion,
    publish,
    replaceDraft,
    startBlankDraft,
  }
}
