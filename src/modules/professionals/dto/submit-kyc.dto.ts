import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { KycDocumentType } from '@prisma/client';

export class SubmitKycDto {
  @ApiProperty({
    description: 'Type of identity or verification document',
    enum: KycDocumentType,
    example: KycDocumentType.AADHAAR,
  })
  @IsEnum(KycDocumentType, {
    message:
      'Document type must be one of: AADHAAR, PAN, DRIVING_LICENSE, PASSPORT, TRADE_LICENSE, CERTIFICATION, PROFILE_PHOTO, OTHER',
  })
  documentType!: KycDocumentType;

  @ApiProperty({
    description: 'Unique document identifier number (e.g. Aadhaar/PAN number)',
    example: '1234-5678-9012',
  })
  @IsString()
  @IsNotEmpty({ message: 'Document number is required' })
  @MaxLength(100, { message: 'Document number cannot exceed 100 characters' })
  documentNumber!: string;

  @ApiProperty({
    description: 'Public URL to the uploaded document image or PDF',
    example: 'https://storage.firstchoose.com/kyc/sharma_aadhaar.pdf',
  })
  @IsUrl({}, { message: 'Document URL must be a valid URL' })
  @IsNotEmpty({ message: 'Document URL is required' })
  documentUrl!: string;
}
