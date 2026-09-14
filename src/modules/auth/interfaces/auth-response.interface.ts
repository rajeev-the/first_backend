import { UserRole, UserStatus } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserProfileResponse {
  id: string;
  phone: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  isNewUser?: boolean;
  professional?: {
    id: string;
    businessName: string | null;
    isOnline: boolean;
    isVerified: boolean;
    kycStatus: string;
    rating: number;
    experienceYears: number;
    visitingCharge: number;
  } | null;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: UserProfileResponse;
}

export interface SendOtpResponse {
  phone: string;
  expiresInSeconds: number;
  message: string;
  debugOtp?: string;
}
