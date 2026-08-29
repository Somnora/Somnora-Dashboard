import {
  consentCapabilityAllows,
  consentDomains,
  createDefaultConsentPolicies,
  evaluateHeroConsent,
  updateConsentPolicy,
} from './consentPolicy'

describe('Consent and Autonomy policy', () => {
  it('keeps observe, suggest, and prepare as ordered boundaries', () => {
    expect(consentCapabilityAllows('prepare', 'observe')).toBe(true)
    expect(consentCapabilityAllows('suggest', 'prepare')).toBe(false)
    expect(consentCapabilityAllows('off', 'observe')).toBe(false)
  })

  it('allows the default hero suggestion and preparation without action authority', () => {
    const access = evaluateHeroConsent(createDefaultConsentPolicies())

    expect(access).toMatchObject({
      canObserve: true,
      canSuggest: true,
      canPrepare: true,
    })
    expect(access.preparationBoundary).toContain('Sending still requires explicit approval')
  })

  it('separates suggestion access from preparation access', () => {
    const policies = updateConsentPolicy(
      createDefaultConsentPolicies(),
      'activity',
      'suggest',
    )

    expect(evaluateHeroConsent(policies)).toMatchObject({
      canObserve: true,
      canSuggest: true,
      canPrepare: false,
    })
  })

  it('holds a suggestion when Eureka is observation only', () => {
    const policies = updateConsentPolicy(
      createDefaultConsentPolicies(),
      'eureka',
      'observe',
    )

    const access = evaluateHeroConsent(policies)
    expect(access.canObserve).toBe(true)
    expect(access.canSuggest).toBe(false)
    expect(access.suggestionBoundary).toContain('not proactive suggestions')
  })

  it('keeps disconnected future adapters off', () => {
    const policies = createDefaultConsentPolicies()
    const changed = updateConsentPolicy(policies, 'fitness', 'prepare')

    expect(changed).toBe(policies)
    expect(changed.fitness).toBe('off')
    expect(consentDomains.find((domain) => domain.id === 'fitness')).toMatchObject({
      sourceState: 'future',
      maximumCapability: 'off',
    })
  })
})
