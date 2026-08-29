import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('renders the Living Nora home and demo disclosure', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Good evening, Jules' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Seeded demo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Three Beautiful Things' })).toBeInTheDocument()
  })

  it('makes every primary destination reachable', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Action Desk' }))
    expect(await screen.findByRole('heading', { name: 'Action Desk' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Consent' }))
    expect(await screen.findByRole('heading', { name: 'Consent Console' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Conversations' }))
    expect(await screen.findByRole('heading', { name: 'Conversations' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Timeline' }))
    expect(await screen.findByRole('heading', { name: 'Context Timeline' })).toBeInTheDocument()
    expect(await screen.findByText('Your days make more sense together.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'About Me' }))
    expect(await screen.findByRole('heading', { name: 'About Me' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Themes' }))
    expect(await screen.findByRole('heading', { name: 'Themes' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Analytics' }))
    expect(await screen.findByRole('heading', { name: 'Analytics' })).toBeInTheDocument()
  })
})
