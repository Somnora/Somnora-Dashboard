import { expect, test } from '@playwright/test'

test('conversation modes switch and preserve the selected mode in session', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Conversations' }).click()
  await page.getByRole('tab', { name: 'Dream' }).click()
  await expect(page.getByText(/bright windows in a building/)).toBeVisible()

  await page.getByRole('button', { name: 'Themes' }).click()
  await page.getByRole('button', { name: 'Conversations' }).click()
  await expect(page.getByRole('tab', { name: 'Dream' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})

test('themes keep imagery personal and growth non-scored', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Themes' }).click()
  await page.getByRole('button', { name: /Windows and light/ }).click()

  await expect(page.getByText(/not a universal dream symbol/)).toBeVisible()
  await expect(page.getByText(/without becoming a perfection score/)).toBeVisible()
})

test('analytics exposes units and a seeded-data boundary', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Analytics' }).click()

  await expect(page.getByText('7 h')).toBeVisible()
  await expect(page.getByText('59 bpm')).toBeVisible()
  await expect(page.getByText(/context, not a health score/)).toBeVisible()
  await expect(page.getByText(/No HealthKit or live account data/)).toBeVisible()
  await expect(page.getByRole('img', { name: /sleep duration over seven days/ })).toBeVisible()
  await expect(page.getByRole('img', { name: /HRV over seven days/ })).toBeVisible()
})
