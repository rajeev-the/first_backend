import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  AuthResponse,
  AuthTokens,
  SendOtpResponse,
  UserProfileResponse,
} from './interfaces/auth-response.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🌐 [PUBLIC] Request Phone OTP',
    description: '🌐 **Access:** Public (No authentication required)\n\nGenerates and sends an OTP to the given phone number (mock OTP "1234" in development).',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP dispatched successfully',
  })
  async sendOtp(@Body() dto: SendOtpDto): Promise<SendOtpResponse> {
    return this.authService.sendOtp(dto);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🌐 [PUBLIC] Verify Phone OTP & Authenticate',
    description: '🌐 **Access:** Public\n\nVerifies OTP, automatically registers or logs in the user, and returns JWT tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful with JWT tokens and user profile',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
  })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthResponse> {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🌐 [PUBLIC] Refresh Access Token',
    description: '🌐 **Access:** Public (Requires valid Refresh Token)\n\nIssues a new pair of access and refresh tokens using a valid refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens rotated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token / session',
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refreshToken(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔒 [ALL USERS] Log out current session',
    description: '🔒 **Required Role:** Any Authenticated User (`CUSTOMER`, `PROFESSIONAL`, `ADMIN`)\n\nInvalidates the current session in Redis, making the access token unusable.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async logout(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: boolean; message: string }> {
    return this.authService.logout(user.sub, user.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔒 [ALL USERS] Get current authenticated user profile',
    description: '🔒 **Required Role:** Any Authenticated User (`CUSTOMER`, `PROFESSIONAL`, `ADMIN`)\n\nReturns profile details for the authenticated user and professional info if applicable.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile returned',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMe(@CurrentUser('sub') userId: string): Promise<UserProfileResponse> {
    return this.authService.getMe(userId);
  }
}
