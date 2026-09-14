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
import { BookingsService } from './bookings.service';
import {
  CalculateBookingPriceDto,
  BookingPriceCalculationResultDto,
} from './dto/calculate-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Public()
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '💰 [CUSTOMER] Calculate Visiting Charge Breakdown',
    description:
      'Calculates the total visit charge, taxes (18% GST), platform fee, and coupon discounts before placing a booking.',
  })
  @ApiResponse({
    status: 200,
    description: 'Price calculation breakdown',
    type: BookingPriceCalculationResultDto,
  })
  async calculatePrice(
    @Body() dto: CalculateBookingPriceDto,
  ): Promise<BookingPriceCalculationResultDto> {
    return this.bookingsService.calculatePrice(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.CUSTOMER, UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '📅 [CUSTOMER] Book a Professional Visit',
    description: `Creates an in-person visit booking for the specified professional.
Transitions state to REQUESTED (PENDING), generates a unique tracking booking number, creates an initial visiting charge payment entry, and notifies the professional.`,
  })
  @ApiResponse({
    status: 201,
    description: 'Visit booking created successfully',
    type: BookingResponseDto,
  })
  async createBooking(
    @CurrentUser('sub') customerId: string,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.createBooking(customerId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.CUSTOMER, UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Get('customer/active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔄 [CUSTOMER] List Active Ongoing Bookings',
    description:
      'Returns all current active / in-progress bookings for the logged-in customer (PENDING, ACCEPTED, ON_THE_WAY, ARRIVED, INSPECTION, DIAGNOSIS_PENDING, QUOTE_CREATED, IN_PROGRESS).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active customer bookings',
    type: [BookingResponseDto],
  })
  async getCustomerActiveBookings(
    @CurrentUser('sub') customerId: string,
  ): Promise<BookingResponseDto[]> {
    return this.bookingsService.getCustomerActiveBookings(customerId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.CUSTOMER, UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Get('customer/history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📜 [CUSTOMER] List Past / Completed Booking History',
    description:
      'Returns all completed, cancelled, or closed bookings for the logged-in customer.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of past booking history',
    type: [BookingResponseDto],
  })
  async getCustomerBookingHistory(
    @CurrentUser('sub') customerId: string,
  ): Promise<BookingResponseDto[]> {
    return this.bookingsService.getCustomerBookingHistory(customerId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Get('professional/active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔄 [PROFESSIONAL] List Active Ongoing / Incoming Bookings',
    description:
      'Returns all assigned active / in-progress bookings for the logged-in professional (PENDING, ACCEPTED, ON_THE_WAY, ARRIVED, INSPECTION, DIAGNOSIS_PENDING, QUOTE_CREATED, IN_PROGRESS).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active professional bookings',
    type: [BookingResponseDto],
  })
  async getProfessionalActiveBookings(
    @CurrentUser('sub') userId: string,
  ): Promise<BookingResponseDto[]> {
    return this.bookingsService.getProfessionalActiveBookings(userId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Get('professional/history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📜 [PROFESSIONAL] List Past / Completed Booking History',
    description:
      'Returns all completed, cancelled, or closed bookings for the logged-in professional.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of past professional booking history',
    type: [BookingResponseDto],
  })
  async getProfessionalBookingHistory(
    @CurrentUser('sub') userId: string,
  ): Promise<BookingResponseDto[]> {
    return this.bookingsService.getProfessionalBookingHistory(userId);
  }

  @ApiBearerAuth()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔍 [CUSTOMER/PROFESSIONAL] Get Full Booking Details',
    description:
      'Retrieves complete booking details including assigned professional, customer address, scheduled date/time, diagnosis, quote history, payments, and chronological status transition audit trail.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiResponse({
    status: 200,
    description: 'Full booking details',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have permission to view this booking',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async getBookingById(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.getBookingById(id, userId, userRole);
  }

  @ApiBearerAuth()
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '⚡ [PROFESSIONAL/CUSTOMER] Update Booking Status Lifecycle',
    description:
      'Transitions booking status (e.g. ACCEPTED, ON_THE_WAY, ARRIVED, INSPECTION, IN_PROGRESS, COMPLETED) adhering to state machine rules.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking status updated successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid state transition',
  })
  async updateBookingStatus(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.updateBookingStatus(id, userId, userRole, dto);
  }

  @ApiBearerAuth()
  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '⚡ [PROFESSIONAL/CUSTOMER] Update Booking Status Lifecycle (POST alias)',
    description:
      'POST alias to transition booking status (e.g. ACCEPTED, ON_THE_WAY, ARRIVED, INSPECTION, IN_PROGRESS, COMPLETED).',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking status updated successfully',
    type: BookingResponseDto,
  })
  async updateBookingStatusPost(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() dto: UpdateBookingStatusDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.updateBookingStatus(id, userId, userRole, dto);
  }

  @ApiBearerAuth()
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '❌ [CUSTOMER/PROFESSIONAL] Cancel Booking',
    description:
      'Cancels an active booking in accordance with the backend state machine rules. Only bookings in PENDING, ACCEPTED, or ON_THE_WAY states can be cancelled.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid state transition or cancellation not permitted in current state',
  })
  async cancelBooking(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.cancelBooking(id, userId, userRole, dto);
  }
}
