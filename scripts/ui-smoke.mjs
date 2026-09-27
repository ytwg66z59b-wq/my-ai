import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844'],
  defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
})

const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })

// Grant clipboard permission
const context = browser.defaultBrowserContext()
await context.overridePermissions('http://127.0.0.1:5173', ['clipboard-read', 'clipboard-write'])

const results = []

function ok(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

// Empty state
const empty = await page.$eval('.empty-state', (el) => el.textContent)
ok('empty state visible', empty.includes('きれいに分けてくれるよ'))

// Type text
const sample = 'これはテスト文章です長い文章を6文字ずつに分けてみようね'
await page.click('.text-input')
await page.type('.text-input', sample)
await page.waitForFunction(
  (n) => document.querySelector('.char-live')?.textContent?.includes(String(n)),
  {},
  28,
)
const countText = await page.$eval('.char-live', (el) => el.textContent)
ok('char counter', countText.includes('28'), countText)

// Click 6文字 preset
await page.click('button.btn-preset:nth-of-type(1)')
await page.waitForFunction(() => {
  const active = document.querySelector('.btn-preset.is-active')
  return active && active.textContent.includes('6文字')
})
ok('preset 6 active', true)

const lineCount = await page.$$eval('.result-item', (els) => els.length)
ok('split into lines (6 chars)', lineCount === Math.ceil(28 / 6), `lines=${lineCount}`)

const firstLine = await page.$eval('.result-item .result-text', (el) => el.textContent)
ok('first line is 6 chars', [...firstLine].length === 6, firstLine)

// Copy one line
await page.click('.result-item .btn-copy')
await page.waitForFunction(() =>
  document.querySelector('.result-item .btn-copy')?.textContent?.includes('コピーしたよ'),
)
ok('copy feedback', true)
const clip = await page.evaluate(() => navigator.clipboard.readText())
ok('clipboard has line', clip === firstLine, clip)

await page.waitForFunction(
  () => document.querySelector('.result-item .btn-copy')?.textContent?.includes('📋 コピー'),
  { timeout: 3000 },
)
ok('copy button resets', true)

// Copy all
await page.click('.btn-copy-all')
await page.waitForFunction(() =>
  document.querySelector('.btn-copy-all')?.textContent?.includes('ぜんぶコピーしたよ'),
)
ok('copy-all feedback', true)

// Clear
await page.click('.btn-clear')
await page.waitForSelector('.empty-state')
const cleared = await page.$eval('.text-input', (el) => el.value)
ok('clear works', cleared === '')

// Stepper
await page.type('.text-input', 'あいうえおかきくけこ')
await page.click('.btn-stepper[aria-label="1文字増やす"]')
await page.waitForFunction(() => {
  const v = document.querySelector('.number-input')?.value
  return v === '7'
})
ok('stepper +', true)

await page.click('button.btn-preset:nth-of-type(3)') // 10文字
await page.waitForFunction(() =>
  document.querySelector('.btn-preset.is-active')?.textContent?.includes('10文字'),
)
ok('preset 10', true)

await page.screenshot({ path: '/opt/cursor/artifacts/mobile_interaction_verified.png', fullPage: true })

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
