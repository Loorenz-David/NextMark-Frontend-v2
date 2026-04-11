import { useContext } from 'react'
import type { KnownResourceRegistry, ResourceRegistry } from './ResourceManagerContext'
import { ResourcesManagerContext } from './ResourceManagerContext'
import type { BaseControls } from './types'


export function useResourceManager<T extends Record<string, unknown> = KnownResourceRegistry>() {
  const context = useContext(ResourcesManagerContext)
  if (!context) {
    throw new Error('ResourcesManagerContext is not available. Wrap your app with ResourcesManagerProvider.')
  }
  return context as ResourceRegistry<T>
}

export function usePopupManager(){
  const {popupManager} = useResourceManager<KnownResourceRegistry>()
  if (!popupManager){
    throw new Error("popupManager is not available. register a popup manager to the ResourcesManagerContext")
  }
  return popupManager
}

export function useSectionManager(){
  const {sectionManager} = useResourceManager<KnownResourceRegistry>()
  if (!sectionManager){
    throw new Error("sectionManager is not available. register a popup manager to the ResourcesManagerContext")
  }
  return sectionManager
}

export function useOptionalSectionManager() {
  const context = useContext(ResourcesManagerContext)
  return context?.sectionManager
}

export function useBaseControlls<TPayload = unknown>() {
  const {baseControlls} = useResourceManager<KnownResourceRegistry>()
   if (!baseControlls){
    throw new Error("baseControlls is not available. register a popup manager to the ResourcesManagerContext")
  }
  return baseControlls as BaseControls<TPayload>
}

export function useMapManager() {
  const { mapManager } = useResourceManager<KnownResourceRegistry>()
  if (!mapManager) {
    throw new Error('mapManager is not available. register a map manager to the ResourcesManagerContext')
  }
  return mapManager
}

