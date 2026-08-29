import { parseWeatherPayload } from '../domain/connectors'
import type { WeatherApiPayload, WeatherSnapshot } from '../domain/connectors'
import type { ApproximateCoordinates } from './browserLocation'

const weatherEndpoint = 'https://api.open-meteo.com/v1/forecast'
const maximumResponseBytes = 16 * 1024

export async function fetchCurrentWeather(
  coordinates: ApproximateCoordinates,
  fetcher: typeof fetch = fetch,
): Promise<WeatherSnapshot> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 8_000)
  const query = new URLSearchParams({
    latitude: coordinates.latitude.toFixed(4),
    longitude: coordinates.longitude.toFixed(4),
    current: 'temperature_2m,precipitation,weather_code',
    temperature_unit: 'fahrenheit',
    timezone: 'auto',
    forecast_days: '1',
  })

  try {
    const response = await fetcher(`${weatherEndpoint}?${query.toString()}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error('Live weather is temporarily unavailable.')
    const body = await response.text()
    if (new TextEncoder().encode(body).byteLength > maximumResponseBytes) {
      throw new Error('Weather response exceeded the safe size limit.')
    }
    return parseWeatherPayload(JSON.parse(body) as WeatherApiPayload)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Live weather timed out. The seeded fallback remains active.', { cause: error })
    }
    if (error instanceof SyntaxError) {
      throw new Error('Live weather returned an unreadable response.', { cause: error })
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}
