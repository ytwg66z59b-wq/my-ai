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

const brand = await page.$eval('.brand', (el) => el.textContent.trim())
ok('admin brand', brand === 'いま振る', brand)

ok(
  'admin tabs',
  (await page.$eval('.app-tabs button.active', (el) => el.textContent.trim())) ===
    '管理画面',
)

const counts = await page.$$eval('.status-counts .count strong', (els) =>
  els.map((el) => el.textContent.trim()),
)
ok('status counts', counts.length === 3, counts.join(','))

ok('day timelines', (await page.$$('.timeline-track')).length >= 1)

await page.click('.app-tabs button:nth-child(2)')
await page.waitForSelector('.mode-grid')
ok('member editor opens', true)

await page.click('.mode-btn.timed')
await page.waitForSelector('.timeline.editable')

const before = await page.$$eval('.timeline-block', (els) => els.length)
await page.click('.primary-btn.full')
await page.waitForFunction(
  (n) => document.querySelectorAll('.timeline-block').length > n,
  {},
  before,
)
ok('add availability block', true)

// Move first block via handle end resize
const handle = await page.$('.timeline-handle.end')
if (handle) {
  const box = await handle.boundingBox()
  const track = await page.$('.timeline-track')
  const trackBox = await track.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(trackBox.x + trackBox.width * 0.8, box.y + box.height / 2, {
    steps: 10,
  })
  await page.mouse.up()
  ok('resize drag', true)
} else {
  ok('resize drag', false, 'no handle')
}

await page.screenshot({
  path: '/opt/cursor/artifacts/v2_member_editor.png',
  fullPage: false,
})

await page.click('.app-tabs button:nth-child(1)')
await page.waitForSelector('.admin-board')
await page.click('.range-tabs button:nth-child(2)')
await page.waitForSelector('.week-grid')
ok('week view', true)
await page.screenshot({
  path: '/opt/cursor/artifacts/v2_admin_week.png',
  fullPage: false,
})

await page.click('.range-tabs button:nth-child(3)')
await page.waitForSelector('.month-list')
ok('month view', true)
await page.click('.range-tabs button:nth-child(1)')
await page.screenshot({
  path: '/opt/cursor/artifacts/v2_admin_day.png',
  fullPage: false,
})

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
