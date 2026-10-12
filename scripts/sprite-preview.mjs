import puppeteer from 'puppeteer-core'
import { writeFileSync, mkdirSync } from 'node:fs'

const OUT = '/opt/cursor/artifacts'
mkdirSync(OUT, { recursive: true })

const forms = [
  { id: 'egg_c', formId: 'egg_light', name: '光の卵', stage: 'egg', element: 'light', colorId: 'pearl_gold', rarity: 'normal', speciesLineId: 'line_light' },
  { id: 'juv_c', formId: 'lumina_juvenile', name: 'ルミナ', stage: 'juvenile', element: 'light', colorId: 'pearl_gold', rarity: 'normal', speciesLineId: 'line_light' },
  { id: 'gr_c', formId: 'lumina_growth_radiant', name: 'ルミナ・輝', stage: 'growth', element: 'light', colorId: 'pearl_gold', rarity: 'rare', speciesLineId: 'line_light' },
  { id: 'ad_c', formId: 'dragon_light', name: '光の龍', stage: 'adult', element: 'light', colorId: 'pearl_gold', rarity: 'epic', speciesLineId: 'line_light' },
  { id: 'ap_c', formId: 'apex_holy_light', name: '聖光の上位龍', stage: 'apex', element: 'light', colorId: 'pearl_gold', rarity: 'legend', speciesLineId: 'line_light' },
  { id: 'star_c', formId: 'dragon_star', name: '星空の龍', stage: 'adult', element: 'star', colorId: 'deep_indigo', rarity: 'epic', speciesLineId: 'line_light' },
  { id: 'tide_c', formId: 'dragon_tide', name: '潮の龍', stage: 'adult', element: 'water', colorId: 'sky_aqua', rarity: 'epic', speciesLineId: 'line_aqua' },
  { id: 'gal_c', formId: 'apex_galaxy', name: '銀河の上位龍', stage: 'apex', element: 'star', colorId: 'deep_indigo', rarity: 'mythic', speciesLineId: 'line_light' },
]

function creature(base) {
  return {
    ...base,
    growthPoints: 10,
    evolutionThreshold: 30,
    failCount: 0,
    evolutionHistory: [],
    discoveredAt: new Date().toISOString(),
  }
}

const state = {
  version: 1,
  dailyRecords: { '2026-10-12': 5 },
  statistics: { totalCount: 5, maxDailyCount: 5 },
  creatures: forms.map(creature),
  encyclopedia: {
    discoveredKeys: forms
      .filter((f) => f.stage !== 'egg')
      .map((f) => `${f.formId}::${f.colorId}`),
  },
  quotes: { recentQuoteIds: [] },
  settings: {
    activeCreatureId: 'juv_c',
    lastDisplayedDate: '2026-10-12',
    timezone: 'Asia/Tokyo',
    eggMilestonesGranted: [0],
  },
}

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=420,900'],
  defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
})

const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/my-ai/dragon-days/', {
  waitUntil: 'networkidle0',
}).catch(async () => {
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
})

// Seed IndexedDB
await page.evaluate(async (appState) => {
  await new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase('dragon-days')
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    req.onblocked = () => resolve()
  })
  await new Promise((resolve, reject) => {
    const open = indexedDB.open('dragon-days', 1)
    open.onupgradeneeded = () => open.result.createObjectStore('app')
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result
      const tx = db.transaction('app', 'readwrite')
      tx.objectStore('app').put(appState, 'state')
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => reject(tx.error)
    }
  })
}, state)

await page.reload({ waitUntil: 'networkidle0' })
const quote = await page.$('.quote-close')
if (quote) await quote.click()

const shots = []
for (const f of forms) {
  await page.evaluate((id) => {
    // Click via nursery by rewriting active in IDB is heavy; use DOM select after navigating
    window.__previewId = id
  }, f.id)

  // Open nursery and select creature
  await page.click('.nav-item:nth-child(2)')
  await page.waitForSelector('.nursery-screen')
  // Find the row with the name and click 育成する / or open and select
  const clicked = await page.evaluate((name) => {
    const rows = [...document.querySelectorAll('.creature-row')]
    const row = rows.find((r) => r.textContent?.includes(name))
    if (!row) return false
    const btn = [...row.querySelectorAll('button')].find((b) =>
      (b.textContent || '').includes('育成'),
    )
    if (btn && !btn.disabled) btn.click()
    else row.querySelector('.row-main')?.click()
    return true
  }, f.name)

  if (!clicked) continue
  // If detail opened, select
  const selectBtn = await page.$('.detail-select')
  if (selectBtn) {
    await selectBtn.click()
    await page.waitForSelector('.home-screen')
  } else {
    await page.click('.nav-item:nth-child(1)')
    await page.waitForSelector('.home-screen')
  }

  await page.waitForSelector('.creature-sprite')
  await new Promise((r) => setTimeout(r, 250))
  const path = `${OUT}/sprite-${f.stage}-${f.formId}.webp`
  await page.screenshot({ path, type: 'webp' })
  shots.push(path)
  console.log('shot', f.formId, path)
}

// Encyclopedia overview
await page.click('.nav-item:nth-child(3)')
await page.waitForSelector('.ency-screen')
await new Promise((r) => setTimeout(r, 300))
const encyPath = `${OUT}/sprite-encyclopedia.webp`
await page.screenshot({ path: encyPath, type: 'webp' })
shots.push(encyPath)

writeFileSync(`${OUT}/sprite-preview-list.txt`, shots.join('\n'))
await browser.close()
console.log('done', shots.length)
