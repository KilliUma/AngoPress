import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

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

export async function uploadToS3(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder = 'uploads',
): Promise<{ url: string; key: string }> {
  const ext = originalFilename.split('.').pop()
  const key = `${folder}/${randomUUID()}.${ext}`

  if (!s3 || !BUCKET) {
    console.debug('[DEV] S3 não configurado — simulando upload:', key)
    return { url: `https://placehold.co/400x300`, key }
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
  if (!s3 || !BUCKET) return

  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}
