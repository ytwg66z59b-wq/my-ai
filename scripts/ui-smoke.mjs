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
ok('file selected', fileName.includes('sample.mp4'), fileName)

await page.waitForFunction(() => {
  const dd = document.querySelector('.stats dd')
  return dd && !dd.textContent.includes('—')
})

const frameCountText = await page.$$eval('.stats dd', (els) => els[2]?.textContent || '')
const expectedFrames = Number(frameCountText)
ok('estimated frames > 0', expectedFrames > 0, `frames=${expectedFrames}`)

await page.click('.file-meta .btn-primary')
await page.waitForFunction(
  () => document.querySelector('.status-text')?.textContent?.includes('PDF にまとめました'),
  { timeout: 60_000 },
)
const doneText = await page.$eval('.status-text', (el) => el.textContent || '')
ok('conversion done', doneText.includes(`${expectedFrames} 枚`), doneText)

const thumbs = await page.$$eval('.strip-item img', (els) => els.length)
ok('thumbnails match', thumbs === expectedFrames, `thumbs=${thumbs}`)

await page.screenshot({
  path: path.join(OUT_DIR, 'koma_pdf_after_convert.png'),
  fullPage: true,
})

// Trigger download and wait for PDF file
const before = new Set(fs.readdirSync(OUT_DIR))
await page.click('.btn-download')
let pdfPath = null
for (let i = 0; i < 40; i += 1) {
  await new Promise((r) => setTimeout(r, 250))
  const after = fs.readdirSync(OUT_DIR)
  const fresh = after.find((f) => f.endsWith('.pdf') && !before.has(f) && !f.endsWith('.crdownload'))
  if (fresh) {
    pdfPath = path.join(OUT_DIR, fresh)
    break
  }
}

ok('pdf downloaded', Boolean(pdfPath), pdfPath || 'missing')
if (pdfPath) {
  const size = fs.statSync(pdfPath).size
  ok('pdf non-empty', size > 1000, `bytes=${size}`)
  // Rename to a stable artifact name
  const stable = path.join(OUT_DIR, 'sample_0.3s.pdf')
  fs.copyFileSync(pdfPath, stable)
}

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
