import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { demoProfile } from '../demo/profile'
import {
  createActionConsentReceipt,
  prepareNoraAction,
} from '../domain/actionRuntime'
import { evaluateHeroConsent } from '../domain/consentPolicy'
import { mergeContextTimelineEvents } from '../domain/contextTimeline'
import type {
  ConversationMode,
  ContextTimelineEvent,
  LiveContextGraph,
  LiveConversationThread,
  MemoryCorrection,
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
const pairingStorageKey = 'somnora-workbench-pairing-v1'

function loadStoredPairing(): PairingSession | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = JSON.parse(window.localStorage.getItem(pairingStorageKey) ?? 'null') as PairingSession | null
    if (
      !stored ||
      stored.simulated ||
      stored.status !== 'paired' ||
      Date.parse(stored.expiresAt) <= Date.now()
    ) {
      window.localStorage.removeItem(pairingStorageKey)
      return null
    }
    return { ...stored, code: undefined }
  } catch {
    window.localStorage.removeItem(pairingStorageKey)
    return null
  }
}

function saveStoredPairing(pairing: PairingSession | null) {
  if (typeof window === 'undefined') return
  if (!pairing || pairing.status !== 'paired' || pairing.simulated) {
    window.localStorage.removeItem(pairingStorageKey)
    return
  }
  window.localStorage.setItem(pairingStorageKey, JSON.stringify({ ...pairing, code: undefined }))
}

function createConfiguredTransport(): WorkbenchTransport {
  if (transportMode === 'relay') {
    return new RelayTransport(
      import.meta.env.VITE_WORKBENCH_API_ORIGIN ?? '',
      undefined,
      undefined,
      loadStoredPairing()?.id,
    )
  }
  return new DemoTransport()
}

async function loadLiveTimelinePages(
  transport: RelayTransport,
  initialCursor: string | null,
) {
  let cursor = initialCursor ?? undefined
  let events: ContextTimelineEvent[] = []
  let truncated = false
  let hasMore = false
  for (let pageIndex = 0; pageIndex < 5; pageIndex += 1) {
    const page = await transport.getContextTimeline(cursor)
    events = mergeContextTimelineEvents(events, page.events)
    truncated = truncated || page.truncated
    hasMore = page.hasMore
    cursor = page.cursor
    if (!page.hasMore) break
  }
  return { cursor: cursor ?? new Date().toISOString(), events, hasMore, truncated }
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
  const [pairing, setPairing] = useState<PairingSession | null>(loadStoredPairing)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [liveThreads, setLiveThreads] = useState<LiveConversationThread[]>([])
  const [activeLiveThread, setActiveLiveThread] = useState<LiveConversationThread | null>(null)
  const [liveContextGraph, setLiveContextGraph] = useState<LiveContextGraph | null>(null)
  const [liveTimelineEvents, setLiveTimelineEvents] = useState<ContextTimelineEvent[]>([])
  const [liveTimelineTruncated, setLiveTimelineTruncated] = useState(false)
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveSending, setLiveSending] = useState(false)
  const [liveError, setLiveError] = useState<string | null>(null)
  const transportRef = useRef<WorkbenchTransport>(createConfiguredTransport())
  const idempotencyKeyRef = useRef(newIdempotencyKey())
  const consentReceiptIdRef = useRef(newIdempotencyKey())
  const activeLiveThreadRef = useRef<LiveConversationThread | null>(null)
  const liveTimelineCursorRef = useRef<string | null>(null)

  useEffect(() => {
    activeLiveThreadRef.current = activeLiveThread
  }, [activeLiveThread])

  const relayTransport = useCallback(() => {
    const transport = transportRef.current
    if (!(transport instanceof RelayTransport)) {
      throw new Error('Live account data requires relay mode.')
    }
    return transport
  }, [])

  const refreshLiveData = useCallback(async () => {
    if (transportMode !== 'relay' || pairing?.status !== 'paired') return
    setLiveLoading(true)
    try {
      const transport = relayTransport()
      const [threads, graph, timeline] = await Promise.all([
        transport.listThreads(),
        transport.getContextGraph(),
        loadLiveTimelinePages(transport, liveTimelineCursorRef.current),
      ])
      setLiveThreads(threads)
      setLiveContextGraph(graph)
      setLiveTimelineEvents((current) => mergeContextTimelineEvents(current, timeline.events))
      setLiveTimelineTruncated((current) => current || timeline.truncated)
      liveTimelineCursorRef.current = timeline.cursor
      const current = activeLiveThreadRef.current
      const currentId = current?.threadId
      if (currentId && threads.some((thread) => thread.threadId === currentId)) {
        setActiveLiveThread(await transport.getThread(currentId))
      } else if (!current && threads[0]) {
        setActiveLiveThread(await transport.getThread(threads[0].threadId))
      }
      setLiveError(null)
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : 'Live Somnora data could not be refreshed.')
    } finally {
      setLiveLoading(false)
    }
  }, [pairing?.status, relayTransport])

  const openLiveThread = useCallback(async (threadId: string) => {
    if (transportMode !== 'relay' || pairing?.status !== 'paired') return
    setLiveLoading(true)
    try {
      setActiveLiveThread(await relayTransport().getThread(threadId))
      setLiveError(null)
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : 'The conversation could not be opened.')
    } finally {
      setLiveLoading(false)
    }
  }, [pairing?.status, relayTransport])

  const startLiveThread = useCallback((mode: ConversationMode) => {
    const timestamp = new Date().toISOString()
    setActiveLiveThread({
      threadId: crypto.randomUUID(),
      mode,
      title: mode === 'eureka' ? 'New Eureka' : mode === 'dream' ? 'New Dream' : 'New Conversation',
      createdAt: timestamp,
      updatedAt: timestamp,
      sourceDevice: 'workbench',
      archived: false,
      messageCount: 0,
      messages: [],
    })
    dispatch({ type: 'set-conversation-mode', value: mode })
    setLiveError(null)
  }, [])

  const sendLiveMessage = useCallback(async (message: string, mode: ConversationMode) => {
    if (transportMode !== 'relay' || pairing?.status !== 'paired') {
      setLiveError('Pair this Workbench with the iPhone before talking with Nora.')
      return false
    }
    const threadId = activeLiveThread?.threadId ?? crypto.randomUUID()
    setLiveSending(true)
    try {
      const transport = relayTransport()
      await transport.sendChat({
        threadId,
        message,
        mode,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      })
      const [thread, threads, timeline] = await Promise.all([
        transport.getThread(threadId),
        transport.listThreads(),
        loadLiveTimelinePages(transport, liveTimelineCursorRef.current),
      ])
      setActiveLiveThread(thread)
      setLiveThreads(threads)
      setLiveTimelineEvents((current) => mergeContextTimelineEvents(current, timeline.events))
      setLiveTimelineTruncated((current) => current || timeline.truncated)
      liveTimelineCursorRef.current = timeline.cursor
      setLiveError(null)
      return true
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : 'Nora could not answer from the Workbench.')
      return false
    } finally {
      setLiveSending(false)
    }
  }, [activeLiveThread?.threadId, pairing?.status, relayTransport])

  const correctLiveMemory = useCallback(async (correction: MemoryCorrection) => {
    if (transportMode !== 'relay' || pairing?.status !== 'paired') return
    try {
      setLiveContextGraph(await relayTransport().correctContextGraph(correction))
      setLiveError(null)
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : 'The memory update could not be saved.')
      throw error
    }
  }, [pairing?.status, relayTransport])

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
      consentPolicies: state.consentPolicies,
    })
  }, [state.autonomy, state.consentPolicies, state.stretch])

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
    if (transportMode !== 'relay' || !pairing) return
    const timer = window.setTimeout(async () => {
      if (pairing.status === 'waiting' && Date.parse(pairing.expiresAt) <= Date.now()) {
        setPairing(null)
        saveStoredPairing(null)
        setConnectionError('The pairing code expired. Generate a new code.')
        return
      }
      try {
        const status = await transportRef.current.getPairingStatus(pairing.id)
        if (status.status === 'paired') {
          const activePairing = {
            ...pairing,
            status: 'paired' as const,
            code: undefined,
            expiresAt: status.expiresAt,
          }
          setPairing(activePairing)
          saveStoredPairing(activePairing)
          setConnectionError(null)
        } else if (status.status === 'expired' || status.status === 'revoked') {
          setPairing(null)
          saveStoredPairing(null)
          setLiveThreads([])
          setActiveLiveThread(null)
          setLiveContextGraph(null)
          setLiveTimelineEvents([])
          setLiveTimelineTruncated(false)
          liveTimelineCursorRef.current = null
          setConnectionError(`The pairing was ${status.status}. Generate a new code.`)
        } else if (pairing.status === 'waiting') {
          setPairing({ ...pairing })
          setConnectionError(null)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Pairing status could not be checked.'
        setConnectionError(pairing.status === 'waiting'
          ? 'Pairing check paused. This code remains available while the Workbench retries automatically.'
          : message)
        setPairing({ ...pairing })
      }
    }, pairing.status === 'waiting' && Date.parse(pairing.expiresAt) <= Date.now()
      ? 0
      : pairing.status === 'waiting' ? 10_000 : 30_000)
    return () => window.clearTimeout(timer)
  }, [pairing])

  useEffect(() => {
    if (transportMode !== 'relay' || pairing?.status !== 'paired') return
    const initial = window.setTimeout(() => void refreshLiveData(), 0)
    const timer = window.setInterval(() => void refreshLiveData(), 10_000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(timer)
    }
  }, [pairing?.status, refreshLiveData])

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
    if (
      pairing?.status === 'waiting' &&
      pairing.code &&
      Date.parse(pairing.expiresAt) > Date.now()
    ) {
      setConnectionError(null)
      return
    }
    setConnectionError(null)
    try {
      saveStoredPairing(null)
      setLiveTimelineEvents([])
      setLiveTimelineTruncated(false)
      liveTimelineCursorRef.current = null
      setPairing(await transportRef.current.pair())
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Pairing could not be started.')
    }
  }, [pairing])

  const dispatchInvitation = useCallback(async () => {
    if (!evaluateHeroConsent(state.consentPolicies).canPrepare) {
      throw new Error('Your consent settings do not allow Nora to prepare this device action.')
    }
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
    if (!evaluateHeroConsent(state.consentPolicies).canPrepare) {
      setConnectionError('Your consent settings do not allow Nora to prepare this device action.')
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
  }, [dispatchInvitation, pairing?.status, state.consentPolicies, state.invitationDisposition])

  const retry = useCallback(async () => {
    if (!evaluateHeroConsent(state.consentPolicies).canPrepare) {
      setConnectionError('Your consent settings do not allow Nora to prepare this device action.')
      return
    }
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
  }, [dispatchInvitation, state.consentPolicies, state.delivery.actionId])

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
      live: {
        threads: liveThreads,
        activeThread: activeLiveThread,
        contextGraph: liveContextGraph,
        timelineEvents: liveTimelineEvents,
        timelineTruncated: liveTimelineTruncated,
        loading: liveLoading,
        sending: liveSending,
        errorMessage: liveError,
        refresh: refreshLiveData,
        openThread: openLiveThread,
        startThread: startLiveThread,
        sendMessage: sendLiveMessage,
        correctMemory: correctLiveMemory,
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
      correctLiveMemory,
      activeLiveThread,
      liveContextGraph,
      liveError,
      liveLoading,
      liveSending,
      liveTimelineEvents,
      liveTimelineTruncated,
      liveThreads,
      openLiveThread,
      pair,
      pairing,
      reset,
      refreshLiveData,
      retry,
      send,
      sendLiveMessage,
      simulateExpiry,
      simulateFailure,
      start,
      startLiveThread,
      state,
    ],
  )

  return (
    <WorkbenchContext.Provider value={value}>
      {children}
    </WorkbenchContext.Provider>
  )
}
