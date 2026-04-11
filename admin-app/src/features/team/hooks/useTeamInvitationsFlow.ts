import { useCallback, useEffect } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import {
  useGetTeamInvitesReceived,
  useGetTeamInvitesSent,
} from '@/features/team/invitations/api/teamInvitationApi'
import type {
  TeamInviteReceivedQueryFilters,
  TeamInviteSentQueryFilters,
} from '@/features/team/invitations/types/teamInvitationMeta'
import { insertTeamInvitesReceived } from '@/features/team/invitations/store/teamInvitesReceivedStore'
import { insertTeamInvitesSent } from '@/features/team/invitations/store/teamInvitesSentStore'
import {
  setTeamInvitesReceivedError,
  setTeamInvitesReceivedLoading,
  setTeamInvitesReceivedResult,
} from '@/features/team/invitations/store/teamInvitesReceivedListStore'
import {
  setTeamInvitesSentError,
  setTeamInvitesSentLoading,
  setTeamInvitesSentResult,
} from '@/features/team/invitations/store/teamInvitesSentListStore'

import { useTeamInvitationModel } from '../domain/useTeamInvitationModel'

const buildQueryKey = (query?: Record<string, unknown>) => JSON.stringify(query ?? {})

export const useTeamInvitationsFlow = (
  sentQuery?: TeamInviteSentQueryFilters,
  receivedQuery?: TeamInviteReceivedQueryFilters,
) => {
  const getSent = useGetTeamInvitesSent()
  const getReceived = useGetTeamInvitesReceived()
  const { showMessage } = useMessageHandler()
  const { normalizeInviteReceived, normalizeInviteSent } = useTeamInvitationModel()

  const loadSentInvites = useCallback(async () => {
    const queryKey = buildQueryKey(sentQuery)
    setTeamInvitesSentLoading(true)
    setTeamInvitesSentError(undefined)

    try {
      const response = await getSent(sentQuery)
      const payload = response.data
      if (!payload?.team_invites_sent) {
        setTeamInvitesSentError('Missing sent invitations response.')
        return null
      }

      const normalized = normalizeInviteSent(payload.team_invites_sent)
      if (normalized) {
        insertTeamInvitesSent(normalized)
      }

      setTeamInvitesSentResult({
        queryKey,
        query: sentQuery,
        pagination: payload.team_invites_sent_pagination,
      })

      return payload
    } catch (error) {
      console.error('Failed to load sent invitations', error)
      setTeamInvitesSentError('Unable to load sent invitations.')
      showMessage({ status: 500, message: 'Unable to load sent invitations.' })
      return null
    } finally {
      setTeamInvitesSentLoading(false)
    }
  }, [ sentQuery])

  const loadReceivedInvites = useCallback(async () => {
    const queryKey = buildQueryKey(receivedQuery)
    setTeamInvitesReceivedLoading(true)
    setTeamInvitesReceivedError(undefined)

    try {
      const response = await getReceived(receivedQuery)
      const payload = response.data
      if (!payload?.team_invites_received) {
        setTeamInvitesReceivedError('Missing received invitations response.')
        return null
      }

      const normalized = normalizeInviteReceived(payload.team_invites_received)
      if (normalized) {
        insertTeamInvitesReceived(normalized)
      }

      setTeamInvitesReceivedResult({
        queryKey,
        query: receivedQuery,
        pagination: payload.team_invites_received_pagination,
      })

      return payload
    } catch (error) {
      console.error('Failed to load received invitations', error)
      setTeamInvitesReceivedError('Unable to load received invitations.')
      showMessage({ status: 500, message: 'Unable to load received invitations.' })
      return null
    } finally {
      setTeamInvitesReceivedLoading(false)
    }
  }, [receivedQuery])

  useEffect(() => {
    void loadSentInvites()
  }, [loadSentInvites])

  useEffect(() => {
    void loadReceivedInvites()
  }, [loadReceivedInvites])

  return { loadSentInvites, loadReceivedInvites }
}
