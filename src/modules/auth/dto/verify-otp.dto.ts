import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { UserRole } from '@prisma/client';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User phone number',
    example: '+919876543210',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/, {
    message: 'Please provide a valid phone number format',
  })
  phone!: string;

  @ApiProperty({
    description: 'One-Time Password received (use 1234 in development)',
    example: '1234',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(4, 6, { message: 'OTP must be between 4 and 6 digits' })
  otp!: string;

  @ApiPropertyOptional({
    description: 'Preferred user role if creating a new account (defaults to CUSTOMER)',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be CUSTOMER, PROFESSIONAL, or ADMIN' })
  role?: UserRole;
}
