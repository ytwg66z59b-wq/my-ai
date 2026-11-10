import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844'],
  defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
})

const page = await browser.newPage()
const base = process.env.APP_URL ?? 'http://127.0.0.1:5173/'
await page.goto(base, { waitUntil: 'networkidle0' })

const results = []

function ok(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

const brand = await page.$eval('.brand-mark', (el) => el.textContent)
ok('brand visible', brand.includes('心の社'), brand)

const idle = await page.$eval('.idle-lead', (el) => el.textContent)
ok('idle prompt visible', idle.includes('清らかな言葉'), idle)

await page.click('.shrine')
await page.waitForSelector('.impact-word', { timeout: 2000 })
const impact = await page.$eval('.impact-word', (el) => el.textContent)
ok('impact flash shows ドン！', impact.includes('ドン'), impact)

await page.waitForSelector('.word-title', { timeout: 3000 })
const title = await page.$eval('.word-title', (el) => el.textContent?.trim() || '')
const body = await page.$eval('.word-body', (el) => el.textContent?.trim() || '')
ok('word title appears', title.length > 0, title)
ok('word body appears', body.length > 0, body)

const count = await page.$eval('.count', (el) => el.textContent)
ok('progress count shows 1/7', count.includes('1') && count.includes('7'), count)

await page.click('.shrine')
await page.waitForFunction(
  () => document.querySelector('.count')?.textContent?.includes('2'),
  { timeout: 3000 },
)
const count2 = await page.$eval('.count', (el) => el.textContent)
ok('second tap advances', count2.includes('2'), count2)

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
