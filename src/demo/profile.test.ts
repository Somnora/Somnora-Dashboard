import { demoProfile } from './profile'

describe('demo profile fixture', () => {
  it('covers every planned conversation mode and ecosystem view', () => {
    expect(demoProfile.conversations.map((thread) => thread.mode).sort()).toEqual([
      'daily',
      'dream',
      'eureka',
    ])
    expect(demoProfile.metrics).toHaveLength(7)
    expect(demoProfile.themes.map((theme) => theme.kind)).toEqual(
      expect.arrayContaining(['person', 'emotion', 'subject', 'concern', 'imagery']),
    )
    expect(demoProfile.memoryNodes.length).toBeGreaterThanOrEqual(18)
    expect(demoProfile.memoryEdges.length).toBeGreaterThanOrEqual(18)
    expect(demoProfile.fieldNoteImages).toHaveLength(3)
  })

  it('contains no raw photo, health, or personal account payloads', () => {
    const serialized = JSON.stringify(demoProfile)

    expect(serialized).not.toContain('data:image')
    expect(serialized).not.toContain('firebaseUid')
    expect(serialized).not.toContain('accessToken')
    expect(demoProfile.metadata.isDemo).toBe(true)
  })
})
