import { expect, test } from '@playwright/test'

async function acceptAndSend(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Accept invitation' }).click()
  await expect(page.getByText('Consent recorded. No delivery yet.')).toBeVisible()
  await page.getByRole('button', { name: 'Send to iPhone and Watch' }).click()
}

test('complete offline hero loop ends in one private Field Note', async ({ page }) => {
  await acceptAndSend(page)

  await expect(page.getByText('Simulated ecosystem handoff')).toBeVisible()
  await expect(page.getByText('Demo status')).toBeVisible()
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Delivered to iPhone' }),
  ).toHaveClass(/is-reached/)
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Delivered to Watch' }),
  ).toHaveClass(/is-reached/)
  await expect(page.getByRole('button', { name: 'Start activity' })).toBeVisible()

  await page.getByRole('button', { name: 'Start activity' }).click()
  const addPhoto = page.getByRole('button', { name: 'Add next demo photo' })
  await addPhoto.click()
  await expect(page.getByText('1 of 3')).toBeVisible()
  await addPhoto.click()
  await expect(page.getByText('2 of 3')).toBeVisible()
  await addPhoto.click()

  await expect(page.getByText('Private Field Note')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Three things interrupted the ordinary.' })).toBeVisible()
  await expect(page.locator('.field-note')).toHaveCount(1)
  await expect(page.getByRole('img', { name: 'Privacy-safe demo field note 1' })).toBeVisible()
  await expect
    .poll(() =>
      page.locator('.field-note-collage img').evaluateAll((images) =>
        images.map((image) => ({
          complete: (image as HTMLImageElement).complete,
          loaded: (image as HTMLImageElement).naturalWidth > 0,
        })),
      ),
    )
    .toEqual([
      { complete: true, loaded: true },
      { complete: true, loaded: true },
      { complete: true, loaded: true },
    ])
  await expect(page.getByText(/photo bytes stay on iPhone/)).toBeVisible()
})

test('refresh restores safe demo progress and resumes confirmed delivery', async ({ page }) => {
  await acceptAndSend(page)
  await expect(
    page.getByRole('listitem').filter({ hasText: 'Delivered to iPhone' }),
  ).toHaveClass(/is-reached/)

  await page.reload()

  await expect(page.getByText('Simulated ecosystem handoff')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start activity' })).toBeVisible()
  const stored = await page.evaluate(() =>
    sessionStorage.getItem('somnora-workbench-demo-progress-v1'),
  )
  expect(stored).not.toContain('photo')
  expect(stored).not.toContain('reflection')
})

test('failure stays honest and retry restarts confirmation', async ({ page }) => {
  await acceptAndSend(page)
  await page.getByText('Demo recovery checks').click()
  await page.getByRole('button', { name: 'Simulate relay failure' }).click()

  await expect(page.getByRole('heading', { name: 'Nothing was marked delivered.' })).toBeVisible()
  await page.getByRole('button', { name: 'Retry handoff' }).click()
  await expect(page.getByRole('button', { name: 'Start activity' })).toBeVisible()
})

test('cancel and expiry never imply delivery', async ({ page }) => {
  await acceptAndSend(page)
  await page.getByText('Demo recovery checks').click()
  await page.getByRole('button', { name: 'Simulate expiry' }).click()
  await expect(page.getByText('Handoff expired')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'No device action is active.' })).toBeVisible()

  await page.getByRole('button', { name: 'Reset invitation' }).click()
  await page.getByRole('button', { name: 'Accept invitation' }).click()
  await page.getByRole('button', { name: 'Send to iPhone and Watch' }).click()
  await page.getByText('Demo recovery checks').click()
  await page.getByRole('button', { name: 'Cancel handoff' }).click()
  await expect(page.getByText('Handoff cancelled')).toBeVisible()
})
