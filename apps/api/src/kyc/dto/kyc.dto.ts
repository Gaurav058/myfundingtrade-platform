import { IsEnum, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitKycDto {
  @ApiProperty({ example: 'PASSPORT' })
  @IsString()
  @MaxLength(50)
  documentType: string;

  @ApiProperty({ example: 'AB1234567' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  documentNumber: string;

  @ApiProperty({ example: 'https://s3.example.com/doc-front.jpg' })
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  documentFrontUrl: string;

  @ApiPropertyOptional({ example: 'https://s3.example.com/doc-back.jpg' })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  documentBackUrl?: string;

  @ApiPropertyOptional({ example: 'https://s3.example.com/selfie.jpg' })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  selfieUrl?: string;
}

export class ReviewKycDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  decision: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
