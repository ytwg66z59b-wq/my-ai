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

ok(
  'admin brand',
  (await page.$eval('.brand', (el) => el.textContent.trim())) === 'いま振る',
)

await page.click('.app-tabs button:nth-child(2)')
await page.waitForSelector('.mode-grid')
await page.click('.mode-btn.timed')
await page.waitForSelector('.howto-card')
ok('howto guide visible', true)

const guideText = await page.$eval('.howto-steps', (el) => el.textContent || '')
ok('howto explains edit', guideText.includes('時間を直す') && guideText.includes('ずらす'))

await page.click('.primary-btn.full')
await page.waitForSelector('.block-card')
const timeText = await page.$eval('.block-times', (el) => el.textContent || '')
ok('large time on card', /\d{2}:\d{2}/.test(timeText), timeText)

await page.click('.block-card-main')
await page.waitForSelector('.block-card-editor')
ok('card editor opens', true)

const before = await page.$eval(
  '.stepper-controls strong',
  (el) => el.textContent.trim(),
)
await page.click('.stepper-controls button:nth-child(3)')
await page.waitForFunction(
  (prev) => {
    const el = document.querySelector('.stepper-controls strong')
    return el && el.textContent.trim() !== prev
  },
  {},
  before,
)
ok('stepper changes time', true)

ok(
  'bar has no clutter time labels',
  (await page.$$('.handle-time')).length === 0 &&
    (await page.$$('.timeline-block-label strong')).length === 0,
)

await page.screenshot({
  path: '/opt/cursor/artifacts/v3_clear_times_editor.png',
  fullPage: false,
})

await page.click('.app-tabs button:nth-child(1)')
await page.waitForSelector('.admin-board')
await page.screenshot({
  path: '/opt/cursor/artifacts/v3_admin_after_edit.png',
  fullPage: false,
})

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
