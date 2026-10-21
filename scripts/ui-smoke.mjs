import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--window-size=1280,900',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
  ],
  defaultViewport: { width: 1280, height: 900 },
})

const page = await browser.newPage()
const context = browser.defaultBrowserContext()
await context.overridePermissions('http://127.0.0.1:5173', ['microphone'])

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })

const results = []

function ok(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`)
}

const brand = await page.$eval('.brand-hero', (el) => el.textContent?.trim())
ok('hero brand is Halo', brand === 'Halo', brand)

const studioLink = await page.$('a[href="#studio"]')
ok('studio CTA exists', Boolean(studioLink))

await page.click('a.btn-primary[href="#studio"]')
await page.waitForSelector('#studio')

await page.click('[data-testid="inject-demo"]')
await page.waitForFunction(
  () => document.querySelectorAll('[data-testid="transcript"] li').length >= 3,
)

const summary = await page.$eval('[data-testid="notes-summary"]', (el) => el.textContent || '')
ok('notes summary generated', summary.includes('会議のポイント'), summary)

const actions = await page.$$eval('[data-testid="action-items"] li', (els) =>
  els.map((el) => el.textContent || ''),
)
ok('action items extracted', actions.length >= 1, actions.join(' | '))

await page.click('[data-testid="start-meeting"]')
await page.waitForFunction(() => {
  const status = document.querySelector('.studio-status')?.textContent || ''
  return status.includes('マイク稼働中') || status.includes('聞き取り中')
})
ok('meeting start updates status', true)

const ncOn = await page.$eval('[data-testid="toggle-nc"]', (el) => el.classList.contains('is-on'))
ok('NC defaults on', ncOn)

await page.click('[data-testid="toggle-nc"]')
await page.waitForFunction(() => {
  const btn = document.querySelector('[data-testid="toggle-nc"]')
  return btn && !btn.classList.contains('is-on') && btn.textContent?.includes('OFF')
})
ok('NC toggles off', true)

await page.screenshot({ path: '/opt/cursor/artifacts/halo_studio_desktop.png', fullPage: true })

await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await page.screenshot({ path: '/opt/cursor/artifacts/halo_studio_mobile.png', fullPage: true })

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
await browser.close()
process.exit(failed.length ? 1 : 0)
