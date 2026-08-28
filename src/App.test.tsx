import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('renders the Workbench identity and demo disclosure', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Desktop Workbench' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Privacy-safe demo profile')).toBeInTheDocument()
  })
})
