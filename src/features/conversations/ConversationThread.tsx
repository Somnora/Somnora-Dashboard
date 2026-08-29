import type { ConversationThread as ConversationThreadModel } from '../../domain/types'
import type { LiveConversationThread } from '../../domain/types'

export function ConversationThread({ thread }: { thread: ConversationThreadModel }) {
  return (
    <div className="conversation-thread" aria-label={`${thread.label} seeded conversation`}>
      {thread.entries.map((entry) => (
        <article className={`conversation-entry speaker-${entry.speaker}`} key={entry.id}>
          <header>
            <strong>{entry.speaker === 'nora' ? 'Nora' : 'You'}</strong>
            <time dateTime={entry.occurredAt}>
              {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }).format(new Date(entry.occurredAt))}
            </time>
          </header>
          <p>{entry.text}</p>
          <div className="entry-tags" aria-label="Entry themes">
            {entry.tags.map((tag) => (
              <span key={tag}>{tag.replaceAll('-', ' ')}</span>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

export function LiveConversationThreadView({ thread }: { thread: LiveConversationThread }) {
  return (
    <div className="conversation-thread" aria-label={`${thread.title} live conversation`}>
      {(thread.messages ?? []).map((entry) => (
        <article className={`conversation-entry speaker-${entry.role === 'nora' ? 'nora' : 'user'}`} key={entry.messageId}>
          <header>
            <strong>{entry.role === 'nora' ? 'Nora' : 'You'}</strong>
            <span className="live-message-meta">
              {entry.sourceDevice}
              {entry.modality === 'voice' ? ' voice' : ''}
            </span>
            <time dateTime={entry.occurredAt}>
              {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              }).format(new Date(entry.occurredAt))}
            </time>
          </header>
          <p>{entry.text}</p>
        </article>
      ))}
    </div>
  )
}
