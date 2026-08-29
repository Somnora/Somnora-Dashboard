import { demoProfile } from '../demo/profile'
import {
  activityCatalog,
  activityVariantFits,
  createStudioPreferences,
  matchStudioActivity,
} from './activityStudio'

function activity(id: string) {
  const result = activityCatalog.find((item) => item.id === id)
  if (!result) throw new Error(`Missing activity ${id}`)
  return result
}

describe('Activity Studio matching', () => {
  it('uses an indoor alternative when rain holds the outdoor version', () => {
    const preferences = {
      ...createStudioPreferences(demoProfile),
      weather: 'rain' as const,
    }
    const match = matchStudioActivity(activity('three-beautiful-things'), preferences)

    expect(match.fit).toBe('adjusted')
    expect(match.variant.id).toBe('inside')
  })

  it('keeps social and sharing boundaries independent', () => {
    const preferences = {
      ...createStudioPreferences(demoProfile),
      socialBandwidth: 'high' as const,
      privacy: 'private-only' as const,
    }
    const match = matchStudioActivity(activity('one-honest-question'), preferences)

    expect(match.variant.id).toBe('private-rehearsal')
    expect(activityVariantFits(activity('one-honest-question').variants[0], preferences)).toBe(false)
  })

  it('finds a five minute stationary version under low capacity', () => {
    const preferences = {
      ...createStudioPreferences(demoProfile),
      maxMinutes: 5 as const,
      energy: 'low' as const,
      movement: 'stationary' as const,
      socialBandwidth: 'low' as const,
    }
    const match = matchStudioActivity(activity('six-line-story'), preferences)

    expect(match.fit).toBe('adjusted')
    expect(match.variant.id).toBe('one-breath-lines')
  })

  it('marks only implemented Workbench exercises as interactive', () => {
    expect(activityCatalog.filter((item) => item.availability === 'interactive')
      .map((item) => item.id)).toEqual(['six-line-story', 'private-release'])
    expect(activity('breathing-reset').availability).toBe('continuity')
    expect(activity('tiny-detour').availability).toBe('preview')
  })
})
