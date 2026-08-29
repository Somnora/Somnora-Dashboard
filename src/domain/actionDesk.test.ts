import { demoProfile } from '../demo/profile'
import { initialWorkbenchState } from '../state/initialState'
import { buildActionDeskRecords } from './actionDesk'
import type { WorkbenchState } from './types'

function stateWith(overrides: Partial<WorkbenchState>): WorkbenchState {
  return {
    ...initialWorkbenchState,
    ...overrides,
    delivery: {
      ...initialWorkbenchState.delivery,
      ...overrides.delivery,
    },
  }
}

describe('Action Desk records', () => {
  it('separates Nora noticing from a proposal that still waits for the user', () => {
    const records = buildActionDeskRecords(demoProfile, initialWorkbenchState)
    const notice = records.find((record) => record.stage === 'noticed')
    const proposal = records.find((record) => record.current && record.stage === 'proposed')

    expect(notice).toMatchObject({
      consentState: 'not-requested',
      actor: 'nora',
    })
    expect(proposal).toMatchObject({
      consentState: 'awaiting-user',
      actionType: 'three-beautiful-things',
    })
    expect(proposal?.route).toBeUndefined()
  })

  it('shows approval without implying that a device handoff exists', () => {
    const records = buildActionDeskRecords(demoProfile, stateWith({
      invitationDisposition: 'accepted',
    }))
    const current = records.find((record) => record.current && record.actionType)

    expect(current).toMatchObject({
      stage: 'approved',
      consentState: 'approved',
      route: 'watch-via-iphone',
    })
    expect(current?.summary).toContain('Nothing has been sent')
  })

  it('maps runtime lifecycle outcomes without turning decline into failure', () => {
    const active = buildActionDeskRecords(demoProfile, stateWith({
      invitationDisposition: 'accepted',
      delivery: {
        ...initialWorkbenchState.delivery,
        status: 'in-progress',
        actionId: 'demo-action-1',
        actionType: 'three-beautiful-things',
        route: 'watch-via-iphone',
        progressCount: 1,
        updatedAt: '2026-08-28T01:00:00.000Z',
      },
    })).find((record) => record.current && record.actionType)
    const declined = buildActionDeskRecords(demoProfile, stateWith({
      invitationDisposition: 'declined',
    })).find((record) => record.current && record.actionType)

    expect(active).toMatchObject({ stage: 'active', actor: 'device' })
    expect(active?.progress).toMatchObject({ completed: 1, target: 3 })
    expect(declined).toMatchObject({ stage: 'declined', consentState: 'declined' })
    expect(declined?.summary).toContain('not a failure')
  })

  it('includes calm seeded examples for completed, failed, and declined history', () => {
    const history = buildActionDeskRecords(demoProfile, initialWorkbenchState)
      .filter((record) => record.provenance === 'seeded-history')

    expect(history.map((record) => record.stage)).toEqual([
      'completed',
      'failed',
      'declined',
    ])
    expect(history.find((record) => record.stage === 'failed')?.summary)
      .toContain('Nothing was marked delivered')
  })

  it('keeps a blocked suggestion out of the Desk while retaining the noticed signal', () => {
    const records = buildActionDeskRecords(demoProfile, stateWith({
      consentPolicies: {
        ...initialWorkbenchState.consentPolicies,
        eureka: 'observe',
      },
    }))

    expect(records.find((record) => record.current && record.actionType)).toBeUndefined()
    expect(records.find((record) => record.stage === 'noticed')).toBeDefined()
  })

  it('holds proposals under Quiet autonomy without hiding the noticed context', () => {
    const records = buildActionDeskRecords(demoProfile, stateWith({ autonomy: 'quiet' }))

    expect(records.find((record) => record.current && record.actionType)).toBeUndefined()
    expect(records.find((record) => record.stage === 'noticed')).toBeDefined()
  })
})
