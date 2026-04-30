import 'tsconfig-paths/register'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import fastifyMultipart from '@fastify/multipart'
import { AppModule } from './app.module'
import { initSentry } from './sentry'

// Inicializar Sentry antes de tudo
initSentry()

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: process.env.NODE_ENV !== 'production' }),
  )

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3001)
  const clientUrl = configService.get<string>('CLIENT_URL', 'http://localhost:5173')
  const landingUrl = configService.get<string>('LANDING_URL', 'http://localhost:3002')

  // Upload de ficheiros (multipart)
  await app.register(fastifyMultipart, {
    limits: { fileSize: 20 * 1024 * 1024, files: 5 }, // 20MB por ficheiro, máx 5
  })

  // Prefixo global da API
  app.setGlobalPrefix('api')

  // Versionamento
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })

  // CORS
  app.enableCors({
    origin: [clientUrl, landingUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // Validação global com class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Swagger (apenas em desenvolvimento)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AngoPress API')
      .setDescription('Plataforma SaaS de Mailing de Imprensa')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document)
  }

  await app.listen(port, '0.0.0.0')
  console.log(`AngoPress API rodando em: http://localhost:${port}/api/v1`)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger disponível em: http://localhost:${port}/docs`)
  }
}

bootstrap()
