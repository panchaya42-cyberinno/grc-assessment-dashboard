/**
 * hooks/use-local-storage.ts
 * Generic hook for localStorage persistence with SSR safety.
 *
 * Usage:
 *   const [data, setData] = useLocalStorage<DSRRecord[]>("pdpa_dsr_data", [])
 */

"use client"

import { useState, useEffect, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T)
      }
    } catch (err) {
      console.warn(`useLocalStorage: failed to read key "${key}"`, err)
    } finally {
      setIsLoaded(true)
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const nextValue = value instanceof Function ? value(storedValue) : value
        setStoredValue(nextValue)
        window.localStorage.setItem(key, JSON.stringify(nextValue))
      } catch (err) {
        console.warn(`useLocalStorage: failed to write key "${key}"`, err)
      }
    },
    [key, storedValue],
  )

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (err) {
      console.warn(`useLocalStorage: failed to remove key "${key}"`, err)
    }
  }, [key, initialValue])

  return [storedValue, setValue, { isLoaded, removeValue }] as const
}
