import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SixLineStory } from './SixLineStory'

describe('Six Line Story privacy', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('requires six lines and clears them when the exercise closes', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { rerender } = render(
      <SixLineStory
        onClose={onClose}
        open
        prompt="Write six short lines."
        variantLabel="One breath lines"
      />,
    )

    const complete = screen.getByRole('button', { name: 'Complete private story' })
    expect(complete).toBeDisabled()
    for (let index = 1; index <= 6; index += 1) {
      await user.type(screen.getByLabelText(`Line ${index}`), `Private line ${index}`)
    }
    expect(complete).toBeEnabled()
    await user.click(complete)
    expect(screen.getByText('Six lines exist that did not exist before.')).toBeInTheDocument()
    expect(localStorage).toHaveLength(0)
    expect(sessionStorage).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: 'Finish and clear' }))
    expect(onClose).toHaveBeenCalledOnce()
    rerender(
      <SixLineStory
        onClose={onClose}
        open={false}
        prompt="Write six short lines."
        variantLabel="One breath lines"
      />,
    )
    rerender(
      <SixLineStory
        onClose={onClose}
        open
        prompt="Write six short lines."
        variantLabel="One breath lines"
      />,
    )
    expect(screen.getByLabelText('Line 1')).toHaveValue('')
  })
})
