import { demoProfile } from '../demo/profile'
import {
  applyInvitationAdjustment,
  createHeroInvitation,
  daysSinceLastEureka,
  shouldSurfaceDrySpellInvitation,
} from './invitationPolicy'

describe('invitation policy', () => {
  it('detects the seeded four-day Eureka gap', () => {
    expect(daysSinceLastEureka(demoProfile)).toBe(4)
    expect(shouldSurfaceDrySpellInvitation(demoProfile, 'active')).toBe(true)
    expect(shouldSurfaceDrySpellInvitation(demoProfile, 'quiet')).toBe(false)
  })

  it('selects the deterministic hero and retains an acceptance gate after adjustment', () => {
    const invitation = createHeroInvitation(demoProfile, 'open')
    const adjusted = applyInvitationAdjustment(invitation, 'lower-energy')

    expect(invitation.title).toBe('Three Beautiful Things')
    expect(invitation.evidenceIds).toHaveLength(4)
    expect(adjusted.energy).toBe('low')
    expect(adjusted.requiresAcceptance).toBe(true)
    expect(adjusted.appliedAdjustments).toEqual(['lower-energy'])
  })
})
