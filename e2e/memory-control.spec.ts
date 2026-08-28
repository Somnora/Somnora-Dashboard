import { expect, test } from '@playwright/test'

test('Why this focuses evidence and memory correction stays inspectable', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Why this' }).click()

  await expect(page.getByText('Focused explanation')).toBeVisible()
  await expect(page.getByText('4 of 4 invitation sources remain active.')).toBeVisible()
  await expect(page.locator('.react-flow__edge')).toHaveCount(18)

  const movementNode = page.getByRole('button', { name: /Movement loosens ideas/ })
  await movementNode.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Movement loosens ideas' })).toBeVisible()

  await page.getByRole('button', { name: 'Not quite' }).click()
  await page
    .getByLabel('What is more accurate?')
    .fill('Movement helps sometimes, but quiet rooms can help too.')
  await page.getByRole('button', { name: 'Apply for this session' }).click()

  await expect(page.getByText('Session update: corrected')).toBeVisible()
  await expect(
    page.getByText('Movement helps sometimes, but quiet rooms can help too.'),
  ).toBeVisible()
})

test('forgetting a focused memory removes its support from Why this', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Why this' }).click()
  await page.getByRole('button', { name: /Movement loosens ideas/ }).click()
  await page.getByRole('button', { name: 'Forget this' }).click()

  await expect(page.getByRole('button', { name: 'Forget for this session' })).toBeVisible()
  await page.getByRole('button', { name: 'Forget for this session' }).click()

  await expect(page.getByRole('button', { name: /Movement loosens ideas/ })).not.toBeVisible()
  await expect(page.getByText('2 of 4 invitation sources remain active.')).toBeVisible()
})
