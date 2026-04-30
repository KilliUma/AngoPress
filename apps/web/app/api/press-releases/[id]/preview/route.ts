import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
    const { id } = await params

    const pr = await prisma.pressRelease.findUnique({ where: { id } })
    if (!pr) return NextResponse.json({ message: 'Press release não encontrado' }, { status: 404 })
    if (pr.userId !== authUser.sub && authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Sem permissão' }, { status: 403 })
    }

    const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pr.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.75; }
    h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
    .summary { font-size: 1.1rem; color: #555; border-left: 4px solid #c00; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; }
    .meta { font-size: 0.85rem; color: #888; margin-bottom: 2rem; }
    .content { font-size: 1rem; }
    .content p { margin: 0 0 1rem; }
    .content h2 { font-size: 1.4rem; margin: 2rem 0 0.5rem; }
    .content h3 { font-size: 1.2rem; margin: 1.5rem 0 0.5rem; }
    .content ul, .content ol { padding-left: 1.5rem; margin: 0 0 1rem; }
    .content blockquote { border-left: 3px solid #ddd; padding-left: 1rem; color: #666; margin: 1rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.8rem; color: #aaa; }
  </style>
</head>
<body>
  <h1>${pr.title}</h1>
  ${pr.summary ? `<div class="summary">${pr.summary}</div>` : ''}
  <div class="meta">Publicado por AngoPress · ${new Date().toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
  <div class="content">${pr.content}</div>
  <div class="footer">Comunicado distribuído via AngoPress — Plataforma Digital de Mailing de Imprensa</div>
</body>
</html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
