import { demoProfile } from '../demo/profile'
import { initialWorkbenchState } from '../state/initialState'
import { buildGrowthStories, growthReflectionCopy } from './growthStory'

describe('growth stories', () => {
  it('covers confirmed change, returned curiosity, and user-chosen experiments', () => {
    const stories = buildGrowthStories(demoProfile, initialWorkbenchState)

    expect(stories.map((story) => story.kind)).toEqual([
      'sustained-boundary',
      'returned-curiosity',
      'chosen-experiment',
    ])
    expect(stories[0]).toMatchObject({
      confidence: 'confirmed',
      evidenceIds: ['evidence-broke-late-scroll'],
    })
    expect(stories[2].summary).toContain('does not reward disclosure')
  })

  it('removes a story when its supporting memory has been forgotten', () => {
    const stories = buildGrowthStories(demoProfile, {
      ...initialWorkbenchState,
      memoryOverlay: {
        corrections: {
          'growth-bedtime-boundary': {
            nodeId: 'growth-bedtime-boundary',
            kind: 'forgotten',
          },
        },
      },
    })

    expect(stories.find((story) => story.id === 'growth-boundary-held')).toBeUndefined()
  })

  it('keeps user review session-scoped and preserves uncertainty', () => {
    const stories = buildGrowthStories(demoProfile, {
      ...initialWorkbenchState,
      growthReflections: { 'growth-curiosity-returned': 'needs-nuance' },
    })

    expect(stories[1].reflection).toBe('needs-nuance')
    expect(growthReflectionCopy(stories[1].reflection)).toContain('open to your correction')
  })
})
