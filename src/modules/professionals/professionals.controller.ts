import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalProfileDto } from './dto/create-professional-profile.dto';
import { UpdateProfessionalProfileDto } from './dto/update-professional-profile.dto';
import { AddProfessionalServiceDto } from './dto/add-professional-service.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import {
  KycDocumentResponseDto,
  ProfessionalProfileDetailDto,
  ProfessionalServiceItemDto,
} from './dto/professional-response.dto';
import { DiscoverProfessionalsQueryDto } from './dto/discover-professionals-query.dto';
import { ProfessionalCardDto } from './dto/professional-card-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Professionals')
@Controller('professionals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  // ==========================================
  // DISCOVERY & PUBLIC DIRECTORY (PHASE 5)
  // ==========================================

  @Public()
  @Get('nearby')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🌍 [CUSTOMER] Discover Nearby Professionals (PostGIS / Geospatial)',
    description: `Discovers nearby verified and active service professionals based on customer coordinates.
Supports PostGIS / spherical distance calculation, radius filtering, category slug/ID matching, rating threshold, live availability toggle, and smart ranking algorithms.`,
  })
  @ApiResponse({
    status: 200,
    description: 'List of matching nearby professional cards ranked by relevance/distance',
    type: [ProfessionalCardDto],
  })
  async findNearby(
    @Query() query: DiscoverProfessionalsQueryDto,
  ): Promise<ProfessionalCardDto[]> {
    return this.professionalsService.findNearbyProfessionals(query);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '👤 [PUBLIC] Get Professional Profile, Services & Customer Reviews',
    description: `Fetches comprehensive public profile for a professional including name, avatar, bio, verification status, experience, visiting charge, offered services, portfolio images, customer ratings, and verified reviews.
If optional customer lat/lng are provided in query parameters, returns dynamic distance in kilometers.`,
  })
  @ApiParam({
    name: 'id',
    description: 'Professional UUID or User UUID',
    example: 'd9b2d63d-a233-4123-8478-94420e6f66aa',
  })
  @ApiQuery({
    name: 'lat',
    required: false,
    type: Number,
    description: 'Customer latitude for dynamic distance computation',
    example: 28.6139,
  })
  @ApiQuery({
    name: 'lng',
    required: false,
    type: Number,
    description: 'Customer longitude for dynamic distance computation',
    example: 77.209,
  })
  @ApiResponse({
    status: 200,
    description: 'Complete professional public profile and review history',
    type: ProfessionalProfileDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Professional not found',
  })
  async getPublicProfile(
    @Param('id') id: string,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
  ): Promise<ProfessionalProfileDetailDto> {
    return this.professionalsService.getPublicProfile(
      id,
      lat !== undefined ? Number(lat) : undefined,
      lng !== undefined ? Number(lng) : undefined,
    );
  }

  // ==========================================
  // PROFESSIONAL SELF-MANAGEMENT & KYC
  // ==========================================

  @ApiBearerAuth()
  @Roles(UserRole.CUSTOMER, UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Post('profile')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '🔒 [PROFESSIONAL] Create or Initialize Professional Profile',
    description: '🔒 **Required Role:** `CUSTOMER`, `PROFESSIONAL`, or `ADMIN`\n\nInitializes the professional business profile, visiting charge, service radius, and category links.',
  })
  @ApiResponse({
    status: 201,
    description: 'Professional profile created successfully',
    type: ProfessionalProfileDetailDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async createProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateProfessionalProfileDto,
  ): Promise<ProfessionalProfileDetailDto> {
    return this.professionalsService.createOrUpdateProfile(userId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.CUSTOMER, UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Get('me/profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔒 [PROFESSIONAL] Get Current Professional Profile',
    description: '🔒 **Required Role:** `CUSTOMER`, `PROFESSIONAL`, or `ADMIN`\n\nReturns complete profile details for the authenticated professional, including services and KYC status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Professional profile retrieved',
    type: ProfessionalProfileDetailDto,
  })
  async getMyProfile(
    @CurrentUser('sub') userId: string,
  ): Promise<ProfessionalProfileDetailDto> {
    return this.professionalsService.getMyProfile(userId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Patch('me/profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔒 [PROFESSIONAL] Update Availability / Charges / Location',
    description: '🔒 **Required Role:** `PROFESSIONAL` or `ADMIN`\n\nUpdates bio, visiting charges, online/offline availability toggle (`isOnline: true/false`), location coordinates, and service radius.',
  })
  @ApiResponse({
    status: 200,
    description: 'Professional profile updated successfully',
    type: ProfessionalProfileDetailDto,
  })
  async updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfessionalProfileDto,
  ): Promise<ProfessionalProfileDetailDto> {
    return this.professionalsService.updateMyProfile(userId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Post('services')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '🔒 [PROFESSIONAL] Link Service Categories',
    description: '🔒 **Required Role:** `PROFESSIONAL` or `ADMIN`\n\nLinks one or more service categories (e.g. AC Repair, Electrical) to the professional catalog.',
  })
  @ApiResponse({
    status: 201,
    description: 'Services linked successfully',
    type: [ProfessionalServiceItemDto],
  })
  async addServices(
    @CurrentUser('sub') userId: string,
    @Body() dto: AddProfessionalServiceDto,
  ): Promise<ProfessionalServiceItemDto[]> {
    return this.professionalsService.addServices(userId, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Get('me/services')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔒 [PROFESSIONAL] List Professional Linked Services',
    description: '🔒 **Required Role:** `PROFESSIONAL` or `ADMIN`\n\nReturns all categories/services linked to the authenticated professional.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of linked services',
    type: [ProfessionalServiceItemDto],
  })
  async getMyServices(
    @CurrentUser('sub') userId: string,
  ): Promise<ProfessionalServiceItemDto[]> {
    return this.professionalsService.getMyServices(userId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.PROFESSIONAL, UserRole.ADMIN)
  @Post('kyc')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '🔒 [PROFESSIONAL] Submit KYC Document',
    description: '🔒 **Required Role:** `PROFESSIONAL` or `ADMIN`\n\nUploads/submits government ID (Aadhaar, PAN, Trade License) for admin verification.',
  })
  @ApiResponse({
    status: 201,
    description: 'KYC document submitted and marked as PENDING',
    type: KycDocumentResponseDto,
  })
  async submitKyc(
    @CurrentUser('sub') userId: string,
    @Body() dto: SubmitKycDto,
  ): Promise<KycDocumentResponseDto> {
    return this.professionalsService.submitKyc(userId, dto);
  }
}

