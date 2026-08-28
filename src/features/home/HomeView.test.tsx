import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../../App'

describe('Living Nora Home', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('revises an invitation and requires a fresh acceptance', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Adjust' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Lower the energy/ }))

    expect(
      screen.getByRole('heading', { name: 'Three Beautiful Things, From Here' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Accept invitation' })).toBeInTheDocument()
    expect(screen.queryByText('Pending')).not.toBeInTheDocument()
  })

  it('records consent without implying device dispatch', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Accept invitation' }))

    expect(screen.getByText('Consent recorded. No delivery yet.')).toBeInTheDocument()
    expect(screen.getByText(/next button starts a clearly labeled local simulation/)).toBeInTheDocument()
    expect(sessionStorage.getItem('somnora-workbench-demo-progress-v1')).toContain(
      '"status":"idle"',
    )
  })

  it('declines neutrally and accepts less-like-this feedback', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Not now' }))
    expect(screen.getByRole('heading', { name: 'No pressure.' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Less like this' }))
    expect(screen.getByText(/Photo walks will be treated as a weaker fit/)).toBeInTheDocument()
  })

  it('opens the grounded Why this evidence path', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Why this' }))

    expect(await screen.findByText('Focused explanation')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'About Me' })).toBeInTheDocument()
    expect(screen.getByText('4 of 4 invitation sources remain active.')).toBeInTheDocument()
  })
})
