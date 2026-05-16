import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

const isConfigured =
  !!process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'SUBSTITUIR'

const s3 = isConfigured
  ? new S3Client({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null

const BUCKET = process.env.AWS_S3_BUCKET ?? ''
const BASE_URL = process.env.AWS_S3_BASE_URL ?? `https://${BUCKET}.s3.amazonaws.com`

function getPublicDir() {
  return process.cwd().endsWith(`${path.sep}apps${path.sep}web`)
    ? path.join(process.cwd(), 'public')
    : path.join(process.cwd(), 'apps', 'web', 'public')
}

function getExtension(originalFilename: string, mimeType: string) {
  const ext = originalFilename.split('.').pop()?.toLowerCase()
  if (ext && /^[a-z0-9]+$/.test(ext)) return ext

  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  if (mimeType === 'image/gif') return 'gif'

  return 'bin'
}

export async function uploadToS3(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder = 'uploads',
): Promise<{ url: string; key: string }> {
  const ext = getExtension(originalFilename, mimeType)
  const key = `${folder}/${randomUUID()}.${ext}`

  if (!s3 || !BUCKET) {
    const publicKey = `uploads/${key}`
    const publicPath = path.join(getPublicDir(), publicKey)
    await mkdir(path.dirname(publicPath), { recursive: true })
    await writeFile(publicPath, buffer)
    console.debug('[DEV] S3 não configurado — upload local:', publicKey)
    return { url: `/${publicKey}`, key: publicKey }
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  )

  return { url: `${BASE_URL}/${key}`, key }
}

export async function deleteFromS3(key: string): Promise<void> {
  if (!s3 || !BUCKET) {
    if (key.startsWith('uploads/')) {
      await unlink(path.join(getPublicDir(), key)).catch(() => {})
    }
    return
  }

  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}
