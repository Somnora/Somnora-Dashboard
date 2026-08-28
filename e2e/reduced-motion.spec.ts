import { expect, test } from '@playwright/test'

test('burn exercise clears private text before the visual completion', async ({ page }) => {
  const privateText = 'I am afraid I will miss the moment.'
  await page.goto('/')
  await page.getByRole('button', { name: 'Open private burn exercise' }).click()
  await page.getByLabel('Write what you are ready to release').fill(privateText)
  await page.getByRole('button', { name: 'Review before burning' }).click()
  await expect(page.getByText(privateText)).toBeVisible()
  await page.getByRole('button', { name: 'Burn and clear the text' }).click()

  await expect(page.getByText(privateText)).not.toBeVisible()
  const storageDuringBurn = await page.evaluate(() => ({
    local: JSON.stringify(localStorage),
    session: JSON.stringify(sessionStorage),
  }))
  expect(storageDuringBurn.local).not.toContain(privateText)
  expect(storageDuringBurn.session).not.toContain(privateText)

  await expect(page.getByRole('heading', { name: 'The original words are gone.' })).toBeVisible()
  await page.getByRole('button', { name: 'Finish and clear' }).click()
  await page.getByRole('button', { name: 'Open private burn exercise' }).click()
  await expect(page.getByLabel('Write what you are ready to release')).toHaveValue('')
})

test('reduced motion uses a quiet dissolve with no flame or particles', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open private burn exercise' }).click()
  await page.getByLabel('Write what you are ready to release').fill('Temporary reduced motion text')
  await page.getByRole('button', { name: 'Review before burning' }).click()
  await page.getByRole('button', { name: 'Burn and clear the text' }).click()

  await expect(page.getByText('The page dissolves quietly.')).toBeVisible()
  await expect(page.locator('.burn-flame').first()).toBeHidden()
  await expect(page.locator('.ash-particle').first()).toBeHidden()
  await expect(page.locator('.burn-sheet')).toHaveCSS('animation-name', 'paper-dissolve')
  await expect(page.getByRole('heading', { name: 'The original words are gone.' })).toBeVisible()
})

test('activity library labels continuity and preview-only ideas honestly', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Preview more activities' }).click()

  await expect(page.getByText('Reset · Existing Somnora continuity')).toBeVisible()
  await expect(page.getByText(/Not new hackathon work/)).toBeVisible()
  await expect(page.getByText('Color Hunt')).toBeVisible()
  await expect(page.getByText(/No start control is available/).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Start Color Hunt/ })).toHaveCount(0)
})
