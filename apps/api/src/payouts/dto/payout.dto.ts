import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RequestPayoutDto {
  @IsString()
  traderAccountId: string;

  @IsNumber()
  @Min(1)
  requestedAmount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentDetails?: string;
}

export class ReviewPayoutDto {
  @IsString()
  decision: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;
}
