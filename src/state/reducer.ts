import { applyInvitationAdjustment, createHeroInvitation } from '../domain/invitationPolicy'
import {
  reconcileDeliverySnapshot,
  transitionDelivery,
  updateDeliveryProgress,
} from '../domain/deliveryState'
import { setMemoryCorrection } from '../domain/memoryOverlay'
import type {
  AutonomyLevel,
  ConversationMode,
  Destination,
  InvitationAdjustment,
  MemoryCorrection,
  DeliveryStatus,
  StretchLevel,
  WorkbenchState,
} from '../domain/types'
import { demoProfile } from '../demo/profile'

export type WorkbenchAction =
  | { type: 'navigate'; destination: Destination }
  | { type: 'set-conversation-mode'; value: ConversationMode }
  | { type: 'set-autonomy'; value: AutonomyLevel }
  | { type: 'set-stretch'; value: StretchLevel }
  | { type: 'open-why' }
  | { type: 'close-why' }
  | { type: 'open-adjustment' }
  | { type: 'close-adjustment' }
  | { type: 'apply-adjustment'; value: InvitationAdjustment }
  | { type: 'accept-invitation' }
  | { type: 'decline-invitation' }
  | { type: 'less-like-this' }
  | { type: 'select-memory-node'; nodeId: string | null }
  | { type: 'delivery-started'; actionId: string; simulated: boolean; updatedAt: string }
  | { type: 'delivery-status'; status: DeliveryStatus; updatedAt: string }
  | {
      type: 'delivery-snapshot'
      status: DeliveryStatus
      progressCount: 0 | 1 | 2 | 3
      simulated: boolean
      updatedAt: string
    }
  | { type: 'delivery-progress'; count: number; updatedAt: string }
  | { type: 'delivery-error'; message: string; updatedAt: string }
  | { type: 'reset-mission'; simulated?: boolean }
  | { type: 'correct-memory'; correction: MemoryCorrection }

export function workbenchReducer(
  state: WorkbenchState,
  action: WorkbenchAction,
): WorkbenchState {
  switch (action.type) {
    case 'navigate':
      return { ...state, destination: action.destination }
    case 'set-conversation-mode':
      return { ...state, conversationMode: action.value }
    case 'set-autonomy':
      return { ...state, autonomy: action.value }
    case 'set-stretch':
      return {
        ...state,
        stretch: action.value,
        invitation: createHeroInvitation(demoProfile, action.value),
        invitationDisposition: 'offered',
        invitationFeedback: null,
      }
    case 'open-why':
      return {
        ...state,
        destination: 'about-me',
        focusEvidenceIds: state.invitation.evidenceIds,
        whyOpen: true,
      }
    case 'close-why':
      return { ...state, destination: 'home', whyOpen: false }
    case 'open-adjustment':
      return { ...state, adjustmentOpen: true, invitationDisposition: 'adjusting' }
    case 'close-adjustment':
      return { ...state, adjustmentOpen: false, invitationDisposition: 'offered' }
    case 'apply-adjustment':
      return {
        ...state,
        invitation: applyInvitationAdjustment(state.invitation, action.value),
        invitationDisposition: 'offered',
        invitationFeedback: null,
        adjustmentOpen: false,
      }
    case 'accept-invitation':
      return { ...state, invitationDisposition: 'accepted' }
    case 'decline-invitation':
      return { ...state, invitationDisposition: 'declined' }
    case 'less-like-this':
      return {
        ...state,
        invitationDisposition: 'declined',
        invitationFeedback: 'less-like-this',
      }
    case 'select-memory-node':
      return { ...state, selectedMemoryNodeId: action.nodeId }
    case 'delivery-started':
      return {
        ...state,
        delivery: {
          ...transitionDelivery(state.delivery, 'pending', action.updatedAt),
          actionId: action.actionId,
          simulated: action.simulated,
          errorMessage: undefined,
        },
      }
    case 'delivery-status':
      return {
        ...state,
        delivery: transitionDelivery(
          state.delivery,
          action.status,
          action.updatedAt,
        ),
      }
    case 'delivery-progress':
      return {
        ...state,
        delivery: updateDeliveryProgress(
          state.delivery,
          action.count,
          action.updatedAt,
        ),
      }
    case 'delivery-snapshot':
      return {
        ...state,
        delivery: reconcileDeliverySnapshot(
          state.delivery,
          {
            status: action.status,
            progressCount: action.progressCount,
            simulated: action.simulated,
          },
          action.updatedAt,
        ),
      }
    case 'delivery-error':
      return {
        ...state,
        delivery: {
          ...transitionDelivery(state.delivery, 'failed', action.updatedAt),
          errorMessage: action.message,
        },
      }
    case 'reset-mission':
      return {
        ...state,
        invitationDisposition: 'offered',
        invitationFeedback: null,
        delivery: {
          status: 'idle',
          progressCount: 0,
          simulated: action.simulated ?? true,
        },
      }
    case 'correct-memory':
      return {
        ...state,
        memoryOverlay: setMemoryCorrection(
          state.memoryOverlay,
          action.correction,
        ),
      }
  }
}
