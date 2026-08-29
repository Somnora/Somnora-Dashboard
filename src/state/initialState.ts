import { createHeroInvitation } from '../domain/invitationPolicy'
import { emptyMemoryOverlay } from '../domain/memoryOverlay'
import { createDefaultConsentPolicies } from '../domain/consentPolicy'
import type { WorkbenchState } from '../domain/types'
import { demoProfile } from '../demo/profile'

export const initialWorkbenchState: WorkbenchState = {
  destination: 'home',
  conversationMode: 'eureka',
  autonomy: 'active',
  stretch: 'open',
  consentPolicies: createDefaultConsentPolicies(),
  invitation: createHeroInvitation(demoProfile, 'open'),
  invitationDisposition: 'offered',
  invitationFeedback: null,
  selectedMemoryNodeId: null,
  focusEvidenceIds: [],
  memoryOverlay: emptyMemoryOverlay,
  delivery: {
    status: 'idle',
    progressCount: 0,
    progressTarget: 3,
    progressUnit: 'discoveries',
    simulated: true,
  },
  whyOpen: false,
  adjustmentOpen: false,
  reducedMotionOverride: null,
}
