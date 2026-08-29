import { mkdir } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

const screenshotDirectory = 'screenshots/local'

async function capture(
  page: import('@playwright/test').Page,
  name: string,
  animations: 'allow' | 'disabled' = 'disabled',
) {
  await page.screenshot({
    animations,
    fullPage: false,
    path: `${screenshotDirectory}/${name}.png`,
  })
}

test('@visual capture the recordable dashboard fixtures', async ({ page }) => {
  await mkdir(screenshotDirectory, { recursive: true })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Three Beautiful Things' })).toBeVisible()
  await capture(page, 'home-1440')

  await page.setViewportSize({ width: 1280, height: 800 })
  await capture(page, 'home-1280')
  await page.setViewportSize({ width: 1440, height: 900 })

  await page.getByRole('button', { name: 'Why this' }).click()
  await expect(page.getByText('Focused explanation')).toBeVisible()
  await expect(page.getByRole('link', { name: 'React Flow attribution' })).toBeVisible()
  await page.waitForTimeout(1100)
  await capture(page, 'about-me-focused-1440')

  await page.getByRole('button', { name: 'Conversations' }).click()
  await expect(page.getByRole('tab', { name: 'Dream' })).toBeVisible()
  await capture(page, 'conversations-1440')

  await page.getByRole('button', { name: 'Themes' }).click()
  await expect(page.getByRole('button', { name: /Windows and light/ })).toBeVisible()
  await capture(page, 'themes-1440')

  await page.getByRole('button', { name: 'Timeline' }).click()
  await expect(page.getByText('Your days make more sense together.')).toBeVisible()
  await capture(page, 'timeline-1440')

  await page.getByRole('button', { name: 'Action Desk' }).click()
  await expect(page.getByText('Every action has a boundary.')).toBeVisible()
  await capture(page, 'action-desk-1440')

  await page.getByRole('button', { name: 'Analytics' }).click()
  await expect(page.getByText('This is context, not a health score.')).toBeVisible()
  await capture(page, 'analytics-1440')

  await page.getByRole('button', { name: 'Home', exact: true }).click()
  await page.getByRole('button', { name: 'Accept invitation' }).click()
  await expect(page.getByText('Consent recorded. No delivery yet.')).toBeVisible()
  await capture(page, 'hero-consent-1440')
  await page.getByRole('button', { name: 'Send to iPhone and Watch' }).click()
  await expect(page.getByRole('button', { name: 'Start activity' })).toBeVisible()
  await capture(page, 'hero-acknowledged-1440')

  await page.getByRole('button', { name: 'Start activity' }).click()
  const addPhoto = page.getByRole('button', { name: 'Add next demo photo' })
  await addPhoto.click()
  await addPhoto.click()
  await addPhoto.click()
  await expect(page.getByText('Private Field Note')).toBeVisible()
  await expect
    .poll(() =>
      page.locator('.field-note-collage img').evaluateAll((images) =>
        images.every((image) => (image as HTMLImageElement).naturalWidth > 0),
      ),
    )
    .toBe(true)
  const fieldNoteGeometry = await page.evaluate(() => {
    const workspace = document.querySelector<HTMLElement>('#main-content')
    const heading = Array.from(document.querySelectorAll('h2')).find(
      (element) => element.textContent === 'Three things interrupted the ordinary.',
    )
    const workspaceBounds = workspace?.getBoundingClientRect()
    const headingBounds = heading?.getBoundingClientRect()
    return {
      headingLeft: headingBounds?.left,
      headingTop: headingBounds?.top,
      cardScrollLeft: document.querySelector<HTMLElement>('.invitation-card')?.scrollLeft,
      scrollLeft: workspace?.scrollLeft,
      scrollTop: workspace?.scrollTop,
      windowX: window.scrollX,
      windowY: window.scrollY,
      workspaceLeft: workspaceBounds?.left,
      workspaceTop: workspaceBounds?.top,
    }
  })
  expect(fieldNoteGeometry.scrollLeft).toBe(0)
  expect(fieldNoteGeometry.cardScrollLeft).toBe(0)
  expect(fieldNoteGeometry.scrollTop).toBe(0)
  expect(fieldNoteGeometry.windowX).toBe(0)
  expect(fieldNoteGeometry.windowY).toBe(0)
  expect(fieldNoteGeometry.headingLeft).toBeGreaterThanOrEqual(
    fieldNoteGeometry.workspaceLeft ?? 0,
  )
  expect(fieldNoteGeometry.headingTop).toBeGreaterThanOrEqual(
    fieldNoteGeometry.workspaceTop ?? 0,
  )
  await capture(page, 'field-note-1440')

  await page.getByRole('button', { name: 'Reset the demo loop' }).click()
  await page.getByRole('button', { name: 'Open private burn exercise' }).click()
  await page
    .getByLabel('Write what you are ready to release')
    .fill('I am afraid that slowing down means I am falling behind.')
  await page.getByRole('button', { name: 'Review before burning' }).click()
  await capture(page, 'burn-review-1440')
  await page.getByRole('button', { name: 'Burn and clear the text' }).click()
  await expect(page.getByText('The page is becoming ash.')).toBeVisible()
  await page.waitForTimeout(220)
  await capture(page, 'burn-animation-1440', 'allow')
  await expect(page.getByRole('heading', { name: 'The original words are gone.' })).toBeVisible()
  await capture(page, 'burn-complete-1440')
  await page.getByRole('button', { name: 'Finish and clear' }).click()

  await page.getByRole('button', { name: 'Preview more activities' }).click()
  await expect(page.getByText('Nora activity library')).toBeVisible()
  await capture(page, 'activity-library-1440')
})
