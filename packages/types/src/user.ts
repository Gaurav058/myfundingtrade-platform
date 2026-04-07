import type { UserRole, AccountStatus } from './enums';

// ── User & Identity ─────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  dateOfBirth: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  postalCode: string | null;
  timezone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  referralCode: string | null;
  referredById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithProfile extends User {
  profile: UserProfile | null;
}

export interface Session {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  fingerprint: string | null;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
}

// ── Auth ─────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ── API Response Wrappers ───────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
