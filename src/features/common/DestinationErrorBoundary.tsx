import { Component } from 'react'
import type { ErrorInfo, PropsWithChildren } from 'react'

interface DestinationErrorBoundaryProps extends PropsWithChildren {
  resetKey: string
}

interface DestinationErrorBoundaryState {
  failed: boolean
}

export class DestinationErrorBoundary extends Component<
  DestinationErrorBoundaryProps,
  DestinationErrorBoundaryState
> {
  state: DestinationErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): DestinationErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Workbench destination failed to open.', error, info.componentStack)
  }

  componentDidUpdate(previous: DestinationErrorBoundaryProps) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false })
    }
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <section className="destination-error glass-panel" role="alert">
        <p className="eyebrow">Workspace interrupted</p>
        <h2>This part of the Workbench did not open.</h2>
        <p>Your account data has not been changed. Reload the Workbench to try this screen again.</p>
        <button
          className="primary-button"
          onClick={() => window.location.reload()}
          type="button"
        >
          Reload Workbench
        </button>
      </section>
    )
  }
}
