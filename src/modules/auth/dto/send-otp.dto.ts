import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { UserRole } from '@prisma/client';

export class SendOtpDto {
  @ApiProperty({
    description: 'User phone number with optional country code or 10-digit standard format',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/, {
    message: 'Please provide a valid phone number format',
  })
  phone!: string;

  @ApiPropertyOptional({
    description: 'Target role when requesting OTP (defaults to CUSTOMER if user is new)',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be CUSTOMER, PROFESSIONAL, or ADMIN' })
  role?: UserRole;
}
