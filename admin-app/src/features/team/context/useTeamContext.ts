import { useContext } from 'react'

import { TeamContext } from './TeamContext'

export const useTeamContext = () => {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error('useTeamContext must be used within TeamProvider.')
  }
  return context
}

export const useTeamSectionManager = () => useTeamContext().sectionManager

export const useTeamPopupManager = () => useTeamContext().popupManager
