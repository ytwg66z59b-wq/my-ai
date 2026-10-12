#!/usr/bin/env node
/**
 * Deploy DRAGON DAYS to gh-pages under /dragon-days/ without wiping
 * other tools (コマPDF at /, /bunsho/, /shift/, …).
 *
 * Usage: npm run build && node scripts/deploy-pages.mjs
 */
import { execSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DIST = join(ROOT, 'dist')
const REPO = 'https://github.com/ytwg66z59b-wq/my-ai.git'
const APP_DIR = 'dragon-days'
/** Last known good multi-app Pages snapshot (コマPDF + bunsho + shift) */
const BASELINE = '5034ab50d58763840501b00b77b2f1b092575581'

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/ missing. Run npm run build first.')
  process.exit(1)
}

const work = mkdtempSync(join(tmpdir(), 'dragon-days-pages-'))
console.log('worktree:', work)

try {
  execSync(`git fetch origin ${BASELINE}`, { cwd: ROOT, stdio: 'inherit' })
  execSync(`git archive ${BASELINE} | tar -x -C "${work}"`, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: '/bin/bash',
  })

  const target = join(work, APP_DIR)
  rmSync(target, { recursive: true, force: true })
  mkdirSync(target, { recursive: true })
  cpSync(DIST, target, { recursive: true })
  writeFileSync(join(work, '.nojekyll'), '')

  execSync('git init', { cwd: work, stdio: 'inherit' })
  execSync('git checkout -b gh-pages', { cwd: work, stdio: 'inherit' })
  execSync('git add -A', { cwd: work, stdio: 'inherit' })
  const name = execSync('git config user.name', { cwd: ROOT }).toString().trim()
  const email = execSync('git config user.email', { cwd: ROOT }).toString().trim()
  execSync(`git -c user.name="${name}" -c user.email="${email}" commit -m "deploy: DRAGON DAYS under /${APP_DIR}/ (keep コマPDF at root)"`, {
    cwd: work,
    stdio: 'inherit',
  })
  execSync(`git push -f ${REPO} gh-pages:gh-pages`, {
    cwd: work,
    stdio: 'inherit',
  })

  console.log(`\nPublished: https://ytwg66z59b-wq.github.io/my-ai/${APP_DIR}/`)
  console.log('コマPDF remains: https://ytwg66z59b-wq.github.io/my-ai/')
} finally {
  rmSync(work, { recursive: true, force: true })
}
