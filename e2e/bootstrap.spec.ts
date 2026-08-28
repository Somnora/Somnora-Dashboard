import { expect, test } from '@playwright/test'

test('renders the Workbench baseline', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Desktop Workbench' }),
  ).toBeVisible()
  await expect(page.getByText('Privacy-safe demo profile')).toBeVisible()
})
