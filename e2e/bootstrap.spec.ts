import { expect, test } from '@playwright/test'

test('renders the Workbench baseline', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Good evening, Jules' }),
  ).toBeVisible()
  await expect(page.getByText('Seeded demo')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Three Beautiful Things' }),
  ).toBeVisible()
})

test('primary destinations remain free of browser console warnings and errors', async ({ page }) => {
  const problems: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      problems.push(`${message.type()}: ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))

  await page.goto('/')
  await page.getByRole('button', { name: 'Action Desk' }).click()
  await expect(page.getByRole('heading', { name: 'Action Desk' })).toBeVisible()
  await expect(page.getByText('Every action has a boundary.')).toBeVisible()
  await page.getByRole('button', { name: 'Consent', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Consent Console' })).toBeVisible()
  await expect(page.getByText('Nora can be proactive without being in charge.')).toBeVisible()
  await page.getByRole('button', { name: 'Conversations' }).click()
  await expect(page.getByRole('tab', { name: 'Dream' })).toBeVisible()
  await page.getByRole('button', { name: 'Timeline' }).click()
  await expect(page.getByText('Your days make more sense together.')).toBeVisible()
  await page.getByRole('button', { name: 'About Me' }).click()
  await expect(page.getByText('Select a memory.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'React Flow attribution' })).toBeVisible()
  await page.waitForTimeout(1100)
  await page.getByRole('button', { name: 'Themes' }).click()
  await expect(page.getByRole('button', { name: /Windows and light/ })).toBeVisible()
  await page.getByRole('button', { name: 'Growth' }).click()
  await expect(page.getByText('Growth is a story, not a score')).toBeVisible()
  await page.getByRole('button', { name: 'Activity Studio', exact: true }).click()
  await expect(page.getByText('Find an action that fits the person you are today.')).toBeVisible()
  await page.getByRole('button', { name: 'Analytics' }).click()
  await expect(page.getByText('This is context, not a health score.')).toBeVisible()

  expect(problems).toEqual([])
})
