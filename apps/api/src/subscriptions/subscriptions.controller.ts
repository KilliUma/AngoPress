import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { SubscriptionsService } from './subscriptions.service'
import { RequestSubscriptionDto } from './dto/request-subscription.dto'
import { CreatePlanDto } from './dto/create-plan.dto'
import { UpdatePlanDto } from './dto/update-plan.dto'
import { Public } from '@/auth/decorators/public.decorator'
import { CurrentUser } from '@/auth/decorators/current-user.decorator'
import { Roles } from '@/auth/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  // ─── Planos (público) ──────────────────────────────────────────

  @Public()
  @Get('plans')
  getPlans() {
    return this.subscriptions.getPlans()
  }

  // ─── Planos (admin) ────────────────────────────────────────────

  @Get('plans/all')
  @Roles(UserRole.ADMIN)
  getAllPlans() {
    return this.subscriptions.getAllPlans()
  }

  @Post('plans')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  createPlan(@Body() dto: CreatePlanDto) {
    return this.subscriptions.createPlan(dto)
  }

  @Patch('plans/:id')
  @Roles(UserRole.ADMIN)
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.subscriptions.updatePlan(id, dto)
  }

  @Delete('plans/:id')
  @Roles(UserRole.ADMIN)
  deactivatePlan(@Param('id') id: string) {
    return this.subscriptions.deactivatePlan(id)
  }

  // ─── Subscrição do utilizador ──────────────────────────────────

  @Get('my')
  getMySubscription(@CurrentUser() user: { id: string }) {
    return this.subscriptions.getMySubscription(user.id)
  }

  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  requestSubscription(@CurrentUser() user: { id: string }, @Body() dto: RequestSubscriptionDto) {
    return this.subscriptions.requestSubscription(user.id, dto)
  }

  @Delete('cancel')
  @HttpCode(HttpStatus.OK)
  cancelSubscription(@CurrentUser() user: { id: string }) {
    return this.subscriptions.cancelSubscription(user.id)
  }
}
