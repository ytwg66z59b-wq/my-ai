import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844'],
  defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
})

const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })

const results = []

function ok(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

// Dismiss quote modal if present
const quoteClose = await page.$('.quote-close')
if (quoteClose) {
  await quoteClose.click()
  await page.waitForSelector('.effort-btn', { timeout: 5000 })
}
ok('home brand visible', Boolean(await page.$('.brand-mark')))

const before = await page.$eval('.stat-num', (el) => Number(el.textContent))
await page.click('.effort-btn')
await page.waitForFunction(
  (n) => Number(document.querySelector('.stat-num')?.textContent) === n + 1,
  {},
  before,
)
const after = await page.$eval('.stat-num', (el) => Number(el.textContent))
ok('effort button increments today count', after === before + 1, `${before} -> ${after}`)

// Navigate nursery
await page.click('.nav-item:nth-child(2)')
await page.waitForSelector('.nursery-screen')
ok('nursery screen', Boolean(await page.$('.nursery-screen')))

await page.click('.nav-item:nth-child(3)')
await page.waitForSelector('.ency-screen')
ok('encyclopedia screen', Boolean(await page.$('.ency-screen')))

await page.click('.nav-item:nth-child(4)')
await page.waitForSelector('.cal-screen')
ok('calendar screen', Boolean(await page.$('.cal-screen')))

await page.click('.nav-item:nth-child(5)')
await page.waitForSelector('.backup-screen')
ok('backup screen', Boolean(await page.$('.backup-screen')))

const failed = results.filter((r) => !r.pass)
await browser.close()
if (failed.length) {
  console.error(`\n${failed.length} failed`)
  process.exit(1)
}
console.log(`\nAll ${results.length} checks passed`)
