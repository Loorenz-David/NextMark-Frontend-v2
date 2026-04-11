import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import type { CountryCode } from 'libphonenumber-js'

import { DEFAULT_PREFIX, PHONE_PREFIX_STORAGE_KEY } from '@/constants/dropDownOptions'
import type { Phone } from '@/types/phone'
import { phonePrefixes } from './phonePrefixes'
import type { PhonePrefixOption } from './phonePrefixes'

type PhoneFieldControllerProps = {
  phoneNumber: Phone
  onChange: (value: Phone) => void
}

const isBrowser = typeof window !== 'undefined'

const getStoredPrefix = (): string | null => {
  if (!isBrowser) return null
  try {
    return window.localStorage.getItem(PHONE_PREFIX_STORAGE_KEY)
  } catch {
    return null
  }
}

const persistPrefix = (prefix: string) => {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(PHONE_PREFIX_STORAGE_KEY, prefix)
  } catch {
    // Ignore storage write errors to keep the field usable.
  }
}

export const usePhoneFieldControllers = ({
  phoneNumber,
  onChange,
}: PhoneFieldControllerProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const selectedPrefix = useMemo(
    () => phonePrefixes.find((option) => option.value === phoneNumber.prefix) ?? null,
    [phoneNumber.prefix],
  )

  const filteredPrefixes = useMemo(() => {
    const normalized = inputValue.trim().toLowerCase()
    if (!normalized) return phonePrefixes
    return phonePrefixes.filter((option) =>
      option.countryName.toLowerCase().includes(normalized) || option.value.includes(normalized) || option.display.toLowerCase().includes(normalized),
    )
  }, [inputValue])

  useEffect(() => {
    if (isOpen) return
    setInputValue(selectedPrefix?.display ?? phoneNumber.prefix)
  }, [isOpen, phoneNumber.prefix, selectedPrefix?.display])

  useEffect(() => {
    const storedPrefix = getStoredPrefix()
    if (!storedPrefix) return

    const hasValidStoredPrefix = phonePrefixes.some((option) => option.value === storedPrefix)
    if (!hasValidStoredPrefix) return

    if (phoneNumber.prefix !== DEFAULT_PREFIX) return
    if (storedPrefix === phoneNumber.prefix) return
    // Avoid mutating pristine create forms on mount when no number exists yet.
    if (!String(phoneNumber.number ?? '').trim()) return

    onChange({ ...phoneNumber, prefix: storedPrefix })
  }, [onChange, phoneNumber])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open)
      if (!open) {
        setInputValue(selectedPrefix?.display ?? phoneNumber.prefix)
        inputRef.current?.blur()
      }
    },
    [phoneNumber.prefix, selectedPrefix?.display],
  )

  const handleInputFocus = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputValue(value)
    setIsOpen(true)
  }, [])

  const handleSelectPrefix = useCallback(
    (prefixOption: PhonePrefixOption) => {
      persistPrefix(prefixOption.value)
      onChange({ ...phoneNumber, prefix: prefixOption.value })
      setInputValue(prefixOption.display)
      requestAnimationFrame(() => {
        setIsOpen(false)
        inputRef.current?.blur()
      })
    },
    [onChange, phoneNumber],
  )

  const handleNumberChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value.replace(/\s+/g, '')

      if (!selectedPrefix?.countryCode) {
        onChange({ ...phoneNumber, number: rawValue })
        return
      }

      const parsed = parsePhoneNumberFromString(rawValue, selectedPrefix.countryCode as CountryCode)

      if (parsed) {
        onChange({
          ...phoneNumber,
          number: parsed.nationalNumber,
        })
      } else {
        onChange({
          ...phoneNumber,
          number: rawValue,
        })
      }
    },
    [onChange, phoneNumber, selectedPrefix],
  )

  return {
    inputRef,
    isOpen,
    inputValue,
    selectedPrefix,
    filteredPrefixes,
    handleOpenChange,
    handleInputFocus,
    handleInputChange,
    handleSelectPrefix,
    handleNumberChange,
  }
}
