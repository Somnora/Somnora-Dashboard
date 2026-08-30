import { useEffect, useRef, useState } from 'react'
import type { ConversationMode } from '../../domain/types'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'
import { ConversationThread, LiveConversationThreadView } from './ConversationThread'

const modeCopy: Record<ConversationMode, { note: string; question: string }> = {
  dream: {
    note: 'Dream imagery stays tentative and begins with your own associations.',
    question: 'What did the bright windows make possible in the dream?',
  },
  daily: {
    note: 'Daily holds the texture of the day without turning it into a score.',
    question: 'What changed when the room began to feel visually flat?',
  },
  eureka: {
    note: 'Eureka keeps breakthroughs connected to the conditions around them.',
    question: 'What became easier to see after you took the long way home?',
  },
}

export function ConversationsView() {
  const { state, profile, dispatch, connection, live } = useWorkbench()
  const [draft, setDraft] = useState('')
  const [handoffTitle, setHandoffTitle] = useState<string | null>(null)
  const [handoffSourceLabel, setHandoffSourceLabel] = useState('Receiving linked conversation')
  const threadRef = useRef<HTMLDivElement>(null)
  const observedThreads = useRef<Map<string, string> | null>(null)
  const pendingHandoffThread = useRef<string | null>(null)
  const positions = useRef<Record<ConversationMode, number>>({
    dream: 0,
    daily: 0,
    eureka: 0,
  })
  const thread = profile.conversations.find(
    (item) => item.mode === state.conversationMode,
  )

  useEffect(() => {
    if (connection.mode !== 'relay' || connection.pairing?.status !== 'paired') return
    if (live.loading || live.sending) return

    const current = new Map(live.threads.map((item) => [item.threadId, item.updatedAt]))
    const previous = observedThreads.current
    observedThreads.current = current

    if (!previous) return

    const incoming = live.threads
      .filter((item) => previous.get(item.threadId) !== item.updatedAt)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0]

    if (!incoming || live.activeThread?.threadId === incoming.threadId) return

    dispatch({ type: 'set-conversation-mode', value: incoming.mode })
    setHandoffTitle(incoming.title)
    setHandoffSourceLabel('Receiving linked conversation')
    pendingHandoffThread.current = incoming.threadId
    void live.openThread(incoming.threadId)
  }, [
    connection.mode,
    connection.pairing?.status,
    dispatch,
    live,
  ])

  useEffect(() => {
    const active = live.activeThread
    if (!active || pendingHandoffThread.current !== active.threadId) return
    const latestMessage = active.messages?.at(-1)
    if (!latestMessage) return

    setHandoffSourceLabel(
      latestMessage.sourceDevice === 'watch'
        ? 'Received from Apple Watch'
        : latestMessage.sourceDevice === 'iphone'
          ? 'Received from iPhone'
          : 'Conversation updated',
    )
    pendingHandoffThread.current = null
  }, [live.activeThread])

  if (connection.mode === 'relay') {
    const paired = connection.pairing?.status === 'paired'
    const modeThreads = live.threads.filter((item) => item.mode === state.conversationMode)
    const active = live.activeThread?.mode === state.conversationMode
      ? live.activeThread
      : null

    const selectLiveMode = (mode: ConversationMode) => {
      dispatch({ type: 'set-conversation-mode', value: mode })
      const next = live.threads.find((item) => item.mode === mode)
      if (next) void live.openThread(next.threadId)
      else live.startThread(mode)
    }

    const submit = async () => {
      const message = draft.trim()
      if (!message || live.sending || live.loading) return
      const sent = await live.sendMessage(message, state.conversationMode)
      if (sent) setDraft('')
    }

    return (
      <div className={`conversations-layout live-conversations-layout${paired ? '' : ' is-unpaired'}`}>
        <GlassPanel className="live-thread-list">
          <div className="live-thread-list-heading">
            <div>
              <p className="eyebrow">Account conversations</p>
              <h2>Continue anywhere</h2>
            </div>
            <button
              className="secondary-button"
              disabled={!paired}
              onClick={() => live.startThread(state.conversationMode)}
              type="button"
            >
              Start thread
            </button>
          </div>
          <div className="live-handoff-status" role="status">
            <span aria-hidden="true" />
            <div>
              <strong>{handoffTitle ? handoffSourceLabel : 'Live handoff ready'}</strong>
              <p>{handoffTitle ?? 'Speak or type in Somnora. The next conversation opens here automatically.'}</p>
            </div>
          </div>
          <div className="conversation-tabs" role="tablist" aria-label="Somnora conversation mode">
            {(['dream', 'daily', 'eureka'] as ConversationMode[]).map((mode) => (
              <button
                aria-selected={state.conversationMode === mode}
                className="conversation-tab"
                key={mode}
                onClick={() => selectLiveMode(mode)}
                role="tab"
                type="button"
              >
                {mode === 'eureka' ? 'Eureka' : mode === 'daily' ? 'Daily' : 'Dream'}
              </button>
            ))}
          </div>
          <div className="live-thread-items">
            {modeThreads.map((item) => (
              <button
                aria-current={active?.threadId === item.threadId}
                className="live-thread-item"
                key={item.threadId}
                onClick={() => void live.openThread(item.threadId)}
                type="button"
              >
                <strong>{item.title}</strong>
                <span>{item.sourceDevice} · {item.messageCount} messages</span>
                <time dateTime={item.updatedAt}>
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(item.updatedAt))}
                </time>
              </button>
            ))}
            {paired && modeThreads.length === 0 ? (
              <p className="live-empty-copy">No synced {state.conversationMode} threads yet.</p>
            ) : null}
          </div>
        </GlassPanel>

        <GlassPanel className="conversation-workspace live-conversation-workspace">
          {!paired ? (
            <div className="live-pairing-required">
              <p className="eyebrow">Phone link required</p>
              <h2>Connect your Somnora account.</h2>
              <p>Enter the six-digit code in Somnora on your iPhone.</p>
              {connection.pairing?.code ? (
                <>
                  <output className="pairing-code" aria-label={`Pairing code ${connection.pairing.code}`}>
                    {connection.pairing.code}
                  </output>
                  <small>The code expires after ten minutes. The revocable device link lasts 30 days.</small>
                </>
              ) : (
                <button className="primary-button" onClick={() => void connection.pair()} type="button">
                  Generate code
                </button>
              )}
              {connection.errorMessage ? <p className="live-error-copy" role="alert">{connection.errorMessage}</p> : null}
            </div>
          ) : (
            <>
              <div className="thread-scroll" ref={threadRef}>
                <div className="thread-heading">
                  <p className="eyebrow">Live {state.conversationMode} thread</p>
                  <h2>{active?.title ?? `New ${state.conversationMode} conversation`}</h2>
                  <p>{modeCopy[state.conversationMode].note}</p>
                </div>
                {active && (active.messages?.length ?? 0) > 0 ? (
                  <LiveConversationThreadView thread={active} />
                ) : (
                  <p className="live-empty-copy">Start here and Nora will continue with the same account context used on your phone.</p>
                )}
                {live.loading ? <p className="live-status-copy" role="status">Refreshing this conversation...</p> : null}
              </div>
              <form className="live-composer" onSubmit={(event) => {
                event.preventDefault()
                void submit()
              }}>
                <label className="sr-only" htmlFor="live-nora-message">Message Nora</label>
                <textarea
                  disabled={live.sending || live.loading}
                  id="live-nora-message"
                  maxLength={8_000}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Talk with Nora..."
                  rows={2}
                  value={draft}
                />
                <button className="primary-button" disabled={!draft.trim() || live.sending || live.loading} type="submit">
                  {live.sending ? 'Nora is thinking...' : 'Send'}
                </button>
              </form>
              {live.errorMessage ? <p className="live-error-copy" role="alert">{live.errorMessage}</p> : null}
            </>
          )}
        </GlassPanel>
      </div>
    )
  }

  if (!thread) return null

  const selectMode = (mode: ConversationMode) => {
    if (threadRef.current) {
      positions.current[state.conversationMode] = threadRef.current.scrollTop
    }
    dispatch({ type: 'set-conversation-mode', value: mode })
    requestAnimationFrame(() => {
      if (threadRef.current) threadRef.current.scrollTop = positions.current[mode]
    })
  }

  return (
    <div className="conversations-layout">
      <GlassPanel className="conversation-workspace">
        <div className="conversation-tabs" role="tablist" aria-label="Somnora conversation mode">
          {profile.conversations.map((item) => (
            <button
              aria-selected={state.conversationMode === item.mode}
              className="conversation-tab"
              key={item.mode}
              onClick={() => selectMode(item.mode)}
              role="tab"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="thread-scroll" onScroll={(event) => {
          positions.current[state.conversationMode] = event.currentTarget.scrollTop
        }} ref={threadRef}>
          <div className="thread-heading">
            <p className="eyebrow">Seeded {thread.label} history</p>
            <h2>{thread.label}</h2>
            <p>{modeCopy[state.conversationMode].note}</p>
          </div>
          <ConversationThread thread={thread} />
        </div>
      </GlassPanel>
      <aside className="conversation-context">
        <GlassPanel>
          <p className="eyebrow">Nora might ask</p>
          <blockquote>{modeCopy[state.conversationMode].question}</blockquote>
          <p className="seeded-note">
            Representative history for the privacy-safe demo profile. Live account sync is not active.
          </p>
        </GlassPanel>
        <GlassPanel>
          <p className="eyebrow">Connected signal</p>
          <strong>
            {state.conversationMode === 'eureka'
              ? 'Four days since the last Eureka entry'
              : state.conversationMode === 'dream'
                ? 'Windows and light appeared four times'
                : 'Creative pressure is steady, not rising'}
          </strong>
        </GlassPanel>
      </aside>
    </div>
  )
}
