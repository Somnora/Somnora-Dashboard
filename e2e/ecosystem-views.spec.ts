import { expect, test } from '@playwright/test'

test('conversation modes switch and preserve the selected mode in session', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Conversations' }).click()
  await page.getByRole('tab', { name: 'Dream' }).click()
  await expect(
    page.getByText('I kept finding bright windows in a building I thought was empty.'),
  ).toBeVisible()

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

test('timeline connects ecosystem sources and keeps reasoning inspectable', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Timeline' }).click()

  await expect(page.getByRole('heading', { name: 'Context Timeline' })).toBeVisible()
  await expect(page.getByText('Your days make more sense together.')).toBeVisible()
  await expect(page.getByText(/roadmap integrations, not active demo data/)).toBeVisible()

  await page.getByRole('button', { name: 'Dream', exact: true }).click()
  await expect(page.getByText('Dream reflection')).toBeVisible()
  await expect(page.getByText('Daily reflection')).not.toBeVisible()

  await page.getByRole('button', { name: /Dream reflection/ }).click()
  await expect(page.getByText('Confirmed by you or directly recorded')).toBeVisible()
  await expect(page.locator('.timeline-evidence blockquote')).toContainText(
    /bright windows in a building/,
  )
  await page.getByRole('button', { name: 'Open source view' }).click()
  await expect(page.getByRole('heading', { name: 'Conversations' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Dream' })).toHaveAttribute('aria-selected', 'true')
})

test('Action Desk separates Nora noticing from user authority', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Action Desk' }).click()

  await expect(page.getByText('Nora can notice and suggest.')).toBeVisible()
  await expect(page.getByText('Only you approve or decline.')).toBeVisible()
  await expect(page.getByRole('button', { name: /Proposed.*Three Beautiful Things/ })).toBeVisible()
  await expect(page.getByText('Waiting for you', { exact: true })).toBeVisible()
  await expect(page.getByText('No route prepared')).toBeVisible()

  await page.getByRole('button', { name: 'Closed' }).click()
  await expect(page.getByRole('button', { name: /Completed.*Breathing Reset/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Failed.*Tiny Detour/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Declined.*Six Line Story/ })).toBeVisible()

  await page.getByRole('button', { name: 'Needs you' }).click()
  await page.getByRole('button', { name: /Proposed.*Three Beautiful Things/ }).click()
  await page.getByRole('button', { name: 'Review on Home' }).click()
  await expect(page.getByRole('button', { name: 'Accept invitation' })).toBeVisible()
})

test('Action Desk reflects approval and active runtime without granting new authority', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Accept invitation' }).click()
  await page.getByRole('button', { name: 'Action Desk' }).click()

  await expect(page.getByRole('button', { name: /Approved.*Three Beautiful Things/ })).toBeVisible()
  await expect(page.getByText('Planned, not sent: Workbench to iPhone to Watch')).toBeVisible()
  await expect(page.getByText('Sending remains a separate choice.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send to iPhone and Watch' })).not.toBeVisible()

  await page.getByRole('button', { name: 'Review on Home' }).click()
  await page.getByRole('button', { name: 'Send to iPhone and Watch' }).click()
  await expect(page.getByRole('button', { name: 'Start activity' })).toBeVisible()
  await page.getByRole('button', { name: 'Action Desk' }).click()

  await expect(page.getByRole('button', { name: /Active.*Three Beautiful Things/ })).toBeVisible()
  await expect(page.getByText('Workbench to iPhone to Watch')).toBeVisible()
  await expect(page.getByText('This workspace can inspect and route you back to a decision.')).toBeVisible()
})

test('Consent Console separates suggestion access from preparation authority', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Consent', exact: true }).click()

  await expect(page.getByText('Nora can be proactive without being in charge.')).toBeVisible()
  await expect(page.getByText('Consequential actions')).toBeVisible()
  await expect(page.getByText('Ask every time').first()).toBeVisible()

  const eureka = page.getByRole('group', { name: 'Eureka ideas maximum access' })
  await expect(eureka.getByRole('button', { name: 'Prepare' })).toHaveAttribute('aria-pressed', 'true')
  await eureka.getByRole('button', { name: 'Observe' }).click()
  await page.getByRole('button', { name: 'Home', exact: true }).click()
  await expect(page.getByText('Held by your consent settings')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Accept invitation' })).not.toBeVisible()

  await page.getByRole('button', { name: 'Consent', exact: true }).click()
  await eureka.getByRole('button', { name: 'Prepare' }).click()
  const activity = page.getByRole('group', { name: 'Activity and location maximum access' })
  await activity.getByRole('button', { name: 'Suggest' }).click()
  await page.getByRole('button', { name: 'Home', exact: true }).click()
  await page.getByRole('button', { name: 'Accept invitation' }).click()

  await expect(page.getByText('Preparation held')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send to iPhone and Watch' })).not.toBeVisible()
  await page.getByRole('button', { name: 'Review consent settings' }).click()
  await activity.getByRole('button', { name: 'Prepare' }).click()
  await page.getByRole('button', { name: 'Home', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Send to iPhone and Watch' })).toBeVisible()
})

test('Consent Console labels future adapters without granting unavailable access', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Consent', exact: true }).click()

  const nutrition = page.getByRole('group', { name: 'Somnora Nutrition maximum access' })
  await expect(nutrition.getByRole('button', { name: 'Off' })).toHaveAttribute('aria-pressed', 'true')
  await expect(nutrition.getByRole('button', { name: 'Observe' })).toBeDisabled()
  await expect(nutrition.getByRole('button', { name: 'Suggest' })).toBeDisabled()
  await expect(nutrition.getByRole('button', { name: 'Prepare' })).toBeDisabled()

  await page.getByRole('button', { name: /Somnora Nutrition.*Future adapter/ }).click()
  await expect(page.getByRole('heading', { name: 'Somnora Nutrition' })).toBeVisible()
  await expect(page.getByText('No connector', { exact: true })).toBeVisible()
  await expect(page.getByText(/No Nutrition connector or live Nutrition data/)).toBeVisible()
})
