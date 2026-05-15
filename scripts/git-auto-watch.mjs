import { watch } from 'node:fs'
import { spawn } from 'node:child_process'

const DEBOUNCE_MS = Number(process.env.GIT_AUTO_DEBOUNCE_MS ?? 15000)
const IGNORED = [
  '/.git/',
  '/node_modules/',
  '/.next/',
  '/.turbo/',
  '/dist/',
  '/build/',
  '/coverage/',
]

let timer
let running = false
let pending = false

function shouldIgnore(path) {
  const normalized = `/${String(path ?? '').replaceAll('\\', '/')}`
  return IGNORED.some((entry) => normalized.includes(entry))
}

function schedule(path) {
  if (shouldIgnore(path)) return
  clearTimeout(timer)
  timer = setTimeout(runAutoCommit, DEBOUNCE_MS)
}

function runAutoCommit() {
  if (running) {
    pending = true
    return
  }

  running = true
  const child = spawn('npm', ['run', 'git:auto'], { stdio: 'inherit' })

  child.on('exit', () => {
    running = false
    if (pending) {
      pending = false
      schedule('pending')
    }
  })
}

console.log(`A observar alterações. Commit/push automático após ${DEBOUNCE_MS / 1000}s sem mudanças.`)
console.log('Pressiona Ctrl+C para parar.')

watch(process.cwd(), { recursive: true }, (_event, filename) => {
  schedule(filename)
})
