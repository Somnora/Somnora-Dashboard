import type { HTMLAttributes, PropsWithChildren } from 'react'

interface GlassPanelProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'article' | 'aside' | 'div'
}

export function GlassPanel({
  as: Element = 'section',
  className = '',
  children,
  ...props
}: PropsWithChildren<GlassPanelProps>) {
  return (
    <Element className={`glass-panel ${className}`.trim()} {...props}>
      {children}
    </Element>
  )
}
