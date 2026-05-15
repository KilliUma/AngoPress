import { execFileSync } from 'node:child_process'

const DEFAULT_MESSAGE = `chore: auto update ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`

function git(args, options = {}) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function currentBranch() {
  return git(['rev-parse', '--abbrev-ref', 'HEAD'])
}

function hasChanges() {
  return git(['status', '--porcelain']).length > 0
}

function assertSafeStatus() {
  const status = git(['status', '--porcelain'])
  const unsafe = status
    .split('\n')
    .map((line) => line.slice(3).replace(/^"|"$/g, ''))
    .filter((file) => /^\.env($|\.)|\/\.env($|\.)/.test(file) && file !== '.env.example')

  if (unsafe.length > 0) {
    console.error('Commit bloqueado: ficheiros de ambiente detectados:')
    unsafe.forEach((file) => console.error(`- ${file}`))
    process.exit(1)
  }
}

function stagedChanges() {
  return git(['diff', '--cached', '--name-only']).length > 0
}

function main() {
  if (!hasChanges()) {
    console.log('Sem alterações para commit.')
    return
  }

  assertSafeStatus()

  git(
    [
      'add',
      '--all',
      '--',
      '.',
      ':(exclude)*.tsbuildinfo',
      ':(exclude)*.zip',
      ':(exclude)*.log',
      ':(exclude).DS_Store',
    ],
    { stdio: 'inherit' },
  )

  if (!stagedChanges()) {
    console.log('Sem alterações elegíveis para commit.')
    return
  }

  const message = process.argv.slice(2).join(' ').trim() || DEFAULT_MESSAGE
  git(['commit', '-m', message], { stdio: 'inherit' })

  const branch = currentBranch()
  if (!branch) {
    console.error('Commit criado, mas não consegui detectar a branch actual para push.')
    process.exit(1)
  }

  git(['push', '-u', 'origin', branch], { stdio: 'inherit' })
}

main()
