import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/health — público
export async function GET() {
  const start = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start

    return NextResponse.json(
      {
        status: 'ok',
        db: 'connected',
        latencyMs: latency,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json(
      {
        status: 'degraded',
        db: 'disconnected',
        error: err instanceof Error ? err.message : 'unknown',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
