import type { DemoContext } from './types'

export type ConnectorId =
  | 'location'
  | 'weather'
  | 'calendar'
  | 'events'
  | 'fitness'
  | 'nutrition'

export type ConnectorPermission =
  | 'not-requested'
  | 'granted-once'
  | 'local-file'
  | 'demo-only'
  | 'denied'
  | 'unavailable'

export type ConnectorSourceMode =
  | 'seeded'
  | 'live'
  | 'local-file'
  | 'disconnected'

export type ConnectorStatus = 'ready' | 'waiting' | 'loading' | 'failed' | 'disconnected'

export interface ConnectorDescriptor {
  id: ConnectorId
  title: string
  summary: string
  status: ConnectorStatus
  permission: ConnectorPermission
  sourceMode: ConnectorSourceMode
  sourceLabel: string
  freshnessLabel: string
  reasonForUse: string
  dataBoundary: string
  failureMessage?: string
}

export interface WeatherSnapshot {
  condition: DemoContext['weather']
  label: string
  temperatureFahrenheit: number
  precipitationMillimeters: number
  observedAt: string
  sourceMode: 'seeded' | 'live'
  sourceLabel: string
}

export interface CalendarAvailability {
  busyBlocks: number
  busyMinutes: number
  availableMinutes: 5 | 10 | 20 | 30
  windowStart: string
  windowEnd: string
  sourceMode: 'seeded' | 'local-file' | 'disconnected'
  sourceLabel: string
}

export interface LocalEventOpportunity {
  id: string
  title: string
  whenLabel: string
  setting: 'indoors' | 'outdoors'
  energy: 'low' | 'medium'
  social: 'private' | 'optional-contact'
  latitude: number
  longitude: number
  sourceLabel: string
  freshnessLabel: string
}

export interface ExternalContextState {
  connectors: Record<ConnectorId, ConnectorDescriptor>
  weather: WeatherSnapshot
  calendar: CalendarAvailability
  events: LocalEventOpportunity[]
}

export interface NormalizedExternalContext {
  weather: DemoContext['weather']
  weatherLabel: string
  weatherSource: string
  availableMinutes: 5 | 10 | 20 | 30
  calendarSource: string
  eventCount: number
}

export interface WeatherApiPayload {
  current?: {
    time?: unknown
    temperature_2m?: unknown
    precipitation?: unknown
    weather_code?: unknown
  }
}

export const maximumCalendarBytes = 256 * 1024

function finiteNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Weather response ${field} is invalid.`)
  }
  return value
}

export function weatherConditionFromCode(
  weatherCode: number,
  temperatureFahrenheit: number,
): DemoContext['weather'] {
  if (temperatureFahrenheit >= 86) return 'hot'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99].includes(weatherCode)) {
    return 'rain'
  }
  return 'clear'
}

export function weatherLabelFromCode(weatherCode: number): string {
  if (weatherCode === 0) return 'Clear sky'
  if ([1, 2].includes(weatherCode)) return 'Partly cloudy'
  if (weatherCode === 3) return 'Overcast'
  if ([45, 48].includes(weatherCode)) return 'Foggy'
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return 'Drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return 'Rain'
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return 'Snow'
  if ([95, 96, 99].includes(weatherCode)) return 'Thunderstorm'
  return 'Current conditions'
}

export function parseWeatherPayload(payload: WeatherApiPayload): WeatherSnapshot {
  if (!payload.current || typeof payload.current.time !== 'string') {
    throw new Error('Weather response is missing current conditions.')
  }
  const temperature = finiteNumber(payload.current.temperature_2m, 'temperature')
  const precipitation = finiteNumber(payload.current.precipitation, 'precipitation')
  const code = finiteNumber(payload.current.weather_code, 'weather code')
  if (code < 0 || code > 99 || precipitation < 0 || temperature < -100 || temperature > 150) {
    throw new Error('Weather response is outside supported bounds.')
  }
  return {
    condition: weatherConditionFromCode(code, temperature),
    label: weatherLabelFromCode(code),
    temperatureFahrenheit: Math.round(temperature),
    precipitationMillimeters: precipitation,
    observedAt: payload.current.time,
    sourceMode: 'live',
    sourceLabel: 'Open-Meteo current conditions',
  }
}

function unfoldCalendar(value: string): string[] {
  return value
    .replaceAll('\r\n', '\n')
    .replaceAll(/\n[ \t]/g, '')
    .split('\n')
}

function parseCalendarDate(value: string): Date | null {
  const trimmed = value.trim()
  const dateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(trimmed)
  if (dateOnly) {
    return new Date(Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])))
  }
  const dateTime = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/.exec(trimmed)
  if (!dateTime) return null
  const parts = [
    Number(dateTime[1]),
    Number(dateTime[2]) - 1,
    Number(dateTime[3]),
    Number(dateTime[4]),
    Number(dateTime[5]),
    Number(dateTime[6] ?? 0),
  ] as const
  if (dateTime[7] === 'Z') {
    return new Date(Date.UTC(...parts))
  }
  return new Date(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5])
}

interface BusyInterval {
  start: number
  end: number
}

function availabilityFromGap(minutes: number): CalendarAvailability['availableMinutes'] {
  if (minutes >= 30) return 30
  if (minutes >= 20) return 20
  if (minutes >= 10) return 10
  return 5
}

export function parseCalendarAvailability(
  calendarText: string,
  now: Date = new Date(),
): CalendarAvailability {
  if (new TextEncoder().encode(calendarText).byteLength > maximumCalendarBytes) {
    throw new Error('Calendar file is larger than 256 KB.')
  }
  if (!calendarText.includes('BEGIN:VCALENDAR')) {
    throw new Error('Choose a valid ICS calendar file.')
  }

  const windowStart = now.getTime()
  const windowEnd = windowStart + 8 * 60 * 60 * 1000
  const intervals: BusyInterval[] = []
  let eventStart: Date | null = null
  let eventEnd: Date | null = null

  for (const line of unfoldCalendar(calendarText)) {
    if (line.startsWith('BEGIN:VEVENT')) {
      eventStart = null
      eventEnd = null
    } else if (line.startsWith('DTSTART')) {
      eventStart = parseCalendarDate(line.slice(line.indexOf(':') + 1))
    } else if (line.startsWith('DTEND')) {
      eventEnd = parseCalendarDate(line.slice(line.indexOf(':') + 1))
    } else if (line.startsWith('END:VEVENT') && eventStart && eventEnd && eventEnd > eventStart) {
      const start = Math.max(windowStart, eventStart.getTime())
      const end = Math.min(windowEnd, eventEnd.getTime())
      if (start < end) intervals.push({ start, end })
    }
  }

  const merged = intervals
    .sort((left, right) => left.start - right.start)
    .reduce<BusyInterval[]>((result, interval) => {
      const previous = result.at(-1)
      if (!previous || interval.start > previous.end) return [...result, { ...interval }]
      previous.end = Math.max(previous.end, interval.end)
      return result
    }, [])

  let cursor = windowStart
  let largestGap = 0
  let busyMilliseconds = 0
  for (const interval of merged) {
    largestGap = Math.max(largestGap, interval.start - cursor)
    busyMilliseconds += interval.end - interval.start
    cursor = Math.max(cursor, interval.end)
  }
  largestGap = Math.max(largestGap, windowEnd - cursor)

  return {
    busyBlocks: merged.length,
    busyMinutes: Math.round(busyMilliseconds / 60_000),
    availableMinutes: availabilityFromGap(Math.floor(largestGap / 60_000)),
    windowStart: new Date(windowStart).toISOString(),
    windowEnd: new Date(windowEnd).toISOString(),
    sourceMode: 'local-file',
    sourceLabel: 'Local ICS availability summary',
  }
}

export function normalizeExternalContext(state: ExternalContextState): NormalizedExternalContext {
  return {
    weather: state.weather.condition,
    weatherLabel: state.weather.label,
    weatherSource: state.weather.sourceLabel,
    availableMinutes: state.calendar.sourceMode === 'disconnected'
      ? 30
      : state.calendar.availableMinutes,
    calendarSource: state.calendar.sourceLabel,
    eventCount: state.events.length,
  }
}

export function mapsUrl(event: LocalEventOpportunity): string {
  const params = new URLSearchParams({
    ll: `${event.latitude},${event.longitude}`,
    q: event.title,
  })
  return `https://maps.apple.com/?${params.toString()}`
}
