import {
  mapsUrl,
  parseCalendarAvailability,
  parseWeatherPayload,
  weatherConditionFromCode,
} from './connectors'

describe('external connector boundaries', () => {
  it('maps bounded current weather into Activity Studio conditions', () => {
    expect(weatherConditionFromCode(0, 72)).toBe('clear')
    expect(weatherConditionFromCode(61, 72)).toBe('rain')
    expect(weatherConditionFromCode(0, 91)).toBe('hot')
    expect(parseWeatherPayload({
      current: {
        time: '2026-08-28T20:00',
        temperature_2m: 71.6,
        precipitation: 0,
        weather_code: 2,
      },
    })).toMatchObject({
      condition: 'clear',
      label: 'Partly cloudy',
      temperatureFahrenheit: 72,
      sourceMode: 'live',
    })
  })

  it('reduces a calendar file to busy blocks and availability only', () => {
    const summary = parseCalendarAvailability([
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'DTSTART:20260828T170000Z',
      'DTEND:20260828T174500Z',
      'SUMMARY:Private therapy appointment',
      'LOCATION:Private address',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'DTSTART:20260828T180000Z',
      'DTEND:20260828T190000Z',
      'SUMMARY:Confidential project',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n'), new Date('2026-08-28T16:30:00.000Z'))

    expect(summary).toEqual(expect.objectContaining({
      busyBlocks: 2,
      busyMinutes: 105,
      availableMinutes: 30,
      sourceMode: 'local-file',
    }))
    expect(JSON.stringify(summary)).not.toContain('therapy')
    expect(JSON.stringify(summary)).not.toContain('Confidential')
    expect(JSON.stringify(summary)).not.toContain('address')
  })

  it('fails closed on malformed or oversized connector payloads', () => {
    expect(() => parseWeatherPayload({ current: { time: 'now' } })).toThrow(/temperature/)
    expect(() => parseCalendarAvailability('not a calendar')).toThrow(/valid ICS/)
  })

  it('creates a user-initiated Apple Maps link without hidden navigation', () => {
    const url = mapsUrl({
      id: 'demo',
      title: 'Twilight sketch circle',
      whenLabel: 'Tonight',
      setting: 'outdoors',
      energy: 'low',
      social: 'optional-contact',
      latitude: 34.05,
      longitude: -118.24,
      sourceLabel: 'Demo',
      freshnessLabel: 'Seeded',
    })
    expect(url).toContain('https://maps.apple.com/')
    expect(url).toContain('Twilight+sketch+circle')
  })
})
