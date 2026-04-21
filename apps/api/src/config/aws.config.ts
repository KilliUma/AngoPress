import { registerAs } from '@nestjs/config'

export default registerAs('aws', () => ({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sesFromEmail: process.env.AWS_SES_FROM_EMAIL,
  sesFromName: process.env.AWS_SES_FROM_NAME || 'AngoPress',
  snsTopicArn: process.env.AWS_SNS_TOPIC_ARN,
  s3Bucket: process.env.AWS_S3_BUCKET,
  s3BaseUrl: process.env.AWS_S3_BASE_URL,
}))
