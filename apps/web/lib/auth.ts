import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-min-64-chars-xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-min-64-chars-xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
)

export interface JwtPayload {
  sub: string
  email: string
  role: string
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .setIssuedAt()
    .sign(JWT_SECRET)
}

export async function signRefreshToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_REFRESH_SECRET)
}

export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

export async function getAuthUser(request: Request): Promise<JwtPayload | null> {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(/(?:^|;\s*)access_token=([^;]+)/)
  if (!match) return null
  return verifyAccessToken(decodeURIComponent(match[1]))
}

export function buildAuthCookies(accessToken: string, refreshToken: string): string[] {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return [
    `access_token=${accessToken}; HttpOnly; Path=/; SameSite=Strict; Max-Age=900${secure}`,
    `refresh_token=${refreshToken}; HttpOnly; Path=/; SameSite=Strict; Max-Age=604800${secure}`,
  ]
}

export function buildClearCookies(): string[] {
  return [
    'access_token=; HttpOnly; Path=/; Max-Age=0',
    'refresh_token=; HttpOnly; Path=/; Max-Age=0',
  ]
}

export function getRefreshTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(/(?:^|;\s*)refresh_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}
