import { expect, test } from '@playwright/test'

test('primary navigation and modal close work by keyboard', async ({ page }) => {
  await page.goto('/')

  const conversations = page.getByRole('button', { name: 'Conversations' })
  await conversations.focus()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('heading', { name: 'Conversations', exact: true }),
  ).toBeVisible()

  const home = page.getByRole('button', { name: 'Home', exact: true })
  await home.focus()
  await page.keyboard.press('Enter')

  const adjust = page.getByRole('button', { name: 'Adjust' })
  await adjust.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(adjust).toBeFocused()
})

test('modal focus stays inside the dialog until it closes', async ({ page }) => {
  await page.goto('/')
  const adjust = page.getByRole('button', { name: 'Adjust' })
  await adjust.click()

  const close = page.getByRole('button', { name: 'Close dialog' })
  const finalOption = page.getByRole('button', { name: /Try another activity/ })
  await expect(close).toBeFocused()

  await page.keyboard.press('Shift+Tab')
  await expect(finalOption).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(adjust).toBeFocused()
})

test('home fits the two target recording sizes without horizontal clipping', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')

    const geometry = await page.evaluate(() => ({
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
      cardBottom: document
        .querySelector('.invitation-card')
        ?.getBoundingClientRect().bottom,
    }))

    expect(geometry.bodyWidth).toBeLessThanOrEqual(geometry.viewportWidth)
    expect(geometry.cardBottom).toBeLessThanOrEqual(viewport.height)
  }
})

test('Action Desk keeps its authority record inside both target widths', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.getByRole('button', { name: 'Action Desk' }).click()
    await expect(page.getByText('Every action has a boundary.')).toBeVisible()

    const geometry = await page.evaluate(() => {
      const workspace = document.querySelector('#main-content')?.getBoundingClientRect()
      const layout = document.querySelector('.action-desk-layout')?.getBoundingClientRect()
      return {
        bodyWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
        layoutLeft: layout?.left,
        layoutRight: layout?.right,
        workspaceLeft: workspace?.left,
        workspaceRight: workspace?.right,
      }
    })

    expect(geometry.bodyWidth).toBeLessThanOrEqual(geometry.viewportWidth)
    expect(geometry.layoutLeft).toBeGreaterThanOrEqual(geometry.workspaceLeft ?? 0)
    expect(geometry.layoutRight).toBeLessThanOrEqual(geometry.workspaceRight ?? viewport.width)
  }
})

test('changing destinations resets the workspace scroll position', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Analytics' }).click()
  await expect(page.getByText('This is context, not a health score.')).toBeVisible()
  await page.locator('#main-content').evaluate((element) => {
    element.scrollTop = 240
    element.scrollLeft = 40
  })

  await page.getByRole('button', { name: 'Home', exact: true }).click()

  await expect
    .poll(() =>
      page.locator('#main-content').evaluate((element) => ({
        left: element.scrollLeft,
        top: element.scrollTop,
      })),
    )
    .toEqual({ left: 0, top: 0 })
})

test('reduced motion removes long interface transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const duration = await page
    .getByRole('button', { name: 'Accept invitation' })
    .evaluate((element) => getComputedStyle(element).transitionDuration)

  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.00001)
})

test('adjustment still waits for explicit acceptance', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Adjust' }).click()
  await page.getByRole('button', { name: /Make it shorter/ }).click()

  await expect(
    page.getByRole('heading', {
      name: 'Three Beautiful Things, Twelve Minutes',
    }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Accept invitation' })).toBeVisible()
  await expect(page.getByText('Pending')).not.toBeVisible()
})
