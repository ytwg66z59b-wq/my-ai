import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const SAMPLE = process.env.SAMPLE_VIDEO || '/tmp/video-pdf-test/sample.mp4'
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
    '--use-fake-ui-for-media-stream',
  ],
  defaultViewport: { width: 1280, height: 900 },
})

const page = await browser.newPage()
const client = await page.createCDPSession()
await client.send('Page.setDownloadBehavior', {
  behavior: 'allow',
  downloadPath: OUT_DIR,
})

const results = []
function ok(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })

const brand = await page.$eval('.brand', (el) => el.textContent?.trim())
ok('brand visible', brand === 'コマPDF', brand)

const input = await page.$('.file-input')
ok('file input present', Boolean(input))

await input.uploadFile(SAMPLE)
await page.waitForFunction(() => document.querySelector('.file-name'))
const fileName = await page.$eval('.file-name', (el) => el.textContent || '')
const sampleBase = path.basename(SAMPLE)
ok('file selected', fileName.includes(sampleBase), fileName)

await page.waitForFunction(() => {
  const dd = document.querySelector('.stats dd')
  return dd && !dd.textContent.includes('—')
})

const frameCountText = await page.$$eval('.stats dd', (els) => els[2]?.textContent || '')
const expectedFrames = Number(frameCountText)
ok('estimated frames > 0', expectedFrames > 0, `frames=${expectedFrames}`)

const t0 = Date.now()
await page.click('.file-meta .btn-primary')
await page.waitForFunction(
  () => document.querySelector('.status-text')?.textContent?.includes('PDF にまとめました'),
  { timeout: 120_000 },
)
const convertMs = Date.now() - t0
ok(
  'conversion under 30s',
  convertMs < 30_000,
  `${convertMs}ms for ${expectedFrames} frames`,
)
const doneText = await page.$eval('.status-text', (el) => el.textContent || '')
ok('conversion done', doneText.includes(`${expectedFrames} 枚`), doneText)

const thumbs = await page.$$eval('.strip-item img', (els) => els.length)
ok(
  'thumbnails present',
  thumbs > 0 && thumbs === Math.min(expectedFrames, 48),
  `thumbs=${thumbs}`,
)

const elapsed = await page.evaluate(async () => {
  // Conversion already finished; surface timing from performance marks if any.
  return performance.now()
})
ok('page still responsive after convert', Number.isFinite(elapsed), String(elapsed))

await page.screenshot({
  path: path.join(OUT_DIR, 'koma_pdf_after_convert.png'),
  fullPage: true,
})

const pdfB64 = await page.evaluate(async () => {
  const blob = /** @type {{ __komaPdfBlob?: Blob }} */ (window).__komaPdfBlob
  if (!blob) return null
  const buf = await blob.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
})

const stable = path.join(OUT_DIR, 'sample_0.3s.pdf')
if (pdfB64) {
  fs.writeFileSync(stable, Buffer.from(pdfB64, 'base64'))
}
ok('pdf exported', Boolean(pdfB64), stable)
if (pdfB64) {
  const size = fs.statSync(stable).size
  ok('pdf non-empty', size > 1000, `bytes=${size}`)
}

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
