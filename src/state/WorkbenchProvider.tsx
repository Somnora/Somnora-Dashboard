import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { demoProfile } from '../demo/profile'
import {
  createActionConsentReceipt,
  prepareNoraAction,
} from '../domain/actionRuntime'
import type {
  NoraActionDispatch,
  NoraActionSnapshot,
  PairingSession,
  WorkbenchState,
} from '../domain/types'
import { DemoTransport } from '../transport/DemoTransport'
import { RelayTransport } from '../transport/RelayTransport'
import type { WorkbenchTransport } from '../transport/WorkbenchTransport'
import { initialWorkbenchState } from './initialState'
import {
  loadDemoProgress,
  loadPreferences,
  saveDemoProgress,
  savePreferences,
} from './persistence'
import { workbenchReducer } from './reducer'
import { WorkbenchContext } from './workbenchContext'

const transportMode: 'demo' | 'relay' = import.meta.env.VITE_TRANSPORT === 'relay'
  ? 'relay'
  : 'demo'

function createConfiguredTransport(): WorkbenchTransport {
  if (transportMode === 'relay') {
    return new RelayTransport(import.meta.env.VITE_WORKBENCH_API_ORIGIN ?? '')
  }
  return new DemoTransport()
}

function newIdempotencyKey(): string {
  return crypto.randomUUID()
}

function prepareHeroAction(
  state: WorkbenchState,
  idempotencyKey: string,
  consentReceiptId: string,
  createdAt: string,
  expiresAt = new Date(Date.parse(createdAt) + 90 * 60 * 1000).toISOString(),
): NoraActionDispatch {
  const consent = createActionConsentReceipt({
    id: consentReceiptId,
    actionType: 'three-beautiful-things',
    invitationId: state.invitation.id,
    approved: state.invitationDisposition === 'accepted',
    approvedAt: createdAt,
  })
  return prepareNoraAction({
    actionType: 'three-beautiful-things',
    invitationId: state.invitation.id,
    title: state.invitation.title,
    prompt: state.invitation.prompt,
    actionInput: {
      type: 'three-beautiful-things',
      targetCount: 3,
      captureMode: 'photo-or-text',
      setting: 'outdoor-or-indoor',
    },
    route: 'watch-via-iphone',
    consent,
    idempotencyKey,
    createdAt,
    expiresAt,
  })
}

function restoredSnapshot(state: WorkbenchState, updatedAt: string): NoraActionSnapshot {
  return {
    id: state.delivery.actionId ?? '',
    invitationId: state.invitation.id,
    actionType: state.delivery.actionType ?? 'three-beautiful-things',
    status: state.delivery.status === 'idle' ? 'pending' : state.delivery.status,
    progress: {
      kind: 'count',
      target: state.delivery.progressTarget,
      unit: state.delivery.progressUnit,
      completed: state.delivery.progressCount,
    },
    route: state.delivery.route ?? 'watch-via-iphone',
    simulated: true,
    expiresAt: state.delivery.expiresAt ?? new Date(Date.parse(updatedAt) + 90 * 60 * 1000).toISOString(),
    updatedAt,
    outcome: state.delivery.outcome,
  }
}

function restoreSafeState(initial: WorkbenchState): WorkbenchState {
  if (typeof window === 'undefined') return initial

  const preferences = loadPreferences(window.localStorage)
  const progress = transportMode === 'demo'
    ? loadDemoProgress(window.sessionStorage)
    : null

  return {
    ...initial,
    ...(preferences ?? {}),
    invitationDisposition: progress?.invitationAccepted
      ? 'accepted'
      : initial.invitationDisposition,
    delivery: progress
      ? { ...initial.delivery, ...progress.delivery }
      : { ...initial.delivery, simulated: transportMode === 'demo' },
  }
}

export function WorkbenchProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(
    workbenchReducer,
    initialWorkbenchState,
    restoreSafeState,
  )
  const [pairing, setPairing] = useState<PairingSession | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const transportRef = useRef<WorkbenchTransport>(createConfiguredTransport())
  const idempotencyKeyRef = useRef(newIdempotencyKey())
  const consentReceiptIdRef = useRef(newIdempotencyKey())

  useEffect(() => {
    const transport = transportRef.current
    const { actionId, status } = state.delivery
    if (!(transport instanceof DemoTransport) || !actionId || status === 'idle') return
    if (['completed', 'cancelled', 'expired'].includes(status)) return
    const updatedAt = state.delivery.updatedAt ?? new Date().toISOString()
    const expiry = state.delivery.expiresAt ?? new Date(Date.parse(updatedAt) + 90 * 60 * 1000).toISOString()
    const dispatchContract = prepareHeroAction(
      state,
      idempotencyKeyRef.current,
      consentReceiptIdRef.current,
      updatedAt,
      expiry,
    )
    transport.restoreAction(dispatchContract, restoredSnapshot(state, updatedAt))
  }, [state])

  useEffect(() => {
    savePreferences(window.localStorage, {
      autonomy: state.autonomy,
      stretch: state.stretch,
    })
  }, [state.autonomy, state.stretch])

  useEffect(() => {
    if (transportMode !== 'demo') return
    saveDemoProgress(window.sessionStorage, {
      invitationAccepted: state.invitationDisposition === 'accepted',
      delivery: {
        status: state.delivery.status,
        progressCount: state.delivery.progressCount,
        simulated: true,
        actionId: state.delivery.actionId,
        actionType: state.delivery.actionType,
        route: state.delivery.route,
        progressTarget: state.delivery.progressTarget,
        progressUnit: state.delivery.progressUnit,
        expiresAt: state.delivery.expiresAt,
        updatedAt: state.delivery.updatedAt,
      },
    })
  }, [
    state.delivery.actionId,
    state.delivery.progressCount,
    state.delivery.progressTarget,
    state.delivery.progressUnit,
    state.delivery.actionType,
    state.delivery.route,
    state.delivery.expiresAt,
    state.delivery.updatedAt,
    state.delivery.status,
    state.invitationDisposition,
  ])

  useEffect(() => {
    if (transportMode !== 'relay' || pairing?.status !== 'waiting') return
    const timer = window.setTimeout(async () => {
      try {
        const status = await transportRef.current.getPairingStatus(pairing.id)
        if (status.status === 'paired') {
          setPairing({ ...pairing, status: 'paired', code: undefined })
          setConnectionError(null)
        } else if (status.status === 'expired' || status.status === 'revoked') {
          setPairing(null)
          setConnectionError(`The pairing was ${status.status}. Generate a new code.`)
        } else {
          setPairing({ ...pairing })
        }
      } catch (error) {
        setConnectionError(error instanceof Error ? error.message : 'Pairing status could not be checked.')
        setPairing({ ...pairing })
      }
    }, 2_500)
    return () => window.clearTimeout(timer)
  }, [pairing])

  useEffect(() => {
    const actionId = state.delivery.actionId
    const status = state.delivery.status
    const shouldPoll = transportMode === 'demo'
      ? ['pending', 'delivered-phone', 'delivered-watch'].includes(status)
      : ['pending', 'delivered-phone', 'delivered-watch', 'in-progress'].includes(status)
    if (!actionId || !shouldPoll) return

    const timer = window.setTimeout(async () => {
      try {
        const action = await transportRef.current.getActionStatus(actionId)
        setConnectionError(null)
        dispatch({
          type: 'delivery-snapshot',
          action,
          updatedAt: action.updatedAt,
        })
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : 'The handoff paused before the next confirmed state.'
        if (transportMode === 'relay') {
          setConnectionError(message)
        } else {
          dispatch({
            type: 'delivery-error',
            message,
            updatedAt: new Date().toISOString(),
          })
        }
      }
    }, transportMode === 'demo' ? 520 : 2_500)

    return () => window.clearTimeout(timer)
  }, [
    state.delivery.actionId,
    state.delivery.progressCount,
    state.delivery.status,
    state.delivery.updatedAt,
  ])

  const pair = useCallback(async () => {
    setConnectionError(null)
    try {
      setPairing(await transportRef.current.pair())
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Pairing could not be started.')
    }
  }, [])

  const dispatchInvitation = useCallback(async () => {
    const createdAt = new Date().toISOString()
    const actionContract = prepareHeroAction(
      state,
      idempotencyKeyRef.current,
      consentReceiptIdRef.current,
      createdAt,
    )
    const action = await transportRef.current.sendAction(actionContract)
    dispatch({
      type: 'delivery-started',
      action,
      updatedAt: action.updatedAt,
    })
    setConnectionError(null)
  }, [state])

  const send = useCallback(async () => {
    if (state.invitationDisposition !== 'accepted') {
      setConnectionError('Accept this invitation before creating an action.')
      return
    }
    if (transportMode === 'relay' && pairing?.status !== 'paired') {
      setConnectionError('Pair this Workbench with the iPhone before sending.')
      return
    }
    try {
      await dispatchInvitation()
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'The invitation could not be sent.')
    }
  }, [dispatchInvitation, pairing?.status, state.invitationDisposition])

  const retry = useCallback(async () => {
    if (transportMode === 'demo') {
      if (!state.delivery.actionId) return
      const transport = transportRef.current
      if (!(transport instanceof DemoTransport)) return
      const action = transport.retryAction(state.delivery.actionId)
      dispatch({
        type: 'delivery-started',
        action,
        updatedAt: action.updatedAt,
      })
      return
    }
    idempotencyKeyRef.current = newIdempotencyKey()
    consentReceiptIdRef.current = newIdempotencyKey()
    try {
      await dispatchInvitation()
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'The invitation could not be retried.')
    }
  }, [dispatchInvitation, state.delivery.actionId])

  const cancel = useCallback(async () => {
    if (!state.delivery.actionId) return
    try {
      const action = await transportRef.current.cancelAction(state.delivery.actionId)
      dispatch({ type: 'delivery-snapshot', action, updatedAt: action.updatedAt })
      setConnectionError(null)
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'The handoff could not be cancelled.')
    }
  }, [state.delivery.actionId])

  const start = useCallback(() => {
    if (transportMode !== 'demo') return
    dispatch({
      type: 'delivery-status',
      status: 'in-progress',
      updatedAt: new Date().toISOString(),
    })
  }, [])

  const addPhoto = useCallback(() => {
    if (transportMode !== 'demo' || !state.delivery.actionId) return
    const transport = transportRef.current
    if (!(transport instanceof DemoTransport)) return
    const nextCount = Math.min(state.delivery.progressTarget, state.delivery.progressCount + 1)
    const action = transport.recordProgress(state.delivery.actionId, nextCount)
    dispatch({ type: 'delivery-snapshot', action, updatedAt: action.updatedAt })
  }, [state.delivery.actionId, state.delivery.progressCount, state.delivery.progressTarget])

  const simulateFailure = useCallback(() => {
    if (transportMode !== 'demo' || !state.delivery.actionId) return
    const transport = transportRef.current
    if (!(transport instanceof DemoTransport)) return
    const action = transport.failAction(state.delivery.actionId)
    dispatch({
      type: 'delivery-snapshot',
      action,
      updatedAt: action.updatedAt,
    })
  }, [state.delivery.actionId])

  const simulateExpiry = useCallback(() => {
    if (transportMode !== 'demo' || !state.delivery.actionId) return
    const transport = transportRef.current
    if (!(transport instanceof DemoTransport)) return
    const action = transport.expireAction(state.delivery.actionId)
    dispatch({
      type: 'delivery-snapshot',
      action,
      updatedAt: action.updatedAt,
    })
  }, [state.delivery.actionId])

  const reset = useCallback(() => {
    if (transportMode === 'demo') transportRef.current = new DemoTransport()
    idempotencyKeyRef.current = newIdempotencyKey()
    consentReceiptIdRef.current = newIdempotencyKey()
    dispatch({ type: 'reset-mission', simulated: transportMode === 'demo' })
  }, [])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      profile: demoProfile,
      connection: {
        mode: transportMode,
        pairing,
        errorMessage: connectionError,
        pair,
      },
      mission: {
        send,
        retry,
        cancel,
        start,
        addPhoto,
        simulateFailure,
        simulateExpiry,
        reset,
      },
    }),
    [
      addPhoto,
      cancel,
      connectionError,
      pair,
      pairing,
      reset,
      retry,
      send,
      simulateExpiry,
      simulateFailure,
      start,
      state,
    ],
  )

  return (
    <WorkbenchContext.Provider value={value}>
      {children}
    </WorkbenchContext.Provider>
  )
}
