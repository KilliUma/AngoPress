import { execFileSync, execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const WEB_DIR = resolve(ROOT, 'apps', 'web')

const DEFAULT_MESSAGE = `chore: auto update ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`

function git(args, options = {}) {
  const output = execFileSync('git', args, {
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  })

  return typeof output === 'string' ? output.trim() : ''
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

function unstageIgnoredGeneratedFiles() {
  const staged = git(['diff', '--cached', '--name-only'])
    .split('\n')
    .filter(Boolean)

  const ignored = staged.filter(
    (file) =>
      file.endsWith('.tsbuildinfo') ||
      file.endsWith('.zip') ||
      file.endsWith('.log') ||
      file.endsWith('.DS_Store') ||
      file === '.DS_Store',
  )

  if (ignored.length > 0) {
    git(['reset', '-q', 'HEAD', '--', ...ignored], { stdio: 'inherit' })
  }
}

function main() {
  if (!hasChanges()) {
    console.log('Sem alterações para commit.')
    return
  }

  assertSafeStatus()

  git(['add', '--all', '--', '.'], { stdio: 'inherit' })
  unstageIgnoredGeneratedFiles()

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

  applyProductionMigrations()
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {}
  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split('\n')
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const idx = line.indexOf('=')
        const key = line.slice(0, idx).trim()
        const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
        return [key, val]
      }),
  )
}

function applyProductionMigrations() {
  const envProdPath = resolve(WEB_DIR, '.env.prod')
  const env = loadEnvFile(envProdPath)
  const dbUrl = env.DATABASE_URL_UNPOOLED ?? env.DATABASE_URL

  if (!dbUrl) {
    console.log('\n⚠️  Migrações de produção: ficheiro .env.prod não encontrado.')
    console.log('   Corre: cd apps/web && vercel env pull .env.prod --environment production')
    console.log('   A Vercel aplicará as migrações automaticamente no próximo deploy.\n')
    return
  }

  console.log('\n🔄 A verificar migrações pendentes na DB de produção...')

  try {
    const statusOutput = execSync(
      `node_modules/.bin/prisma migrate status --schema=apps/web/prisma/schema.prisma`,
      { cwd: ROOT, env: { ...process.env, DATABASE_URL: dbUrl }, encoding: 'utf8', stdio: 'pipe' },
    )

    if (!statusOutput.includes('Following migration') && !statusOutput.includes('not yet been applied')) {
      console.log('✅ DB de produção está actualizada — sem migrações pendentes.\n')
      return
    }

    console.log('⚙️  A aplicar migrações na DB de produção...')
    execSync(
      `node_modules/.bin/prisma migrate deploy --schema=apps/web/prisma/schema.prisma`,
      { cwd: ROOT, env: { ...process.env, DATABASE_URL: dbUrl }, stdio: 'inherit' },
    )
    console.log('✅ Migrações aplicadas com sucesso na DB de produção.\n')
  } catch (err) {
    console.error('❌ Erro ao aplicar migrações de produção:', err.message)
    console.log('   Aplica manualmente: cd apps/web && DATABASE_URL=<prod_url> npx prisma migrate deploy\n')
  }
}

main()
