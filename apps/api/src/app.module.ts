import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from '@/prisma/prisma.module'
import { AuthModule } from '@/auth/auth.module'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'
import { UsersModule } from '@/users/users.module'
import { JournalistsModule } from '@/journalists/journalists.module'
import { PressReleasesModule } from '@/press-releases/press-releases.module'
import { CampaignsModule } from '@/campaigns/campaigns.module'
import { DispatchModule } from '@/dispatch/dispatch.module'
import { AnalyticsModule } from '@/analytics/analytics.module'
import { MailingListsModule } from '@/mailing-lists/mailing-lists.module'
import { SubscriptionsModule } from '@/subscriptions/subscriptions.module'
import { AdminModule } from '@/admin/admin.module'
import { UploadsModule } from '@/uploads/uploads.module'
import { WebhooksModule } from '@/webhooks/webhooks.module'
import { HealthModule } from '@/health/health.module'
import appConfig from '@/config/app.config'
import databaseConfig from '@/config/database.config'
import jwtConfig from '@/config/jwt.config'
import awsConfig from '@/config/aws.config'
import redisConfig from '@/config/redis.config'

@Module({
  imports: [
    // Configuração global de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [appConfig, databaseConfig, jwtConfig, awsConfig, redisConfig],
    }),

    // Rate limiting global
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 10000, limit: 50 },
      { name: 'long', ttl: 60000, limit: 200 },
    ]),

    // Tarefas agendadas (cron jobs)
    ScheduleModule.forRoot(),

    // Módulos da aplicação
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    JournalistsModule,
    MailingListsModule,
    PressReleasesModule,
    CampaignsModule,
    DispatchModule,
    AnalyticsModule,
    SubscriptionsModule,
    AdminModule,
    UploadsModule,
    WebhooksModule,
  ],
  providers: [
    // Guards globais — JwtAuthGuard protege todas as rotas por defeito
    // Use @Public() nos endpoints que não precisam de autenticação
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
