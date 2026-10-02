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
await new Promise((r) => setTimeout(r, 1000))

await page.click('.range-tabs button:nth-child(2)')
await new Promise((r) => setTimeout(r, 900))
await page.click('.range-tabs button:nth-child(3)')
await new Promise((r) => setTimeout(r, 900))
await page.click('.range-tabs button:nth-child(1)')
await new Promise((r) => setTimeout(r, 700))

await page.click('.app-tabs button:nth-child(2)')
await page.waitForSelector('.mode-grid')
await new Promise((r) => setTimeout(r, 700))
await page.click('.mode-btn.timed')
await page.waitForSelector('.timeline.editable')
await new Promise((r) => setTimeout(r, 700))

const handle = await page.$('.timeline-handle.end')
if (handle) {
  const box = await handle.boundingBox()
  const trackBox = await (await page.$('.timeline-track')).boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(trackBox.x + trackBox.width * 0.82, box.y + box.height / 2, {
    steps: 16,
  })
  await page.mouse.up()
}
await new Promise((r) => setTimeout(r, 800))

const block = await page.$('.timeline-block')
if (block) {
  const b = await block.boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2, { clickCount: 2 })
  await new Promise((r) => setTimeout(r, 1400))
}

await page.mouse.click(30, 120)
await new Promise((r) => setTimeout(r, 500))
await page.click('.app-tabs button:nth-child(1)')
await new Promise((r) => setTimeout(r, 1200))
await browser.close()
console.log('demo complete')
