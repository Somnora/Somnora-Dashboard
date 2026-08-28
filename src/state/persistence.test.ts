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
        simulated: true,
        actionId: 'demo-action-1',
      },
    })

    expect(loadDemoProgress(sessionStorage)).toEqual({
      invitationAccepted: true,
      delivery: {
        status: 'in-progress',
        progressCount: 2,
        simulated: true,
        actionId: 'demo-action-1',
      },
    })
    expect(sessionStorage).toHaveLength(1)
    expect(sessionStorage.getItem(persistenceKeys.demoProgress)).not.toContain('text')
  })
})
