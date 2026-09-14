import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PartnerService } from './partner.service';
import { PartnerRequestItemDto } from './dto/partner-request-response.dto';
import { DeclineRequestDto } from './dto/decline-request.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { BookingResponseDto } from '../bookings/dto/booking-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Partner')
@Controller('partner')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @ApiBearerAuth()
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Get('requests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📋 [PARTNER] Get Incoming Visit Requests',
    description:
      'Fetches new visit requests in REQUESTED (PENDING) status for the authenticated partner. Includes Customer, Category, Problem, Distance, Date, Time, Visiting Charge, and remaining seconds on the 5-minute timer.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of incoming visit requests',
    type: [PartnerRequestItemDto],
  })
  async getIncomingRequests(
    @CurrentUser('sub') userId: string,
  ): Promise<PartnerRequestItemDto[]> {
    return this.partnerService.getIncomingRequests(userId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Post('requests/:id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '✅ [PARTNER] Accept Visit Request',
    description:
      'Professional accepts the visit request before the 5-minute timeout. Transitions booking state from REQUESTED to ACCEPTED.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiResponse({
    status: 200,
    description: 'Visit request accepted successfully',
    type: BookingResponseDto,
  })
  async acceptRequest(
    @Param('id') bookingId: string,
    @CurrentUser('sub') userId: string,
  ): Promise<BookingResponseDto> {
    return this.partnerService.acceptRequest(userId, bookingId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Post('requests/:id/decline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '❌ [PARTNER] Decline Visit Request',
    description:
      'Professional declines the visit request. Transitions booking state to DECLINED.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiResponse({
    status: 200,
    description: 'Visit request declined successfully',
  })
  async declineRequest(
    @Param('id') bookingId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: DeclineRequestDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.partnerService.declineRequest(userId, bookingId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Get('active-job')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🛠️ [PARTNER] Get Single Currently Active Ongoing Job',
    description:
      'Fetches the single currently active job being executed by the partner (in ACCEPTED, ON_THE_WAY, ARRIVED, INSPECTION, QUOTE_CREATED, WAITING_CUSTOMER_APPROVAL, APPROVED, or IN_PROGRESS status). Returns null if no active job.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active job details or null',
    type: BookingResponseDto,
  })
  async getActiveJob(
    @CurrentUser('sub') userId: string,
  ): Promise<BookingResponseDto | null> {
    return this.partnerService.getActiveJob(userId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Patch('availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📡 [PARTNER] Update Availability & Live Location',
    description:
      'Toggles online/offline status (isOnline) and optionally updates live GPS latitude/longitude.',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability updated successfully',
  })
  async updateAvailability(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.partnerService.updateAvailability(userId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Get('earnings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '💰 [PARTNER] Get Real-time Earnings & Transaction Breakdown',
    description:
      'Calculates total earnings, current month earnings, completed jobs count, and transaction log for the authenticated partner.',
  })
  @ApiResponse({
    status: 200,
    description: 'Partner earnings metrics',
  })
  async getEarnings(@CurrentUser('sub') userId: string) {
    return this.partnerService.getEarnings(userId);
  }
}
