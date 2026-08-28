import type { ReactNode } from 'react'

export function ErrorState({
  title,
  body,
  actions,
}: {
  title: string
  body: string
  actions: ReactNode
}) {
  return (
    <div className="error-state" role="alert">
      <p className="eyebrow">Handoff paused</p>
      <h3>{title}</h3>
      <p>{body}</p>
      <div>{actions}</div>
    </div>
  )
}
