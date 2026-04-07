import { IsString, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackClickDto {
  @ApiProperty({ description: 'Affiliate referral code' })
  @IsString()
  code: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  referrerUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  landingUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  utmSource?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  utmMedium?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  utmCampaign?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  fingerprint?: string;
}

export class RequestCommissionPayoutDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  payoutMethod?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  note?: string;
}

export class UpdateAffiliateStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'SUSPENDED', 'TERMINATED'] })
  @IsIn(['ACTIVE', 'SUSPENDED', 'TERMINATED'])
  status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
}

export class UpdateCommissionRateDto {
  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate: number;
}

export class ReviewConversionDto {
  @ApiProperty({ enum: ['CONFIRMED', 'REJECTED'] })
  @IsIn(['CONFIRMED', 'REJECTED'])
  decision: 'CONFIRMED' | 'REJECTED';

  @ApiPropertyOptional() @IsOptional() @IsString()
  reason?: string;
}

export class ReviewCommissionPayoutDto {
  @ApiProperty({ enum: ['APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED'] })
  @IsIn(['APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED'])
  decision: 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

  @ApiPropertyOptional() @IsOptional() @IsString()
  note?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  transactionRef?: string;
}
