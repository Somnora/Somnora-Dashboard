import { expect, test } from '@playwright/test'

function compactIcsDate(date: Date): string {
  return date.toISOString().replaceAll('-', '').replaceAll(':', '').replace(/\.\d{3}/, '')
}

test('permissioned weather and local calendar context adapt Activity Studio', async ({ context, page }) => {
  const privateCalendarTitle = 'Private board meeting with confidential notes'
  await context.grantPermissions(['geolocation'], { origin: 'http://127.0.0.1:4173' })
  await context.setGeolocation({ latitude: 34.0522, longitude: -118.2437 })
  await page.route('https://api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        current: {
          time: '2026-08-28T19:15',
          temperature_2m: 68,
          precipitation: 1.2,
          weather_code: 61,
        },
      }),
      contentType: 'application/json',
      status: 200,
    })
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'Context Sources', exact: true }).click()
  await expect(page.getByText('External context should earn its way in.')).toBeVisible()
  await expect(page.getByText('None', { exact: true }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Use location once for weather' }).click()
  await expect(page.getByText('Open-Meteo current conditions').first()).toBeVisible()
  await expect(page.getByText('Weather only')).toBeVisible()
  await expect(page.getByText('Rain').first()).toBeVisible()

  const calendarStart = new Date(Date.now() - 60_000)
  const calendarEnd = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${compactIcsDate(calendarStart)}`,
    `DTEND:${compactIcsDate(calendarEnd)}`,
    `SUMMARY:${privateCalendarTitle}`,
    'LOCATION:Private exact address',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  await page.getByRole('button', { name: /Calendar availability/ }).click()
  await page.getByLabel('Calendar ICS file').setInputFiles({
    buffer: Buffer.from(calendar),
    mimeType: 'text/calendar',
    name: 'private.ics',
  })
  await expect(page.getByText('Local ICS availability summary').first()).toBeVisible()
  await expect(page.getByText('5 min').first()).toBeVisible()
  await expect(page.getByText(privateCalendarTitle)).toHaveCount(0)

  const storage = await page.evaluate(() => ({
    local: JSON.stringify(localStorage),
    session: JSON.stringify(sessionStorage),
  }))
  expect(storage.local).not.toContain(privateCalendarTitle)
  expect(storage.session).not.toContain(privateCalendarTitle)

  await page.getByRole('button', { name: 'Activity Studio', exact: true }).click()
  await page.getByRole('button', { name: 'Use current context' }).click()
  await expect(page.getByText('5 min', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'One breath lines' })).toBeVisible()
  await expect(page.getByText(/Open-Meteo current conditions/)).toBeVisible()
})
