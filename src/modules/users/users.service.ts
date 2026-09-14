import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponse } from '../auth/interfaces/auth-response.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfileResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== existingUser.email) {
      const emailInUse = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (emailInUse) {
        throw new ConflictException('Email address is already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
      },
      include: { professional: true },
    });

    this.logger.log(`[Users] Updated profile for user ${userId}`);

    return {
      id: updatedUser.id,
      phone: updatedUser.phone,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      status: updatedUser.status,
      avatarUrl: updatedUser.avatarUrl,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      professional: updatedUser.professional
        ? {
            id: updatedUser.professional.id,
            businessName: updatedUser.professional.businessName,
            isOnline: updatedUser.professional.isOnline,
            isVerified: updatedUser.professional.isVerified,
            kycStatus: updatedUser.professional.kycStatus,
            rating: Number(updatedUser.professional.rating),
            experienceYears: updatedUser.professional.experienceYears,
            visitingCharge: Number(updatedUser.professional.visitingCharge),
          }
        : null,
    };
  }
}
