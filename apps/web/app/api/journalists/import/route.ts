import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

const VALID_MEDIA_TYPES = ['TV', 'RADIO', 'PRINT', 'DIGITAL', 'PODCAST']
const REQUIRED_COLUMNS = ['name', 'email', 'outlet', 'mediaType']

interface CsvRow {
  name: string
  email: string
  outlet: string
  jobTitle?: string
  mediaType: string
  coverageArea?: string
  city?: string
  province?: string
  country?: string
  phone?: string
  isActive?: string
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))

  return lines.slice(1).map((line) => {
    // Suporte básico a valores com vírgulas dentro de aspas
    const values: string[] = []
    let inQuotes = false
    let current = ''
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    values.push(current.trim())

    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = values[i] ?? ''
    })
    return row as unknown as CsvRow
  })
}

// POST /api/journalists/import — importação CSV (admin only)
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    if (authUser.role !== 'ADMIN')
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'Ficheiro CSV obrigatório' }, { status: 400 })
    }

    const text = await (file as File).text()
    const rows = parseCsv(text)

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Ficheiro CSV vazio ou inválido' }, { status: 400 })
    }

    // Verificar colunas obrigatórias
    const firstRow = rows[0]
    for (const col of REQUIRED_COLUMNS) {
      if (!(col in firstRow)) {
        return NextResponse.json(
          { message: `Coluna obrigatória em falta: ${col}` },
          { status: 400 },
        )
      }
    }

    const errors: { row: number; message: string }[] = []
    const valid: typeof rows = []

    rows.forEach((row, idx) => {
      const rowNum = idx + 2 // linha 1 = header
      if (!row.name?.trim()) errors.push({ row: rowNum, message: 'Nome em falta' })
      else if (!row.email?.trim()) errors.push({ row: rowNum, message: 'Email em falta' })
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
        errors.push({ row: rowNum, message: `Email inválido: ${row.email}` })
      else if (!row.outlet?.trim()) errors.push({ row: rowNum, message: 'Veículo em falta' })
      else if (!VALID_MEDIA_TYPES.includes(row.mediaType?.toUpperCase()))
        errors.push({ row: rowNum, message: `Tipo de média inválido: ${row.mediaType}` })
      else valid.push(row)
    })

    if (errors.length > 0 && valid.length === 0) {
      return NextResponse.json(
        { message: 'Nenhuma linha válida encontrada', errors },
        { status: 422 },
      )
    }

    let created = 0
    let skipped = 0

    for (const row of valid) {
      const email = row.email.toLowerCase().trim()
      const existing = await prisma.journalist.findUnique({ where: { email } })
      if (existing) {
        skipped++
        continue
      }

      await prisma.journalist.create({
        data: {
          name: row.name.trim(),
          email,
          outlet: row.outlet.trim(),
          jobTitle: row.jobTitle?.trim() || null,
          mediaType: row.mediaType.toUpperCase() as
            | 'TV'
            | 'RADIO'
            | 'PRINT'
            | 'DIGITAL'
            | 'PODCAST',
          coverageArea: row.coverageArea
            ? row.coverageArea
                .split(';')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          city: row.city?.trim() || null,
          province: row.province?.trim() || null,
          country: row.country?.trim() || 'Angola',
          phone: row.phone?.trim() || null,
          isActive: row.isActive !== 'false',
        },
      })
      created++
    }

    return NextResponse.json({
      message: `Importação concluída: ${created} criados, ${skipped} ignorados (email já existente)`,
      created,
      skipped,
      errors,
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
