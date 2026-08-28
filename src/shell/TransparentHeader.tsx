import { DemoBadge } from '../features/common/DemoBadge'
import { DeviceStatus } from './DeviceStatus'

interface TransparentHeaderProps {
  eyebrow: string
  title: string
}

export function TransparentHeader({ eyebrow, title }: TransparentHeaderProps) {
  return (
    <header className="transparent-header">
      <div className="header-title">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="header-status">
        <DemoBadge />
        <DeviceStatus />
      </div>
    </header>
  )
}
