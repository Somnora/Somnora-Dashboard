import { useLayoutEffect, useRef } from 'react'
import type { PropsWithChildren } from 'react'
import type { Destination } from '../domain/types'
import { useWorkbench } from '../state/workbenchContext'
import { NavigationRail } from './NavigationRail'
import { TransparentHeader } from './TransparentHeader'

const destinationCopy: Record<
  Destination,
  { eyebrow: string; title: string; background: string }
> = {
  home: { eyebrow: 'Living Nora', title: 'Good evening, Jules', background: 'eureka' },
  'action-desk': { eyebrow: 'Consent and motion', title: 'Action Desk', background: 'mindful' },
  consent: { eyebrow: 'Your authority', title: 'Consent Console', background: 'eureka' },
  conversations: { eyebrow: 'Your three threads', title: 'Conversations', background: 'dream' },
  timeline: { eyebrow: 'Across your ecosystem', title: 'Context Timeline', background: 'mindful' },
  'about-me': { eyebrow: 'Inspectable memory', title: 'About Me', background: 'eureka' },
  growth: { eyebrow: 'Then and now', title: 'Growth', background: 'mindful' },
  themes: { eyebrow: 'Patterns across time', title: 'Themes', background: 'mindful' },
  analytics: { eyebrow: 'Body and rest', title: 'Analytics', background: 'insights' },
}

export function AppShell({ children }: PropsWithChildren) {
  const { state } = useWorkbench()
  const copy = destinationCopy[state.destination]
  const contentRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0)
      if (!contentRef.current) return
      contentRef.current.scrollTop = 0
      contentRef.current.scrollLeft = 0
    }
    resetScroll()
    const frame = window.requestAnimationFrame(resetScroll)
    return () => window.cancelAnimationFrame(frame)
  }, [state.delivery.status, state.destination])

  return (
    <div className={`app-shell background-${copy.background}`}>
      <div className="app-scrim" aria-hidden="true" />
      <NavigationRail />
      <div className="workspace-frame">
        <TransparentHeader eyebrow={copy.eyebrow} title={copy.title} />
        <main className="workspace-content" id="main-content" ref={contentRef}>
          {children}
        </main>
      </div>
    </div>
  )
}
