import { render, screen } from '@testing-library/react'
import { DestinationErrorBoundary } from './DestinationErrorBoundary'

function Destination({ fail }: { fail: boolean }) {
  if (fail) throw new Error('Destination failed')
  return <p>Destination restored</p>
}

describe('DestinationErrorBoundary', () => {
  it('keeps a failed destination recoverable and resets after navigation', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { rerender } = render(
      <DestinationErrorBoundary resetKey="themes">
        <Destination fail />
      </DestinationErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('This part of the Workbench did not open.')
    expect(screen.getByRole('button', { name: 'Reload Workbench' })).toBeInTheDocument()

    rerender(
      <DestinationErrorBoundary resetKey="analytics">
        <Destination fail={false} />
      </DestinationErrorBoundary>,
    )

    expect(await screen.findByText('Destination restored')).toBeInTheDocument()
    consoleError.mockRestore()
  })
})
