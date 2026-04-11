import { createElement,  } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { v4 as uuidv4 } from "uuid"

// Keep payload flexible; simple object shapes should be allowed without requiring an index signature.
export type ActionPayload = any

export interface BeforeCloseConfig {
  shouldWarn?: () => boolean
  onSave?: () => Promise<void>
  message?: string
  saveLabel?: string
  discardLabel?: string
}

export interface ConfirmConfig {
  message: string
  onConfirm: () => void | Promise<void>
  confirmLabel?: string
  cancelLabel?: string
}

export interface ActionComponentProps<TPayload = ActionPayload> {
  payload?: TPayload
  onClose: () => void
  setPopupHeader?: (content: ReactNode | null) => void
  registerBeforeClose?: (config?: BeforeCloseConfig) => void
  openConfirm?: (config: ConfirmConfig) => void
  setIsLoading:(isLoading: boolean) => void
}

export interface ActionManagerOptions<
  TPayloadMap extends Record<PropertyKey, any>
> {
  blueprint?: ComponentType<any> | null
  stackRegistry: {
    [K in keyof TPayloadMap]: ComponentType<any>
  }
  closeDelayMs?: number
}

export interface ActionEntry<K extends PropertyKey, P> {
  id: string
  key: K
  payload?: P
  isClosing: boolean
  parentParams?: Record<string, unknown>
}

type StackEntryUnion<T extends Record<PropertyKey, any>> = {
  [K in keyof T]: ActionEntry<K, T[K]>
}[keyof T]


export type RenderStackProps ={
  variant?: string | null
  width?: number
}

export class StackActionManager <
  TPayloadMap extends Record<PropertyKey, any>
>{
  private stackEntries: StackEntryUnion<TPayloadMap>[] = []
  private listeners = new Set<() => void>()
  private readonly blueprint?: ComponentType<any> | null
  private readonly stackRegistry:{[K in keyof TPayloadMap]: ComponentType<any>}
  private readonly closeDelayMs: number

  constructor(options: ActionManagerOptions<TPayloadMap>) {
    this.blueprint = options?.blueprint
    this.stackRegistry = options.stackRegistry
    this.closeDelayMs = options.closeDelayMs ?? 0
  }

  open<K extends keyof TPayloadMap>(params:{
    key: K
    payload?:TPayloadMap[K]
    parentParams?:Record<string,unknown>
  }) {
    const key = params.key 
    const component = this.stackRegistry[key]
    
    if (!component) {
      throw new Error(`No action component registered for key: ${String(key)}`)
    }

    const entry: ActionEntry<K,TPayloadMap[K]> = {
      id: uuidv4(),
      key,
      payload: params.payload,
      parentParams: params.parentParams,
      isClosing: false,
    }

    this.stackEntries = [...this.stackEntries, entry]
    this.notify()
  }

  close(entryId?: string) {
    if (this.stackEntries.length === 0) {
      return
    }

    const targetIndex = entryId ? this.stackEntries.findIndex((entry) => entry.id === entryId) : this.stackEntries.length - 1

    if (targetIndex === -1) {
      return
    }

    if (this.closeDelayMs > 0) {
      this.stackEntries = this.stackEntries.map((entry, index) =>
        index >= targetIndex ? { ...entry, isClosing: true } : entry,
      )
      this.notify()
      setTimeout(() => {
        this.stackEntries = this.stackEntries.filter((_, index) => index < targetIndex)
        this.notify()
      }, this.closeDelayMs)
    } else {
      this.stackEntries = this.stackEntries.filter((_, index) => index < targetIndex)
      this.notify()
    }
  }
  closeExact(entryId: string) {
    const index = this.stackEntries.findIndex(e => e.id === entryId)
    if (index === -1) return

    if (this.closeDelayMs > 0) {
      this.stackEntries[index] = {
        ...this.stackEntries[index],
        isClosing: true,
      }
      this.notify()

      setTimeout(() => {
        this.stackEntries = this.stackEntries.filter(e => e.id !== entryId)
        this.notify()
      }, this.closeDelayMs)
    } else {
      this.stackEntries = this.stackEntries.filter(e => e.id !== entryId)
      this.notify()
    }
  }

  closeExactWithDelay(entryId: string, delayMs: number) {
    const index = this.stackEntries.findIndex((entry) => entry.id === entryId)
    if (index === -1) return

    const effectiveDelay = Math.max(0, delayMs)
    if (effectiveDelay === 0) {
      this.closeExact(entryId)
      return
    }

    this.stackEntries[index] = {
      ...this.stackEntries[index],
      isClosing: true,
    }
    this.notify()

    setTimeout(() => {
      this.stackEntries = this.stackEntries.filter((entry) => entry.id !== entryId)
      this.notify()
    }, effectiveDelay)
  }

  /**
   * Atomically removes an existing entry and opens a new one in a single notify().
   * AnimatePresence receives both changes in the same React render cycle, so the
   * exit animation (old entry) and enter animation (new entry) run simultaneously
   * via mode="sync" — no visible close-then-open sequence.
   */
  atomicOpenClose<K extends keyof TPayloadMap>(
    params: {
      key: K
      payload?: TPayloadMap[K]
      parentParams?: Record<string, unknown>
    },
    closeEntryId: string,
  ): void {
    const component = this.stackRegistry[params.key]
    if (!component) {
      throw new Error(`No action component registered for key: ${String(params.key)}`)
    }
    const newEntry: ActionEntry<K, TPayloadMap[K]> = {
      id: uuidv4(),
      key: params.key,
      payload: params.payload,
      parentParams: params.parentParams,
      isClosing: false,
    }
    this.stackEntries = [
      ...this.stackEntries.filter((e) => e.id !== closeEntryId),
      newEntry,
    ]
    this.notify()
  }
  closeByKey<K extends keyof TPayloadMap>(keys:K | readonly K[]): boolean {
    const keyList = Array.isArray(keys) ? keys : [keys]
    if (keyList.length === 0) {
      return false
    }
    const indices = this.stackEntries
      .map((entry, idx) => (keyList.includes(entry.key) ? idx : -1))
      .filter((idx) => idx >= 0)
    if (indices.length === 0) {
      return false
    }
    const earliestIndex = Math.min(...indices)
    const targetId = this.stackEntries[earliestIndex]?.id
    if (targetId) {
      this.close(targetId)
      return true
    }
    return false
  }

  closeAll() {
    this.stackEntries = []
    this.notify()
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot(): StackEntryUnion<TPayloadMap>[]{
    return this.stackEntries
  }

  hasKey(key: string): boolean {
    return this.stackEntries.some((entry) => entry.key === key && !entry.isClosing)
  }
  getOpenCount(): number {
    return this.stackEntries.filter((entry) => !entry.isClosing).length
  }
  getEntry(key: string){
    return this.stackEntries.find((entry) => entry.key === key)
  }
  getEntryPayload<K extends keyof TPayloadMap> (
    key:K
  ): TPayloadMap[K] | undefined {

    return this.getEntry( key as string )?.payload
  }

  closeLastOnEsc = (event:KeyboardEvent)=>{
    if(event.key !== 'Escape') return
    const entries = this.getSnapshot()
    const lastEntry = entries.at(-1)
    if(lastEntry){
      this.close(lastEntry.id)
    }
  }

  renderStack({variant, width}:RenderStackProps): ReactNode[] | undefined {
    const Blueprint = this.blueprint


    if (variant == 'dynamicSectionPanels'){
      return this.stackEntries.map((entry, index) => {
          const component = this.stackRegistry[entry.key]
          const isFirst = index === 0 
          const panelWidth = typeof width === 'number' && width > 0 ? width : null
          const baseClass = panelWidth == null
            ? 'h-full min-w-0 w-full max-w-full md:w-[400px]'
            : 'h-full min-w-0 w-full max-w-full'

          const RenderComp = createElement(component, {
                payload: entry.payload,
                onClose: () => this.close(entry.id),
          })

         

          return (
            <motion.div
              key={entry.id}
              initial={{ x: panelWidth ?? 400}}
              animate={{ x: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
               // custom drives the exit variant:
               //   false (user-close) → spring slide-out
               //   true  (replacement) → instant, invisible removal (B is already on top)
               custom={entry.isClosing}
               variants={{
                 exit: (isReplacement: boolean) =>
                   isReplacement
                     ? { x: 0, transition: { duration: 0 } }
                     : { x: panelWidth ?? 400, transition: { type: 'spring', stiffness: 300, damping: 30 } },
               }}
               exit="exit"
               className={
                 isFirst
                   ? baseClass
                   : `${baseClass} absolute top-0 left-0`
               }
               style={panelWidth == null ? undefined : { width: panelWidth, maxWidth: '100%' }}
            >
              {Blueprint  
                ? <Blueprint
                    position={index}
                    parentParams={entry.parentParams}
                    payload={entry.payload}
                    onRequestClose={() => this.close(entry.id)}
                  >
                    {RenderComp}
                  </Blueprint>
                : RenderComp
              }
            </motion.div>
          )
        })
    }
    else{

       return this.stackEntries.map((entry, index) => {
        const component = this.stackRegistry[entry.key]
        const RenderComp = createElement(component, {
            payload: entry.payload,
            onClose: () => this.close(entry.id),
          })
        return ( 
          <>
            {Blueprint
              ? <Blueprint 
                  key={entry.id} 
                  id={entry.id} 
                  position={index} 
                  parentParams={entry.parentParams}
                  payload={entry.payload}
                  onRequestClose={() => this.close(entry.id)}
                >
                    {RenderComp}
                </Blueprint>
            

              : RenderComp
            }
          </>
        )
      })
    }
  }


  private notify() {
    this.listeners.forEach((listener) => listener())
  }
}
