"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProfessionalsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const discover_professionals_query_dto_1 = require("./dto/discover-professionals-query.dto");
let ProfessionalsService = ProfessionalsService_1 = class ProfessionalsService {
    prisma;
    logger = new common_1.Logger(ProfessionalsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findNearbyProfessionals(query) {
        const { lat, lng, radius = 10, category, rating, availability, sortBy = discover_professionals_query_dto_1.ProfessionalSortBy.RECOMMENDED, page = 1, limit = 20, } = query;
        const offset = (page - 1) * limit;
        const categoryClause = category
            ? client_1.Prisma.sql `AND (
          LOWER(sc.slug) = LOWER(${category})
          OR sc.id::text = ${category}
          OR LOWER(sc.name) ILIKE LOWER(${'%' + category + '%'})
        )`
            : client_1.Prisma.empty;
        const ratingClause = rating !== undefined && rating !== null
            ? client_1.Prisma.sql `AND p.rating >= ${rating}`
            : client_1.Prisma.empty;
        const availabilityClause = availability !== undefined && availability !== null
            ? client_1.Prisma.sql `AND p.is_online = ${availability}`
            : client_1.Prisma.empty;
        let orderClause = client_1.Prisma.sql `ORDER BY score DESC, distance ASC`;
        if (sortBy === discover_professionals_query_dto_1.ProfessionalSortBy.DISTANCE) {
            orderClause = client_1.Prisma.sql `ORDER BY distance ASC`;
        }
        else if (sortBy === discover_professionals_query_dto_1.ProfessionalSortBy.RATING) {
            orderClause = client_1.Prisma.sql `ORDER BY p.rating DESC, p.total_reviews DESC`;
        }
        else if (sortBy === discover_professionals_query_dto_1.ProfessionalSortBy.EXPERIENCE) {
            orderClause = client_1.Prisma.sql `ORDER BY p.experience_years DESC`;
        }
        else if (sortBy === discover_professionals_query_dto_1.ProfessionalSortBy.PRICE_LOW_TO_HIGH) {
            orderClause = client_1.Prisma.sql `ORDER BY p.visiting_charge ASC, distance ASC`;
        }
        const rawResults = await this.prisma.$queryRaw `
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
    async getPublicProfile(id, lat, lng) {
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
            throw new common_1.NotFoundException(`Professional with ID ${id} not found`);
        }
        let calculatedDistance = null;
        if (lat !== undefined &&
            lng !== undefined &&
            professional.latitude !== null &&
            professional.longitude !== null) {
            calculatedDistance = this.calculateDistanceKm(lat, lng, professional.latitude, professional.longitude);
        }
        return this.formatProfile(professional, calculatedDistance);
    }
    async createOrUpdateProfile(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role !== client_1.UserRole.PROFESSIONAL && user.role !== client_1.UserRole.ADMIN) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { role: client_1.UserRole.PROFESSIONAL },
            });
        }
        const professional = await this.prisma.professional.upsert({
            where: { userId },
            update: {
                ...(dto.businessName !== undefined ? { businessName: dto.businessName } : {}),
                ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
                ...(dto.experienceYears !== undefined ? { experienceYears: dto.experienceYears } : {}),
                ...(dto.visitingCharge !== undefined
                    ? { visitingCharge: new client_1.Prisma.Decimal(dto.visitingCharge) }
                    : {}),
                ...(dto.serviceRadiusKm !== undefined
                    ? { serviceRadiusKm: new client_1.Prisma.Decimal(dto.serviceRadiusKm) }
                    : {}),
                ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
                ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
            },
            create: {
                userId,
                businessName: dto.businessName ?? null,
                bio: dto.bio ?? null,
                experienceYears: dto.experienceYears ?? 0,
                visitingCharge: new client_1.Prisma.Decimal(dto.visitingCharge ?? 0.0),
                serviceRadiusKm: new client_1.Prisma.Decimal(dto.serviceRadiusKm ?? 10.0),
                latitude: dto.latitude ?? null,
                longitude: dto.longitude ?? null,
                isOnline: false,
                isVerified: false,
                kycStatus: client_1.KycStatus.PENDING,
            },
        });
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
    async getMyProfile(userId) {
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
        if (!professional) {
            professional = await this.prisma.professional.create({
                data: {
                    userId,
                    businessName: null,
                    experienceYears: 0,
                    visitingCharge: new client_1.Prisma.Decimal(0.0),
                    serviceRadiusKm: new client_1.Prisma.Decimal(10.0),
                    isOnline: false,
                    isVerified: false,
                    kycStatus: client_1.KycStatus.PENDING,
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
    async updateMyProfile(userId, dto) {
        const professional = await this.prisma.professional.findUnique({
            where: { userId },
        });
        if (!professional) {
            throw new common_1.NotFoundException('Professional profile not found');
        }
        await this.prisma.professional.update({
            where: { id: professional.id },
            data: {
                ...(dto.businessName !== undefined ? { businessName: dto.businessName } : {}),
                ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
                ...(dto.experienceYears !== undefined ? { experienceYears: dto.experienceYears } : {}),
                ...(dto.visitingCharge !== undefined
                    ? { visitingCharge: new client_1.Prisma.Decimal(dto.visitingCharge) }
                    : {}),
                ...(dto.isOnline !== undefined ? { isOnline: dto.isOnline } : {}),
                ...(dto.serviceRadiusKm !== undefined
                    ? { serviceRadiusKm: new client_1.Prisma.Decimal(dto.serviceRadiusKm) }
                    : {}),
                ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
                ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
            },
        });
        this.logger.log(`[Professionals] Profile updated for professional ${professional.id}`);
        return this.getMyProfile(userId);
    }
    async addServices(userId, dto) {
        const professional = await this.prisma.professional.findUnique({
            where: { userId },
        });
        if (!professional) {
            throw new common_1.NotFoundException('Professional profile not found');
        }
        if (!dto.categoryIds || dto.categoryIds.length === 0) {
            return this.getMyServices(userId);
        }
        const uniqueCategoryIds = Array.from(new Set(dto.categoryIds));
        const existingCategories = await this.prisma.serviceCategory.findMany({
            where: { id: { in: uniqueCategoryIds } },
            select: { id: true },
        });
        if (existingCategories.length !== uniqueCategoryIds.length) {
            const foundIds = new Set(existingCategories.map((c) => c.id));
            const missingIds = uniqueCategoryIds.filter((id) => !foundIds.has(id));
            throw new common_1.BadRequestException(`Category with ID ${missingIds[0]} does not exist`);
        }
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
        const customRateVal = dto.customRate !== undefined && dto.customRate !== null
            ? new client_1.Prisma.Decimal(dto.customRate)
            : null;
        const operations = [];
        if (toCreate.length > 0) {
            operations.push(this.prisma.professionalService.createMany({
                data: toCreate.map((categoryId) => ({
                    professionalId: professional.id,
                    categoryId,
                    isActive: true,
                    customRate: customRateVal,
                })),
                skipDuplicates: true,
            }));
        }
        if (toUpdate.length > 0) {
            operations.push(this.prisma.professionalService.updateMany({
                where: {
                    professionalId: professional.id,
                    categoryId: { in: toUpdate },
                },
                data: {
                    isActive: true,
                    ...(dto.customRate !== undefined ? { customRate: customRateVal } : {}),
                },
            }));
        }
        if (operations.length > 0) {
            await Promise.all(operations);
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
    async getMyServices(userId) {
        const professional = await this.prisma.professional.findUnique({
            where: { userId },
        });
        if (!professional) {
            throw new common_1.NotFoundException('Professional profile not found');
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
    async submitKyc(userId, dto) {
        const professional = await this.prisma.professional.findUnique({
            where: { userId },
        });
        if (!professional) {
            throw new common_1.NotFoundException('Professional profile not found');
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
                    status: client_1.KycStatus.PENDING,
                    rejectionReason: null,
                },
            });
        }
        else {
            kycDoc = await this.prisma.kycDocument.create({
                data: {
                    professionalId: professional.id,
                    documentType: dto.documentType,
                    documentNumber: dto.documentNumber,
                    documentUrl: dto.documentUrl,
                    status: client_1.KycStatus.PENDING,
                },
            });
        }
        await this.prisma.professional.update({
            where: { id: professional.id },
            data: { kycStatus: client_1.KycStatus.PENDING },
        });
        this.logger.log(`[KYC] Document ${dto.documentType} submitted for professional ${professional.id}`);
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
    calculateDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
                Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10;
    }
    formatProfile(professional, distance) {
        const reviews = (professional.reviewsReceived || []).map((r) => ({
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
            name: professional.user?.name ||
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
                ? professional.services.map((s) => ({
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
                ? professional.kycDocuments.map((doc) => ({
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
};
exports.ProfessionalsService = ProfessionalsService;
exports.ProfessionalsService = ProfessionalsService = ProfessionalsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfessionalsService);
//# sourceMappingURL=professionals.service.js.map