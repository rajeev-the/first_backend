import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, UserRole, KycStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfessionalProfileDto } from './dto/create-professional-profile.dto';
import { UpdateProfessionalProfileDto } from './dto/update-professional-profile.dto';
import { AddProfessionalServiceDto } from './dto/add-professional-service.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import {
  KycDocumentResponseDto,
  ProfessionalProfileDetailDto,
  ProfessionalServiceItemDto,
  ProfessionalReviewDto,
} from './dto/professional-response.dto';
import {
  DiscoverProfessionalsQueryDto,
  ProfessionalSortBy,
} from './dto/discover-professionals-query.dto';
import { ProfessionalCardDto } from './dto/professional-card-response.dto';

@Injectable()
export class ProfessionalsService {
  private readonly logger = new Logger(ProfessionalsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Discovers and ranks nearby professionals using geospatial distance,
   * category matching, availability, rating threshold, and composite ranking.
   */
  async findNearbyProfessionals(
    query: DiscoverProfessionalsQueryDto,
  ): Promise<ProfessionalCardDto[]> {
    const {
      lat,
      lng,
      radius = 10,
      category,
      rating,
      availability,
      sortBy = ProfessionalSortBy.RECOMMENDED,
      page = 1,
      limit = 20,
    } = query;

    const offset = (page - 1) * limit;

    // Build dynamic SQL conditions and params
    const categoryClause = category
      ? Prisma.sql`AND (
          LOWER(sc.slug) = LOWER(${category})
          OR sc.id::text = ${category}
          OR LOWER(sc.name) ILIKE LOWER(${'%' + category + '%'})
        )`
      : Prisma.empty;

    const ratingClause =
      rating !== undefined && rating !== null
        ? Prisma.sql`AND p.rating >= ${rating}`
        : Prisma.empty;

    const availabilityClause =
      availability !== undefined && availability !== null
        ? Prisma.sql`AND p.is_online = ${availability}`
        : Prisma.empty;

    // Sorting expressions
    let orderClause = Prisma.sql`ORDER BY score DESC, distance ASC`;
    if (sortBy === ProfessionalSortBy.DISTANCE) {
      orderClause = Prisma.sql`ORDER BY distance ASC`;
    } else if (sortBy === ProfessionalSortBy.RATING) {
      orderClause = Prisma.sql`ORDER BY p.rating DESC, p.total_reviews DESC`;
    } else if (sortBy === ProfessionalSortBy.EXPERIENCE) {
      orderClause = Prisma.sql`ORDER BY p.experience_years DESC`;
    } else if (sortBy === ProfessionalSortBy.PRICE_LOW_TO_HIGH) {
      orderClause = Prisma.sql`ORDER BY p.visiting_charge ASC, distance ASC`;
    }

    // High-performance Geospatial Query (PostGIS / Spherical Law of Cosines)
    // Formula: 6371 * acos(cos(lat1)*cos(lat2)*cos(lon2-lon1) + sin(lat1)*sin(lat2))
    const rawResults = await this.prisma.$queryRaw<any[]>`
      WITH ranked_professionals AS (
        SELECT
          p.id,
          p.user_id,
          p.business_name,
          p.bio,
          p.experience_years,
          p.visiting_charge,
          p.is_online,
          p.is_verified,
          p.kyc_status,
          p.rating,
          p.total_reviews,
          p.service_radius_km,
          p.latitude,
          p.longitude,
          u.name AS user_name,
          u.avatar_url,
          sc.name AS matched_category_name,
          sc.slug AS matched_category_slug,
          (
            6371 * acos(
              LEAST(1.0, GREATEST(-1.0,
                cos(radians(${lat})) * cos(radians(p.latitude)) *
                cos(radians(p.longitude) - radians(${lng})) +
                sin(radians(${lat})) * sin(radians(p.latitude))
              ))
            )
          ) AS distance,
          (
            (CAST(p.rating AS FLOAT) * 2.0)
            + (p.experience_years * 0.1)
            - (
                6371 * acos(
                  LEAST(1.0, GREATEST(-1.0,
                    cos(radians(${lat})) * cos(radians(p.latitude)) *
                    cos(radians(p.longitude) - radians(${lng})) +
                    sin(radians(${lat})) * sin(radians(p.latitude))
                  ))
                ) * 0.4
              )
            + (CASE WHEN p.is_verified THEN 2.0 ELSE 0.0 END)
            + (CASE WHEN p.is_online THEN 1.5 ELSE 0.0 END)
          ) AS score,
          ROW_NUMBER() OVER (
            PARTITION BY p.id
            ORDER BY ps.created_at ASC
          ) as rn
        FROM professionals p
        JOIN users u ON u.id = p.user_id AND u.status = 'ACTIVE'
        JOIN professional_services ps ON ps.professional_id = p.id AND ps.is_active = true
        JOIN service_categories sc ON sc.id = ps.category_id AND sc.is_active = true
        WHERE p.latitude IS NOT NULL
          AND p.longitude IS NOT NULL
          ${categoryClause}
          ${ratingClause}
          ${availabilityClause}
      )
      SELECT *
      FROM ranked_professionals
      WHERE rn = 1
        AND distance <= ${radius}
      ${orderClause}
      LIMIT ${limit}
      OFFSET ${offset};
    `;

    return rawResults.map((row) => ({
      id: row.id,
      name: row.user_name || row.business_name || 'Professional Specialist',
      avatarUrl: row.avatar_url || null,
      bio: row.bio || null,
      category: row.matched_category_name || 'Home Services',
      categorySlug: row.matched_category_slug || '',
      rating: Number(row.rating ?? 0),
      totalReviews: Number(row.total_reviews ?? 0),
      experience: Number(row.experience_years ?? 0),
      visitingCharge: Number(row.visiting_charge ?? 0),
      distance: Math.round(Number(row.distance ?? 0) * 10) / 10,
      isVerified: Boolean(row.is_verified),
      isAvailable: Boolean(row.is_online),
      latitude: row.latitude ? Number(row.latitude) : undefined,
      longitude: row.longitude ? Number(row.longitude) : undefined,
    }));
  }

  /**
   * Retrieves a public professional profile by ID, including ratings,
   * customer reviews, offered services, portfolio images, and calculated distance.
   */
  async getPublicProfile(
    id: string,
    lat?: number,
    lng?: number,
  ): Promise<ProfessionalProfileDetailDto> {
    const professional = await this.prisma.professional.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: true,
        services: {
          include: { category: true },
          where: { isActive: true },
        },
        reviewsReceived: {
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        kycDocuments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!professional) {
      throw new NotFoundException(`Professional with ID ${id} not found`);
    }

    let calculatedDistance: number | null = null;
    if (
      lat !== undefined &&
      lng !== undefined &&
      professional.latitude !== null &&
      professional.longitude !== null
    ) {
      calculatedDistance = this.calculateDistanceKm(
        lat,
        lng,
        professional.latitude,
        professional.longitude,
      );
    }

    return this.formatProfile(professional, calculatedDistance);
  }

  async createOrUpdateProfile(
    userId: string,
    dto: CreateProfessionalProfileDto,
  ): Promise<ProfessionalProfileDetailDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Ensure user role is updated to PROFESSIONAL if not already
    if (user.role !== UserRole.PROFESSIONAL && user.role !== UserRole.ADMIN) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.PROFESSIONAL },
      });
    }

    // Upsert professional record
    const professional = await this.prisma.professional.upsert({
      where: { userId },
      update: {
        ...(dto.businessName !== undefined ? { businessName: dto.businessName } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.experienceYears !== undefined ? { experienceYears: dto.experienceYears } : {}),
        ...(dto.visitingCharge !== undefined
          ? { visitingCharge: new Prisma.Decimal(dto.visitingCharge) }
          : {}),
        ...(dto.serviceRadiusKm !== undefined
          ? { serviceRadiusKm: new Prisma.Decimal(dto.serviceRadiusKm) }
          : {}),
        ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
        ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
      },
      create: {
        userId,
        businessName: dto.businessName ?? null,
        bio: dto.bio ?? null,
        experienceYears: dto.experienceYears ?? 0,
        visitingCharge: new Prisma.Decimal(dto.visitingCharge ?? 0.0),
        serviceRadiusKm: new Prisma.Decimal(dto.serviceRadiusKm ?? 10.0),
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        isOnline: false,
        isVerified: false,
        kycStatus: KycStatus.PENDING,
      },
    });

    // Link initial categories if provided
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      const uniqueCategoryIds = Array.from(new Set(dto.categoryIds));
      const existingCategories = await this.prisma.serviceCategory.findMany({
        where: { id: { in: uniqueCategoryIds } },
        select: { id: true },
      });

      const validCatIds = existingCategories.map((c) => c.id);
      if (validCatIds.length > 0) {
        await this.prisma.professionalService.createMany({
          data: validCatIds.map((categoryId) => ({
            professionalId: professional.id,
            categoryId,
            isActive: true,
          })),
          skipDuplicates: true,
        });

        await this.prisma.professionalService.updateMany({
          where: {
            professionalId: professional.id,
            categoryId: { in: validCatIds },
          },
          data: { isActive: true },
        });
      }
    }

    this.logger.log(`[Professionals] Profile initialized/updated for user ${userId}`);

    return this.getMyProfile(userId);
  }

  async getMyProfile(userId: string): Promise<ProfessionalProfileDetailDto> {
    let professional = await this.prisma.professional.findUnique({
      where: { userId },
      include: {
        user: true,
        services: {
          include: { category: true },
          where: { isActive: true },
        },
        reviewsReceived: {
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        kycDocuments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // If professional record doesn't exist yet, auto-create it
    if (!professional) {
      professional = await this.prisma.professional.create({
        data: {
          userId,
          businessName: null,
          experienceYears: 0,
          visitingCharge: new Prisma.Decimal(0.0),
          serviceRadiusKm: new Prisma.Decimal(10.0),
          isOnline: false,
          isVerified: false,
          kycStatus: KycStatus.PENDING,
        },
        include: {
          user: true,
          services: {
            include: { category: true },
            where: { isActive: true },
          },
          reviewsReceived: {
            include: { customer: true },
          },
          kycDocuments: true,
        },
      });
    }

    return this.formatProfile(professional);
  }

  async updateMyProfile(
    userId: string,
    dto: UpdateProfessionalProfileDto,
  ): Promise<ProfessionalProfileDetailDto> {
    const professional = await this.prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundException('Professional profile not found');
    }

    await this.prisma.professional.update({
      where: { id: professional.id },
      data: {
        ...(dto.businessName !== undefined ? { businessName: dto.businessName } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.experienceYears !== undefined ? { experienceYears: dto.experienceYears } : {}),
        ...(dto.visitingCharge !== undefined
          ? { visitingCharge: new Prisma.Decimal(dto.visitingCharge) }
          : {}),
        ...(dto.isOnline !== undefined ? { isOnline: dto.isOnline } : {}),
        ...(dto.serviceRadiusKm !== undefined
          ? { serviceRadiusKm: new Prisma.Decimal(dto.serviceRadiusKm) }
          : {}),
        ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
        ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
      },
    });

    this.logger.log(`[Professionals] Profile updated for professional ${professional.id}`);

    return this.getMyProfile(userId);
  }

  async addServices(
    userId: string,
    dto: AddProfessionalServiceDto,
  ): Promise<ProfessionalServiceItemDto[]> {
    const professional = await this.prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundException('Professional profile not found');
    }

    if (!dto.categoryIds || dto.categoryIds.length === 0) {
      return this.getMyServices(userId);
    }

    const uniqueCategoryIds = Array.from(new Set(dto.categoryIds));

    // Batch validate all categories in a single query
    const existingCategories = await this.prisma.serviceCategory.findMany({
      where: { id: { in: uniqueCategoryIds } },
      select: { id: true },
    });

    if (existingCategories.length !== uniqueCategoryIds.length) {
      const foundIds = new Set(existingCategories.map((c) => c.id));
      const missingIds = uniqueCategoryIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(`Category with ID ${missingIds[0]} does not exist`);
    }

    // Identify which categories already exist for this professional
    const existingLinks = await this.prisma.professionalService.findMany({
      where: {
        professionalId: professional.id,
        categoryId: { in: uniqueCategoryIds },
      },
      select: { categoryId: true },
    });

    const existingCatIdSet = new Set(existingLinks.map((l) => l.categoryId));
    const toCreate = uniqueCategoryIds.filter((id) => !existingCatIdSet.has(id));
    const toUpdate = uniqueCategoryIds.filter((id) => existingCatIdSet.has(id));

    const customRateVal =
      dto.customRate !== undefined && dto.customRate !== null
        ? new Prisma.Decimal(dto.customRate)
        : null;

    const operations: Promise<any>[] = [];

    if (toCreate.length > 0) {
      operations.push(
        this.prisma.professionalService.createMany({
          data: toCreate.map((categoryId) => ({
            professionalId: professional.id,
            categoryId,
            isActive: true,
            customRate: customRateVal,
          })),
          skipDuplicates: true,
        }),
      );
    }

    if (toUpdate.length > 0) {
      operations.push(
        this.prisma.professionalService.updateMany({
          where: {
            professionalId: professional.id,
            categoryId: { in: toUpdate },
          },
          data: {
            isActive: true,
            ...(dto.customRate !== undefined ? { customRate: customRateVal } : {}),
          },
        }),
      );
    }

    if (operations.length > 0) {
      await Promise.all(operations);
    }

    // Return updated services directly without redundant findUnique
    const services = await this.prisma.professionalService.findMany({
      where: {
        professionalId: professional.id,
        isActive: true,
      },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });

    return services.map((s) => ({
      id: s.id,
      categoryId: s.categoryId,
      categoryName: s.category.name,
      categorySlug: s.category.slug,
      categoryIcon: s.category.icon,
      customRate: s.customRate ? Number(s.customRate) : null,
      isActive: s.isActive,
      createdAt: s.createdAt,
    }));
  }

  async getMyServices(userId: string): Promise<ProfessionalServiceItemDto[]> {
    const professional = await this.prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundException('Professional profile not found');
    }

    const services = await this.prisma.professionalService.findMany({
      where: {
        professionalId: professional.id,
        isActive: true,
      },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });

    return services.map((s) => ({
      id: s.id,
      categoryId: s.categoryId,
      categoryName: s.category.name,
      categorySlug: s.category.slug,
      categoryIcon: s.category.icon,
      customRate: s.customRate ? Number(s.customRate) : null,
      isActive: s.isActive,
      createdAt: s.createdAt,
    }));
  }

  async submitKyc(userId: string, dto: SubmitKycDto): Promise<KycDocumentResponseDto> {
    const professional = await this.prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      throw new NotFoundException('Professional profile not found');
    }

    const existingDoc = await this.prisma.kycDocument.findFirst({
      where: {
        professionalId: professional.id,
        documentType: dto.documentType,
      },
    });

    let kycDoc;
    if (existingDoc) {
      kycDoc = await this.prisma.kycDocument.update({
        where: { id: existingDoc.id },
        data: {
          documentNumber: dto.documentNumber,
          documentUrl: dto.documentUrl,
          status: KycStatus.PENDING,
          rejectionReason: null,
        },
      });
    } else {
      kycDoc = await this.prisma.kycDocument.create({
        data: {
          professionalId: professional.id,
          documentType: dto.documentType,
          documentNumber: dto.documentNumber,
          documentUrl: dto.documentUrl,
          status: KycStatus.PENDING,
        },
      });
    }

    // Set overall professional KYC status to PENDING
    await this.prisma.professional.update({
      where: { id: professional.id },
      data: { kycStatus: KycStatus.PENDING },
    });

    this.logger.log(
      `[KYC] Document ${dto.documentType} submitted for professional ${professional.id}`,
    );

    return {
      id: kycDoc.id,
      documentType: kycDoc.documentType,
      documentNumber: kycDoc.documentNumber,
      documentUrl: kycDoc.documentUrl,
      status: kycDoc.status,
      rejectionReason: kycDoc.rejectionReason,
      verifiedAt: kycDoc.verifiedAt,
      createdAt: kycDoc.createdAt,
    };
  }

  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private formatProfile(
    professional: any,
    distance?: number | null,
  ): ProfessionalProfileDetailDto {
    const reviews: ProfessionalReviewDto[] = (
      professional.reviewsReceived || []
    ).map((r: any) => ({
      id: r.id,
      rating: Number(r.rating),
      comment: r.comment,
      customerName: r.customer?.name || 'Verified Customer',
      customerAvatar: r.customer?.avatarUrl || null,
      createdAt: r.createdAt,
    }));

    return {
      id: professional.id,
      userId: professional.userId,
      name:
        professional.user?.name ||
        professional.businessName ||
        'Professional Specialist',
      businessName: professional.businessName,
      bio: professional.bio,
      avatarUrl: professional.user?.avatarUrl || null,
      experienceYears: professional.experienceYears,
      experience: professional.experienceYears,
      visitingCharge: Number(professional.visitingCharge),
      isOnline: professional.isOnline,
      isAvailable: professional.isOnline,
      isVerified: professional.isVerified,
      kycStatus: professional.kycStatus,
      rating: Number(professional.rating),
      totalReviews: professional.totalReviews,
      serviceRadiusKm: Number(professional.serviceRadiusKm),
      distance: distance !== undefined ? distance : null,
      latitude: professional.latitude,
      longitude: professional.longitude,
      portfolio: professional.portfolio || [],
      createdAt: professional.createdAt,
      updatedAt: professional.updatedAt,
      user: professional.user
        ? {
            id: professional.user.id,
            phone: professional.user.phone,
            email: professional.user.email,
            name: professional.user.name,
            role: professional.user.role,
            status: professional.user.status,
            avatarUrl: professional.user.avatarUrl,
          }
        : undefined,
      services: professional.services
        ? professional.services.map((s: any) => ({
            id: s.id,
            categoryId: s.categoryId,
            categoryName: s.category?.name ?? '',
            categorySlug: s.category?.slug ?? '',
            categoryIcon: s.category?.icon ?? null,
            customRate: s.customRate ? Number(s.customRate) : null,
            isActive: s.isActive,
            createdAt: s.createdAt,
          }))
        : [],
      reviews,
      kycDocuments: professional.kycDocuments
        ? professional.kycDocuments.map((doc: any) => ({
            id: doc.id,
            documentType: doc.documentType,
            documentNumber: doc.documentNumber,
            documentUrl: doc.documentUrl,
            status: doc.status,
            rejectionReason: doc.rejectionReason,
            verifiedAt: doc.verifiedAt,
            createdAt: doc.createdAt,
          }))
        : [],
    };
  }
}

