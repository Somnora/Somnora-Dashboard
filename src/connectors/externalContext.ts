import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { demoCalendarText, initialExternalContextState } from '../demo/externalContext'
import {
  normalizeExternalContext,
  parseCalendarAvailability,
} from '../domain/connectors'
import type {
  ExternalContextState,
  NormalizedExternalContext,
} from '../domain/connectors'
import { requestLocationOnce } from './browserLocation'
import { fetchCurrentWeather } from './openMeteoWeather'

interface ExternalContextValue {
  state: ExternalContextState
  normalized: NormalizedExternalContext
  requestLiveWeather: () => Promise<void>
  importCalendar: (file: File) => Promise<void>
  loadDemoDay: () => void
  clearCalendar: () => void
  restoreDemoWeather: () => void
}

const ExternalContext = createContext<ExternalContextValue | null>(null)

function clonedInitialState(): ExternalContextState {
  return structuredClone(initialExternalContextState)
}

export function ExternalContextProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<ExternalContextState>(clonedInitialState)

  const requestLiveWeather = useCallback(async () => {
    setState((current) => ({
      ...current,
      connectors: {
        ...current.connectors,
        location: {
          ...current.connectors.location,
          status: 'loading',
          failureMessage: undefined,
          freshnessLabel: 'Requesting browser permission',
        },
        weather: {
          ...current.connectors.weather,
          status: 'loading',
          failureMessage: undefined,
          freshnessLabel: 'Waiting for one-time location',
        },
      },
    }))

    try {
      const coordinates = await requestLocationOnce()
      const weather = await fetchCurrentWeather(coordinates)
      setState((current) => ({
        ...current,
        weather,
        connectors: {
          ...current.connectors,
          location: {
            ...current.connectors.location,
            status: 'ready',
            permission: 'granted-once',
            sourceMode: 'live',
            sourceLabel: 'Browser Geolocation API',
            freshnessLabel: 'Used once, coordinates discarded',
            failureMessage: undefined,
          },
          weather: {
            ...current.connectors.weather,
            status: 'ready',
            permission: 'granted-once',
            sourceMode: 'live',
            sourceLabel: weather.sourceLabel,
            freshnessLabel: `Observed ${weather.observedAt}`,
            failureMessage: undefined,
          },
        },
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'External context could not be refreshed.'
      const denied = message.toLowerCase().includes('denied')
      setState((current) => ({
        ...current,
        connectors: {
          ...current.connectors,
          location: {
            ...current.connectors.location,
            status: 'failed',
            permission: denied ? 'denied' : 'not-requested',
            sourceMode: 'seeded',
            sourceLabel: 'Demo area fallback',
            freshnessLabel: 'Seeded fallback active',
            failureMessage: message,
          },
          weather: {
            ...current.connectors.weather,
            status: 'ready',
            permission: 'demo-only',
            sourceMode: 'seeded',
            sourceLabel: 'Privacy-safe demo weather',
            freshnessLabel: 'Seeded fallback active',
            failureMessage: message,
          },
        },
      }))
    }
  }, [])

  const applyCalendarSummary = useCallback((calendarText: string, now: Date) => {
    const calendar = parseCalendarAvailability(calendarText, now)
    setState((current) => ({
      ...current,
      calendar,
      connectors: {
        ...current.connectors,
        calendar: {
          ...current.connectors.calendar,
          status: 'ready',
          permission: calendar.sourceMode === 'local-file' ? 'local-file' : 'demo-only',
          sourceMode: calendar.sourceMode,
          sourceLabel: calendar.sourceLabel,
          freshnessLabel: 'Summarized for the next eight hours',
          failureMessage: undefined,
        },
      },
    }))
  }, [])

  const importCalendar = useCallback(async (file: File) => {
    setState((current) => ({
      ...current,
      connectors: {
        ...current.connectors,
        calendar: {
          ...current.connectors.calendar,
          status: 'loading',
          freshnessLabel: 'Reading locally',
          failureMessage: undefined,
        },
      },
    }))
    try {
      applyCalendarSummary(await file.text(), new Date())
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Calendar file could not be summarized.'
      setState((current) => ({
        ...current,
        connectors: {
          ...current.connectors,
          calendar: {
            ...current.connectors.calendar,
            status: 'failed',
            permission: 'not-requested',
            sourceMode: 'disconnected',
            sourceLabel: 'No calendar connected',
            freshnessLabel: 'Import failed',
            failureMessage: message,
          },
        },
      }))
    }
  }, [applyCalendarSummary])

  const loadDemoDay = useCallback(() => {
    const calendar = parseCalendarAvailability(
      demoCalendarText,
      new Date('2026-08-28T18:30:00.000Z'),
    )
    setState((current) => ({
      ...current,
      calendar: {
        ...calendar,
        sourceMode: 'seeded',
        sourceLabel: 'Privacy-safe demo calendar summary',
      },
      connectors: {
        ...current.connectors,
        calendar: {
          ...current.connectors.calendar,
          status: 'ready',
          permission: 'demo-only',
          sourceMode: 'seeded',
          sourceLabel: 'Privacy-safe demo calendar summary',
          freshnessLabel: 'Seeded for Aug 28',
          failureMessage: undefined,
        },
      },
    }))
  }, [])

  const clearCalendar = useCallback(() => {
    setState((current) => ({
      ...current,
      calendar: clonedInitialState().calendar,
      connectors: {
        ...current.connectors,
        calendar: clonedInitialState().connectors.calendar,
      },
    }))
  }, [])

  const restoreDemoWeather = useCallback(() => {
    setState((current) => ({
      ...current,
      weather: clonedInitialState().weather,
      connectors: {
        ...current.connectors,
        location: clonedInitialState().connectors.location,
        weather: clonedInitialState().connectors.weather,
      },
    }))
  }, [])

  const value = useMemo(() => ({
    state,
    normalized: normalizeExternalContext(state),
    requestLiveWeather,
    importCalendar,
    loadDemoDay,
    clearCalendar,
    restoreDemoWeather,
  }), [
    clearCalendar,
    importCalendar,
    loadDemoDay,
    restoreDemoWeather,
    state,
    requestLiveWeather,
  ])

  return createElement(ExternalContext.Provider, { value }, children)
}

export function useExternalContext(): ExternalContextValue {
  const context = useContext(ExternalContext)
  if (!context) throw new Error('useExternalContext must be used within ExternalContextProvider')
  return context
}
