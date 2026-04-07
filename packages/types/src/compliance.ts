import type {
  KycStatus,
  KycDocumentType,
  LegalDocumentType,
  RestrictionType,
} from './enums';

export interface KycSubmission {
  id: string;
  userId: string;
  status: KycStatus;
  documentType: KycDocumentType;
  documentFrontUrl: string | null;
  documentBackUrl: string | null;
  selfieUrl: string | null;
  proofOfAddressUrl: string | null;
  fullName: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  documentNumber: string | null;
  documentExpiry: string | null;
  submittedAt: string | null;
  expiresAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KycReview {
  id: string;
  submissionId: string;
  reviewerId: string;
  decision: KycStatus;
  reason: string | null;
  internalNote: string | null;
  createdAt: string;
}

export interface LegalDocument {
  id: string;
  type: LegalDocumentType;
  version: string;
  title: string;
  content: string;
  effectiveAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LegalConsent {
  id: string;
  userId: string;
  documentId: string;
  ipAddress: string;
  userAgent: string;
  consentedAt: string;
}

export interface GeoRestriction {
  id: string;
  countryCode: string;
  countryName: string;
  type: RestrictionType;
  reason: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformRestriction {
  id: string;
  key: string;
  isEnabled: boolean;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
