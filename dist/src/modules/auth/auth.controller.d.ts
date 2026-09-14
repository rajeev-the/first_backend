import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthResponse, AuthTokens, SendOtpResponse, UserProfileResponse } from './interfaces/auth-response.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendOtp(dto: SendOtpDto): Promise<SendOtpResponse>;
    verifyOtp(dto: VerifyOtpDto): Promise<AuthResponse>;
    refresh(dto: RefreshTokenDto): Promise<AuthTokens>;
    logout(user: JwtPayload): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(userId: string): Promise<UserProfileResponse>;
}
