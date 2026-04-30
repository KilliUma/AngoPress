import 'tsconfig-paths/register'
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import * as express from 'express'
import { AppModule } from '../src/app.module'
import { initSentry } from '../src/sentry'

initSentry()

const server = express()
let nestApp: ReturnType<typeof NestFactory.create> extends Promise<infer T> ? T : never

async function bootstrap() {
  if (nestApp) return server

  nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: false,
  })

  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'
  const landingUrl = process.env.LANDING_URL ?? 'http://localhost:3002'

  nestApp.setGlobalPrefix('api')
  nestApp.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
  nestApp.enableCors({
    origin: [clientUrl, landingUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  await nestApp.init()
  return server
}

export default async (req: express.Request, res: express.Response) => {
  const app = await bootstrap()
  app(req, res)
}
