import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../../App'

describe('Context Sources', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('starts offline-safe and reduces the demo calendar to availability', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Context Sources' }))

    expect(await screen.findByText('External context should earn its way in.')).toBeInTheDocument()
    expect(screen.getAllByText('None').length).toBeGreaterThan(0)
    expect(screen.getAllByText('No calendar connected').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /Calendar availability/ }))
    await user.click(screen.getByRole('button', { name: 'Load privacy-safe demo day' }))
    expect(screen.getAllByText('Privacy-safe demo calendar summary').length).toBeGreaterThan(0)
    expect(screen.getByText('2', { selector: 'dd' })).toBeInTheDocument()
    expect(document.body.textContent).not.toContain('Private work block')
    expect(JSON.stringify(localStorage)).not.toContain('Private work block')
    expect(JSON.stringify(sessionStorage)).not.toContain('Private work block')
  })

  it('keeps future ecosystem adapters visibly disconnected', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Context Sources' }))
    await user.click(await screen.findByRole('button', { name: /Somnora Fitness/ }))

    expect(screen.getByText('This adapter cannot be enabled.')).toBeInTheDocument()
    expect(screen.getByText(/No fitness account/)).toBeInTheDocument()
  })
})
