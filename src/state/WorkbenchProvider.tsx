import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { PropsWithChildren } from 'react'
import { demoProfile } from '../demo/profile'
import type { WorkbenchState } from '../domain/types'
import { initialWorkbenchState } from './initialState'
import {
  loadDemoProgress,
  loadPreferences,
  saveDemoProgress,
  savePreferences,
} from './persistence'
import { workbenchReducer } from './reducer'
import { DemoTransport } from '../transport/DemoTransport'
import { WorkbenchContext } from './workbenchContext'

function restoreSafeState(initial: WorkbenchState): WorkbenchState {
  if (typeof window === 'undefined') return initial

  const preferences = loadPreferences(window.localStorage)
  const progress = loadDemoProgress(window.sessionStorage)

  return {
    ...initial,
    ...(preferences ?? {}),
    invitationDisposition: progress?.invitationAccepted
      ? 'accepted'
      : initial.invitationDisposition,
    delivery: progress
      ? { ...initial.delivery, ...progress.delivery }
      : initial.delivery,
  }
}

export function WorkbenchProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(
    workbenchReducer,
    initialWorkbenchState,
    restoreSafeState,
  )
  const transportRef = useRef(new DemoTransport())

  useEffect(() => {
    const { actionId, status, progressCount } = state.delivery
    if (!actionId || status === 'idle') return
    transportRef.current.restoreAction(
      actionId,
      state.invitation.id,
      status,
      progressCount,
    )
  }, [state.delivery, state.invitation.id])

  useEffect(() => {
    savePreferences(window.localStorage, {
      autonomy: state.autonomy,
      stretch: state.stretch,
    })
  }, [state.autonomy, state.stretch])

  useEffect(() => {
    saveDemoProgress(window.sessionStorage, {
      invitationAccepted: state.invitationDisposition === 'accepted',
      delivery: {
        status: state.delivery.status,
        progressCount: state.delivery.progressCount,
        simulated: true,
        actionId: state.delivery.actionId,
      },
    })
  }, [
    state.delivery.actionId,
    state.delivery.progressCount,
    state.delivery.status,
    state.invitationDisposition,
  ])

  useEffect(() => {
    if (
      !state.delivery.actionId ||
      !['pending', 'delivered-phone', 'delivered-watch'].includes(
        state.delivery.status,
      )
    ) {
      return
    }

    const timer = window.setTimeout(async () => {
      try {
        const action = await transportRef.current.getActionStatus(
          state.delivery.actionId!,
        )
        dispatch({
          type: 'delivery-status',
          status: action.status,
          updatedAt: new Date().toISOString(),
        })
      } catch {
        dispatch({
          type: 'delivery-error',
          message: 'The demo handoff paused before the next confirmed state.',
          updatedAt: new Date().toISOString(),
        })
      }
    }, 520)

    return () => window.clearTimeout(timer)
  }, [state.delivery.actionId, state.delivery.status])

  const send = useCallback(async () => {
    const action = await transportRef.current.sendInvitation({
      invitationId: state.invitation.id,
      title: state.invitation.title,
      prompt: state.invitation.prompt,
      estimatedMinutes: state.invitation.estimatedMinutes,
      idempotencyKey: 'hero-recording-1',
      version: 1,
    })
    dispatch({
      type: 'delivery-started',
      actionId: action.id,
      updatedAt: new Date().toISOString(),
    })
  }, [state.invitation])

  const retry = useCallback(() => {
    if (!state.delivery.actionId) return
    const action = transportRef.current.retryAction(state.delivery.actionId)
    dispatch({
      type: 'delivery-started',
      actionId: action.id,
      updatedAt: new Date().toISOString(),
    })
  }, [state.delivery.actionId])

  const cancel = useCallback(async () => {
    if (!state.delivery.actionId) return
    const action = await transportRef.current.cancelAction(state.delivery.actionId)
    dispatch({
      type: 'delivery-status',
      status: action.status,
      updatedAt: new Date().toISOString(),
    })
  }, [state.delivery.actionId])

  const start = useCallback(() => {
    dispatch({
      type: 'delivery-status',
      status: 'in-progress',
      updatedAt: new Date().toISOString(),
    })
  }, [])

  const addPhoto = useCallback(() => {
    if (!state.delivery.actionId) return
    const nextCount = Math.min(3, state.delivery.progressCount + 1)
    transportRef.current.recordProgress(state.delivery.actionId, nextCount)
    dispatch({
      type: 'delivery-progress',
      count: nextCount,
      updatedAt: new Date().toISOString(),
    })
  }, [state.delivery.actionId, state.delivery.progressCount])

  const simulateFailure = useCallback(() => {
    if (!state.delivery.actionId) return
    transportRef.current.failAction(state.delivery.actionId)
    dispatch({
      type: 'delivery-error',
      message: 'The simulated iPhone relay did not confirm the next handoff.',
      updatedAt: new Date().toISOString(),
    })
  }, [state.delivery.actionId])

  const simulateExpiry = useCallback(() => {
    if (!state.delivery.actionId) return
    transportRef.current.expireAction(state.delivery.actionId)
    dispatch({
      type: 'delivery-status',
      status: 'expired',
      updatedAt: new Date().toISOString(),
    })
  }, [state.delivery.actionId])

  const reset = useCallback(() => {
    transportRef.current = new DemoTransport()
    dispatch({ type: 'reset-mission' })
  }, [])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      profile: demoProfile,
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
