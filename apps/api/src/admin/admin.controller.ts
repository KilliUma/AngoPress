import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { AdminService } from './admin.service'
import { Roles } from '@/auth/decorators/roles.decorator'
import { CurrentUser } from '@/auth/decorators/current-user.decorator'
import {
  UserRole,
  UserStatus,
  SubscriptionStatus,
  JournalistRegistrationStatus,
} from '@prisma/client'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import { AdminActivateSubscriptionDto } from './dto/activate-subscription.dto'
import { ReviewRegistrationDto } from './dto/review-registration.dto'
import { CreatePlanDto } from '@/subscriptions/dto/create-plan.dto'
import { UpdatePlanDto } from '@/subscriptions/dto/update-plan.dto'

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  // ─── Estatísticas ──────────────────────────────────────────────

  @Get('stats')
  getStats() {
    return this.admin.getStats()
  }

  // ─── Utilizadores ──────────────────────────────────────────────

  @Get('users')
  getUsers(
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admin.getUsers({
      search,
      role,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
  }

  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.admin.updateUserStatus(id, dto)
  }

  // ─── Assinaturas ───────────────────────────────────────────────

  @Get('subscriptions')
  getSubscriptions(
    @Query('status') status?: SubscriptionStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admin.getSubscriptions({
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
  }

  @Post('subscriptions/:userId/activate')
  @HttpCode(HttpStatus.OK)
  activateSubscription(@Param('userId') userId: string, @Body() dto: AdminActivateSubscriptionDto) {
    return this.admin.activateSubscription(userId, dto)
  }

  // ─── Planos ────────────────────────────────────────────────────

  @Get('plans')
  getPlans() {
    return this.admin.getPlans()
  }

  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  createPlan(@Body() dto: CreatePlanDto) {
    return this.admin.createPlan(dto as any)
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.admin.updatePlan(id, dto as any)
  }

  @Delete('plans/:id')
  deletePlan(@Param('id') id: string) {
    return this.admin.deletePlan(id)
  }

  // ─── Registos de jornalistas ───────────────────────────────────

  @Get('journalist-registrations')
  getJournalistRegistrations(
    @Query('status') status?: JournalistRegistrationStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admin.getJournalistRegistrations({
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })
  }

  @Post('journalist-registrations/:id/review')
  @HttpCode(HttpStatus.OK)
  reviewJournalistRegistration(
    @Param('id') id: string,
    @Body() dto: ReviewRegistrationDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.admin.reviewJournalistRegistration(id, dto, user.id)
  }
}
