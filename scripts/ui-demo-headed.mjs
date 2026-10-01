import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: false,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--window-size=1280,900',
    '--window-position=40,40',
    '--disable-session-crashed-bubble',
    '--disable-infobars',
  ],
  defaultViewport: { width: 1200, height: 800 },
})

const page = await browser.newPage()
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1500))

// Expand first member
await page.click('.member-row:first-child .member-main')
await page.waitForSelector('.member-row.open .schedule-track')
await new Promise((r) => setTimeout(r, 1200))

// Cycle status
await page.click('.member-row.open .schedule-block')
await new Promise((r) => setTimeout(r, 1000))

// Drag resize
const handle = await page.$('.member-row.open .schedule-handle.end')
const box = await handle.boundingBox()
const track = await page.$('.member-row.open .schedule-track')
const trackBox = await track.boundingBox()
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
await page.mouse.down()
await page.mouse.move(trackBox.x + trackBox.width * 0.9, box.y + box.height / 2, {
  steps: 18,
})
await page.mouse.up()
await new Promise((r) => setTimeout(r, 1200))

// Scroll to add form and add member
await page.evaluate(() => {
  document.querySelector('.add-member')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
})
await new Promise((r) => setTimeout(r, 800))
await page.click('#member-name', { clickCount: 3 })
await page.type('#member-name', 'デモ花子', { delay: 60 })
await new Promise((r) => setTimeout(r, 400))
await page.click('.add-form .primary-btn')
await page.waitForFunction(() =>
  [...document.querySelectorAll('.member-name')].some((el) =>
    el.textContent.includes('デモ花子'),
  ),
)
await new Promise((r) => setTimeout(r, 1000))

await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
await new Promise((r) => setTimeout(r, 1500))

await browser.close()
console.log('demo interactions complete')
