import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const SAMPLE = process.env.SAMPLE_VIDEO || '/tmp/video-pdf-test/sample.mp4'
const SAMPLE2 = process.env.SAMPLE_VIDEO_2 || SAMPLE
const OUT_DIR = '/opt/cursor/artifacts'
fs.mkdirSync(OUT_DIR, { recursive: true })

if (!fs.existsSync(SAMPLE)) {
  console.error(`Sample video missing: ${SAMPLE}`)
  process.exit(1)
}

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--window-size=1280,900',
    '--autoplay-policy=no-user-gesture-required',
  ],
  defaultViewport: { width: 1280, height: 900 },
})

const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })

const results = []
function ok(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

const brand = await page.$eval('.brand', (el) => el.textContent?.trim())
ok('brand visible', brand === 'コマPDF', brand)

const input = await page.$('.file-input')
ok('file input present', Boolean(input))

const files = SAMPLE2 !== SAMPLE && fs.existsSync(SAMPLE2) ? [SAMPLE, SAMPLE2] : [SAMPLE]
await input.uploadFile(...files)
await page.waitForFunction(() => document.querySelectorAll('.job').length >= 1, {
  timeout: 10_000,
})
const jobCount = await page.$$eval('.job', (els) => els.length)
ok('jobs enqueued', jobCount === files.length, `jobs=${jobCount}`)

const t0 = Date.now()
await page.click('.actions-bar .btn-primary')
await page.waitForFunction(
  () =>
    [...document.querySelectorAll('.job-badge')].some((el) => el.textContent?.includes('完了')),
  { timeout: 180_000 },
)
// Wait until busy ends / download enabled
await page.waitForFunction(
  () => {
    const btn = document.querySelector('.btn-download')
    return btn && !btn.disabled
  },
  { timeout: 180_000 },
)
const convertMs = Date.now() - t0
ok('conversion finished', convertMs < 120_000, `${convertMs}ms`)

const doneBadges = await page.$$eval('.job-badge', (els) =>
  els.filter((el) => el.textContent?.includes('完了')).length,
)
ok('all jobs done', doneBadges === files.length, `done=${doneBadges}`)

await page.screenshot({
  path: path.join(OUT_DIR, 'koma_pdf_batch_done.png'),
  fullPage: true,
})

await page.click('.btn-download')
// Give the browser a moment; ZIP/PDF download may be via blob
await new Promise((r) => setTimeout(r, 1000))
ok('download button clicked', true)

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
