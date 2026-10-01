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

const results = []

function ok(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

const brand = await page.$eval('.brand', (el) => el.textContent.trim())
ok('brand visible', brand === 'いま振る', brand)

const tagline = await page.$eval('.tagline', (el) => el.textContent.trim())
ok('tagline', tagline.includes('誰に仕事を振る'), tagline)

const timeText = await page.$eval('.status-time time', (el) => el.textContent.trim())
ok('current time shown', /^\d{2}:\d{2}$/.test(timeText), timeText)

const counts = await page.$$eval('.status-counts .count strong', (els) =>
  els.map((el) => el.textContent.trim()),
)
ok('three status counts', counts.length === 3, counts.join(','))

const memberNames = await page.$$eval('.member-name', (els) =>
  els.map((el) => el.textContent.trim()),
)
ok('demo members loaded', memberNames.length >= 5, String(memberNames.length))

const labels = await page.$$eval('.member-ready', (els) =>
  els.map((el) => el.textContent.trim()),
)
ok(
  'ready labels present',
  labels.some((l) => l.includes('今すぐOK') || l.includes('対応可能')),
  labels.slice(0, 3).join(' | '),
)

const firstStatus = await page.$eval('.member-row', (el) =>
  [...el.classList].find((c) => c.startsWith('status-')),
)
ok('top member is immediate or soon', firstStatus === 'status-immediate' || firstStatus === 'status-soon', firstStatus)

await page.screenshot({
  path: '/opt/cursor/artifacts/shift_board_overview.png',
  fullPage: false,
})

// Expand first member and interact with schedule bar
await page.click('.member-row:first-child .member-main')
await page.waitForSelector('.member-row.open .schedule-track')
ok('schedule editor opens', true)

const blockBefore = await page.$eval(
  '.member-row.open .schedule-block',
  (el) => el.getAttribute('aria-label'),
)

await page.click('.member-row.open .schedule-block')
await page.waitForFunction(
  (prev) => {
    const el = document.querySelector('.member-row.open .schedule-block')
    return el && el.getAttribute('aria-label') !== prev
  },
  {},
  blockBefore,
)
const blockAfter = await page.$eval(
  '.member-row.open .schedule-block',
  (el) => el.getAttribute('aria-label'),
)
ok('tap cycles status', blockBefore !== blockAfter, `${blockBefore} → ${blockAfter}`)

// Drag end handle to resize
const handle = await page.$('.member-row.open .schedule-handle.end')
const box = await handle.boundingBox()
const track = await page.$('.member-row.open .schedule-track')
const trackBox = await track.boundingBox()
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await page.mouse.down()
await page.mouse.move(trackBox.x + trackBox.width * 0.85, box.y + box.height / 2, {
  steps: 12,
})
await page.mouse.up()
await new Promise((r) => setTimeout(r, 200))
const blockResized = await page.$eval(
  '.member-row.open .schedule-block',
  (el) => el.getAttribute('aria-label'),
)
ok('drag resizes block', blockResized !== blockAfter, blockResized)

await page.screenshot({
  path: '/opt/cursor/artifacts/shift_board_editor_open.png',
  fullPage: false,
})

// Add member
await page.type('#member-name', '検証太郎')
await page.click('.add-form .primary-btn')
await page.waitForFunction(() =>
  [...document.querySelectorAll('.member-name')].some((el) =>
    el.textContent.includes('検証太郎'),
  ),
)
ok('add member', true)

await page.screenshot({
  path: '/opt/cursor/artifacts/shift_board_member_added.png',
  fullPage: true,
})

// Mobile viewport
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await page.reload({ waitUntil: 'networkidle0' })
const mobileBrand = await page.$eval('.brand', (el) => el.textContent.trim())
ok('mobile brand', mobileBrand === 'いま振る')
await page.screenshot({
  path: '/opt/cursor/artifacts/shift_board_mobile.png',
  fullPage: false,
})

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
