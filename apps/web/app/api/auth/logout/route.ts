import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (user) {
      await prisma.refreshToken.updateMany({
        where: { userId: user.sub, revoked: false },
        data: { revoked: true },
      })
    }

    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    const clearCookies = [
      `access_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`,
      `refresh_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`,
    ]

    const response = new NextResponse(null, { status: 204 })
    clearCookies.forEach((c) => response.headers.append('Set-Cookie', c))
    return response
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}
