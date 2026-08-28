import { useRef } from 'react'
import type { ConversationMode } from '../../domain/types'
import { useWorkbench } from '../../state/workbenchContext'
import { GlassPanel } from '../common/GlassPanel'
import { ConversationThread } from './ConversationThread'

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
  const { state, profile, dispatch } = useWorkbench()
  const threadRef = useRef<HTMLDivElement>(null)
  const positions = useRef<Record<ConversationMode, number>>({
    dream: 0,
    daily: 0,
    eureka: 0,
  })
  const thread = profile.conversations.find(
    (item) => item.mode === state.conversationMode,
  )

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
