import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'

describe('seeded ecosystem views', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('switches among Dream, Daily, and Eureka while keeping demo disclosure', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Conversations' }))
    await user.click(await screen.findByRole('tab', { name: 'Dream' }))

    expect(screen.getByText(/bright windows in a building/)).toBeInTheDocument()
    expect(screen.getByText(/Live account sync is not active/)).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Daily' }))
    expect(screen.getByText(/productive, but the last few days/)).toBeInTheDocument()
  })

  it('keeps dream imagery tentative and personal', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Themes' }))
    await user.click(await screen.findByRole('button', { name: /Windows and light/ }))

    expect(screen.getByText(/not a universal dream symbol/)).toBeInTheDocument()
  })

  it('keeps growth source-linked, user-reviewed, and free of reward mechanics', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Growth' }))

    expect(await screen.findByText('Growth is a story, not a score')).toBeInTheDocument()
    expect(screen.getByText('No points')).toBeInTheDocument()
    expect(screen.getByText('No streak pressure')).toBeInTheDocument()
    expect(screen.getByText(/I have gone two weeks without taking my phone into bed/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'This feels true' }))
    expect(screen.getByText(/true for this session/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Curiosity returned in more than one form/ }))
    await user.click(screen.getByRole('button', { name: 'Needs nuance' }))
    expect(screen.getByText(/open to your correction/)).toBeInTheDocument()
  })

  it('labels biometric dates, units, and demo boundaries without a health score', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Analytics' }))

    expect(await screen.findByText('7 h')).toBeInTheDocument()
    expect(screen.getByText('59 bpm')).toBeInTheDocument()
    expect(screen.getByText(/This is context, not a health score/)).toBeInTheDocument()
    expect(screen.getByText(/No HealthKit or live account data/)).toBeInTheDocument()
  })
})
