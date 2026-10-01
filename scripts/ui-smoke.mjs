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
await page.evaluate(() => {
  localStorage.clear()
})
await page.reload({ waitUntil: 'networkidle0' })

const results = []
function ok(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

ok(
  'auth gate shown',
  (await page.$eval('.auth-gate .tagline', (el) => el.textContent.trim())).includes(
    '自分の名前で始める',
  ),
)

await page.type('#account-name', '検証太郎')
await page.click('.auth-form .primary-btn')
await page.waitForSelector('.session-bar')
ok(
  'logged in as self',
  (await page.$eval('.session-bar', (el) => el.textContent || '')).includes('検証太郎'),
)

ok('no member dropdown', (await page.$$('select')).length === 0)

await page.click('.mode-btn.timed')
await page.waitForSelector('.howto-card')
await page.click('.primary-btn.full')
await page.waitForSelector('.block-card')
ok('can edit own shift', true)

await page.click('.app-tabs button:nth-child(1)')
await page.waitForSelector('.admin-board')
const names = await page.$$eval('.member-name', (els) =>
  els.map((el) => el.textContent.trim()),
)
ok('admin shows only real accounts', names.length === 1 && names[0] === '検証太郎', names.join(','))

await page.click('.session-bar .ghost-btn')
await page.waitForSelector('.auth-gate')
await page.type('#account-name', '検証花子')
await page.click('.auth-form .primary-btn')
await page.waitForSelector('.session-bar')
ok(
  'second account',
  (await page.$eval('.session-bar strong', (el) => el.textContent.trim())) === '検証花子',
)

await page.click('.app-tabs button:nth-child(1)')
await page.waitForSelector('.member-name')
const both = await page.$$eval('.member-name', (els) =>
  els.map((el) => el.textContent.trim()),
)
ok('admin sees both members', both.includes('検証太郎') && both.includes('検証花子'), both.join(','))

// Ensure shift tab is only for current user
await page.click('.app-tabs button:nth-child(2)')
await page.waitForSelector('.member-editor-screen h2')
const title = await page.$eval('.member-editor-screen h2', (el) => el.textContent.trim())
ok('editor locked to self', title.includes('検証花子') && !title.includes('検証太郎'), title)

await page.screenshot({
  path: '/opt/cursor/artifacts/v4_account_own_shift.png',
  fullPage: false,
})

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
