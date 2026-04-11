
import type { parentParams } from './MainPopup.types'
import { MainPopupProvider } from './MainPopupProvider'
import { popupLayoutVariantMap } from './MainPopupVariant.map'



type PropsPopupRoot = {
  onRequestClose: () => void
  children: React.ReactNode
  parentParams?: parentParams
  payload?: parentParams
}

export const MainPopup = ({ children, onRequestClose, parentParams, payload }: PropsPopupRoot) => {
  const targetVariant = parentParams?.layoutVariant ?? 'classic'
  const LayoutVariant = popupLayoutVariantMap[targetVariant]

  return (
    <MainPopupProvider onRequestClose={onRequestClose} parentParams={{...parentParams, ...payload}} >
      <LayoutVariant>
        {children}
      </LayoutVariant>
    </MainPopupProvider>
  )
}