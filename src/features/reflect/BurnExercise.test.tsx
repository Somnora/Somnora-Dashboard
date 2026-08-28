import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BurnExercise } from './BurnExercise'

describe('BurnExercise privacy', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('clears the original text before animation and never persists it', async () => {
    const user = userEvent.setup()
    const privateText = 'I am afraid my ideas are not original.'
    render(<BurnExercise onClose={vi.fn()} open />)

    fireEvent.change(screen.getByLabelText('Write what you are ready to release'), {
      target: { value: privateText },
    })
    await user.click(screen.getByRole('button', { name: 'Review before burning' }))
    expect(screen.getByText(privateText)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Burn and clear the text' }))

    expect(screen.queryByText(privateText)).not.toBeInTheDocument()
    expect(JSON.stringify(localStorage)).not.toContain(privateText)
    expect(JSON.stringify(sessionStorage)).not.toContain(privateText)

    expect(
      await screen.findByRole(
        'heading',
        { name: 'The original words are gone.' },
        { timeout: 2500 },
      ),
    ).toBeInTheDocument()
  })

  it('clears unsaved writing when closed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { rerender } = render(<BurnExercise onClose={onClose} open />)

    await user.type(screen.getByLabelText('Write what you are ready to release'), 'Temporary words')
    await user.click(screen.getByRole('button', { name: 'Close and clear' }))
    expect(onClose).toHaveBeenCalled()

    rerender(<BurnExercise onClose={onClose} open={false} />)
    rerender(<BurnExercise onClose={onClose} open />)
    expect(screen.getByLabelText('Write what you are ready to release')).toHaveValue('')
  })
})
