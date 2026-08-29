import { routeLabel } from '../../domain/actionRuntime'
import type { DeliveryState } from '../../domain/types'

export function ActionRuntimeSummary({ delivery }: { delivery: DeliveryState }) {
  const route = routeLabel(delivery.route ?? 'watch-via-iphone')
  const active = delivery.status !== 'idle'

  return (
    <section className="runtime-contract" aria-label="Nora action runtime contract">
      <div className="runtime-contract-heading">
        <div>
          <p className="eyebrow">Action runtime</p>
          <strong>{active ? 'A bounded action is active.' : 'Consent prepares one bounded action.'}</strong>
        </div>
        <span>{active ? delivery.status : 'approved'}</span>
      </div>
      <dl>
        <div>
          <dt>Consent</dt>
          <dd>Explicit, single action</dd>
        </div>
        <div>
          <dt>Route</dt>
          <dd>{route}</dd>
        </div>
        <div>
          <dt>Progress</dt>
          <dd>{delivery.progressTarget} {delivery.progressUnit}</dd>
        </div>
        <div>
          <dt>Outcome</dt>
          <dd>Status only, memory waits</dd>
        </div>
      </dl>
    </section>
  )
}
