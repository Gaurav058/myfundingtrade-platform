import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsArray, IsUUID } from 'class-validator';

const LEGAL_TYPES = [
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
  'RISK_DISCLOSURE',
  'REFUND_POLICY',
  'COOKIE_POLICY',
  'AML_POLICY',
  'AFFILIATE_AGREEMENT',
] as const;

export class CreateLegalDocumentDto {
  @IsString()
  title: string;

  @IsEnum(LEGAL_TYPES)
  type: string;

  @IsString()
  version: string;

  @IsString()
  content: string;

  @IsDateString()
  effectiveAt: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLegalDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  effectiveAt?: string;
}

export class RecordConsentDto {
  @IsUUID()
  documentId: string;
}

export class BulkConsentDto {
  @IsArray()
  @IsUUID('4', { each: true })
  documentIds: string[];
}

export class CookieConsentDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  sessionId: string;

  @IsOptional()
  @IsBoolean()
  analytics?: boolean;

  @IsOptional()
  @IsBoolean()
  marketing?: boolean;
}
