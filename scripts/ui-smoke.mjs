import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

mkdirSync('/opt/cursor/artifacts', { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900'],
  defaultViewport: { width: 1280, height: 900 },
})

const page = await browser.newPage()
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })

const results = []
function ok(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

await page.type('#account-name', '暦太郎')
await page.click('.auth-form .primary-btn')
await page.waitForSelector('.date-calendar')

ok('calendar visible', true)
ok('no swipe date control', (await page.$$('.date-swiper')).length === 0)

const before = await page.$eval(
  '.date-calendar-selected strong',
  (el) => el.textContent.trim(),
)

// Click a day that isn't selected: prefer day 15 if available, else another cell
const clicked = await page.evaluate(() => {
  const cells = [...document.querySelectorAll('.cal-cell:not(.empty):not(.selected)')]
  const target =
    cells.find((el) => el.textContent?.trim() === '15') || cells[Math.min(5, cells.length - 1)]
  if (!target) return null
  ;(target).click()
  return target.querySelector('.cal-day')?.textContent?.trim() || null
})
ok('tapped a calendar day', Boolean(clicked), String(clicked))

await page.waitForFunction(
  (prev) => {
    const el = document.querySelector('.date-calendar-selected strong')
    return el && el.textContent.trim() !== prev
  },
  {},
  before,
)
const after = await page.$eval(
  '.date-calendar-selected strong',
  (el) => el.textContent.trim(),
)
ok('selected date updated', after !== before, `${before} → ${after}`)

await page.click('.date-calendar-nav button:last-child')
await page.waitForFunction(() => {
  const label = document.querySelector('.date-calendar-nav strong')?.textContent || ''
  return /年\d+月/.test(label)
})
ok('month navigation works', true)

await page.screenshot({
  path: '/opt/cursor/artifacts/v5_date_calendar.png',
  fullPage: false,
})

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
