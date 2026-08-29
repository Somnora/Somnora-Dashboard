import { persistenceKeys, loadDemoProgress, loadPreferences, saveDemoProgress, savePreferences } from './persistence'

describe('safe persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('stores only nonsensitive preferences in local storage', () => {
    savePreferences(localStorage, { autonomy: 'active', stretch: 'open' })

    expect(loadPreferences(localStorage)).toEqual({
      autonomy: 'active',
      stretch: 'open',
    })
    expect(localStorage).toHaveLength(1)
    expect(localStorage.getItem(persistenceKeys.preferences)).not.toContain('reflection')
  })

  it('stores only a bounded simulated delivery snapshot in session storage', () => {
    saveDemoProgress(sessionStorage, {
      invitationAccepted: true,
      delivery: {
        status: 'in-progress',
        progressCount: 2,
        progressTarget: 3,
        progressUnit: 'discoveries',
        simulated: true,
        actionId: 'demo-action-1',
        actionType: 'three-beautiful-things',
        route: 'watch-via-iphone',
        expiresAt: '2026-08-28T20:30:00.000Z',
        updatedAt: '2026-08-28T19:15:00.000Z',
      },
    })

    expect(loadDemoProgress(sessionStorage)).toEqual({
      invitationAccepted: true,
      delivery: {
        status: 'in-progress',
        progressCount: 2,
        progressTarget: 3,
        progressUnit: 'discoveries',
        simulated: true,
        actionId: 'demo-action-1',
        actionType: 'three-beautiful-things',
        route: 'watch-via-iphone',
        expiresAt: '2026-08-28T20:30:00.000Z',
        updatedAt: '2026-08-28T19:15:00.000Z',
      },
    })
    expect(sessionStorage).toHaveLength(1)
    const stored = sessionStorage.getItem(persistenceKeys.demoProgress)
    expect(stored).not.toContain('text')
    expect(stored).not.toContain('prompt')
    expect(stored).not.toContain('consent')
  })

  it('rejects impossible or unbounded restored progress', () => {
    sessionStorage.setItem(persistenceKeys.demoProgress, JSON.stringify({
      invitationAccepted: true,
      delivery: {
        status: 'completed',
        progressCount: 2,
        progressTarget: 3,
        progressUnit: 'discoveries',
        simulated: true,
        actionId: '<script>',
        updatedAt: 'not-a-date',
      },
    }))

    expect(loadDemoProgress(sessionStorage)).toBeNull()
  })
})
