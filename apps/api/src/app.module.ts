import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Config validation
import { validate } from './config/env.validation';

// Core
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { SecurityModule } from './security/security.module';

// Guards, Filters, Interceptors
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { GeoRestrictionGuard } from './common/guards/geo-restriction.guard';

// Feature Modules
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ChallengePlansModule } from './challenge-plans/challenge-plans.module';
import { RulesModule } from './rules/rules.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { CouponsModule } from './coupons/coupons.module';
import { TraderAccountsModule } from './trader-accounts/trader-accounts.module';
import { KycModule } from './kyc/kyc.module';
import { PayoutsModule } from './payouts/payouts.module';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { TicketsModule } from './tickets/tickets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BlogModule } from './blog/blog.module';
import { FaqModule } from './faq/faq.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { LegalModule } from './legal/legal.module';
import { RestrictionsModule } from './restrictions/restrictions.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate,
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    EventEmitterModule.forRoot(),

    // Core infrastructure
    PrismaModule,
    RedisModule,
    QueueModule,
    SecurityModule,

    // Feature modules
    HealthModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    ChallengePlansModule,
    RulesModule,
    OrdersModule,
    PaymentsModule,
    CouponsModule,
    TraderAccountsModule,
    KycModule,
    PayoutsModule,
    AffiliatesModule,
    TicketsModule,
    NotificationsModule,
    BlogModule,
    FaqModule,
    NewsletterModule,
    LegalModule,
    RestrictionsModule,
    AdminModule,
    AnalyticsModule,
    SystemSettingsModule,
    AuditModule,
  ],
  providers: [
    // Global JWT auth guard (use @Public() to skip)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global roles guard (use @Roles() to enforce)
    { provide: APP_GUARD, useClass: RolesGuard },
    // Global rate-limiting guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Wrap all responses in ApiResponseDto
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    // Auto audit-log every admin mutation
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    // Consistent error responses
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Opt-in geo restriction guard (use @GeoRestricted() on routes)
    GeoRestrictionGuard,
  ],
})
export class AppModule {}
