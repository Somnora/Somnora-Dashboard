import { expect, test } from '@playwright/test'

if (process.env.WORKBENCH_RELAY_E2E === '1') {
  test('unpaired relay mode stays honest and keeps pairing visible in a compact window', async ({ page }) => {
    await page.setViewportSize({ width: 760, height: 800 })
    await page.goto('/')

    await expect(page.getByText('Preview data')).toBeVisible()
    await expect(page.getByLabel('Somnora account not linked')).toBeVisible()
    await page.getByRole('button', { name: 'Conversations', exact: true }).click()
    const connectHeading = page.getByRole('heading', { name: 'Connect your Somnora account.' })
    await expect(connectHeading).toBeVisible()

    const geometry = await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2')).find(
        (element) => element.textContent?.includes('Connect your Somnora account'),
      )
      const layout = document.querySelector('.live-conversations-layout')
      const list = document.querySelector('.live-thread-list')
      const workspace = document.querySelector('.live-conversation-workspace')
      return {
        headingTop: heading?.getBoundingClientRect().top,
        layoutColumns: layout ? getComputedStyle(layout).gridTemplateColumns : null,
        listBottom: list?.getBoundingClientRect().bottom,
        workspaceTop: workspace?.getBoundingClientRect().top,
      }
    })

    expect(geometry.layoutColumns?.split(' ')).toHaveLength(1)
    expect(geometry.workspaceTop).toBeGreaterThanOrEqual(geometry.listBottom ?? 0)
    expect(geometry.headingTop).toBeLessThan(800)
  })
}
