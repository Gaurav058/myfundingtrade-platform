import { IsEnum, IsOptional, IsString } from 'class-validator';

export class SubmitKycDto {
  @IsString()
  documentType: string;

  @IsString()
  documentNumber: string;

  @IsString()
  documentFrontUrl: string;

  @IsOptional()
  @IsString()
  documentBackUrl?: string;

  @IsOptional()
  @IsString()
  selfieUrl?: string;
}

export class ReviewKycDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  decision: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
