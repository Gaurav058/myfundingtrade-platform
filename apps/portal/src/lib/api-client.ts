/* ──────────────────────────────────────────────
 * API client abstraction layer
 * Uses mock adapter now — swap to real HTTP when backend is live
 * ────────────────────────────────────────────── */

import type {
  UserWithProfile,
  TraderAccount,
  TraderAccountPhase,
  KycSubmission,
  PayoutRequest,
  PayoutMethod,
  AffiliateAccount,
  AffiliateConversion,
  SupportTicket,
  SupportMessage,
  Notification,
  LegalConsent,
  LegalDocument,
  ApiResponse,
} from "@myfundingtrade/types";

import {
  mockUser,
  mockAccounts,
  mockPhases,
  mockKyc,
  mockPayouts,
  mockPayoutMethods,
  mockAffiliate,
  mockConversions,
  mockTickets,
  mockMessages,
  mockNotifications,
  mockLegalDocuments,
  mockLegalConsents,
} from "./mock-data";

// Simulate network latency
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

// ── Auth ───────────────────────────────────────
export async function login(_email: string, _password: string) {
  await delay(600);
  return ok({ accessToken: "mock_access_token", refreshToken: "mock_refresh_token" });
}

export async function register(_data: { email: string; password: string; firstName: string; lastName: string }) {
  await delay(600);
  return ok({ accessToken: "mock_access_token", refreshToken: "mock_refresh_token" });
}

export async function forgotPassword(_email: string) {
  await delay(400);
  return ok({ message: "Reset link sent" });
}

// ── User ───────────────────────────────────────
export async function getMe(): Promise<ApiResponse<UserWithProfile>> {
  await delay();
  return ok(mockUser);
}

export async function updateProfile(data: Partial<UserWithProfile["profile"]>) {
  await delay();
  return ok({ ...mockUser, profile: { ...mockUser.profile!, ...data } });
}

// ── Accounts ───────────────────────────────────
export async function getAccounts(): Promise<ApiResponse<TraderAccount[]>> {
  await delay();
  return ok(mockAccounts);
}

export async function getAccount(id: string): Promise<ApiResponse<TraderAccount>> {
  await delay();
  const acc = mockAccounts.find((a) => a.id === id);
  if (!acc) return { success: false, error: "Account not found" };
  return ok(acc);
}

export async function getAccountPhases(accountId: string): Promise<ApiResponse<TraderAccountPhase[]>> {
  await delay();
  return ok(mockPhases.filter((p) => p.traderAccountId === accountId));
}

// ── KYC ────────────────────────────────────────
export async function getKycStatus(): Promise<ApiResponse<KycSubmission>> {
  await delay();
  return ok(mockKyc);
}

export async function submitKyc(_formData: FormData) {
  await delay(800);
  return ok({ ...mockKyc, status: "UNDER_REVIEW" as const });
}

// ── Payouts ────────────────────────────────────
export async function getPayouts(): Promise<ApiResponse<PayoutRequest[]>> {
  await delay();
  return ok(mockPayouts);
}

export async function getPayoutMethods(): Promise<ApiResponse<PayoutMethod[]>> {
  await delay();
  return ok(mockPayoutMethods);
}

export async function requestPayout(_data: { traderAccountId: string; payoutMethodId: string; amount: number }) {
  await delay(600);
  return ok({ id: "pay_new", status: "PENDING_APPROVAL" });
}

// ── Affiliate ──────────────────────────────────
export async function getAffiliateAccount(): Promise<ApiResponse<AffiliateAccount>> {
  await delay();
  return ok(mockAffiliate);
}

export async function getAffiliateConversions(): Promise<ApiResponse<AffiliateConversion[]>> {
  await delay();
  return ok(mockConversions);
}

// ── Support ────────────────────────────────────
export async function getTickets(): Promise<ApiResponse<SupportTicket[]>> {
  await delay();
  return ok(mockTickets);
}

export async function getTicketMessages(ticketId: string): Promise<ApiResponse<SupportMessage[]>> {
  await delay();
  return ok(mockMessages.filter((m) => m.ticketId === ticketId));
}

export async function createTicket(_data: { subject: string; category: string; body: string }) {
  await delay(600);
  return ok({ id: "tkt_new", ticketNumber: "TKT-2026-9999", status: "OPEN" });
}

export async function replyToTicket(_ticketId: string, _body: string) {
  await delay(400);
  return ok({ id: "msg_new" });
}

// ── Notifications ──────────────────────────────
export async function getNotifications(): Promise<ApiResponse<Notification[]>> {
  await delay();
  return ok(mockNotifications);
}

export async function markNotificationRead(id: string) {
  await delay(200);
  return ok({ id, readAt: new Date().toISOString() });
}

// ── Legal ──────────────────────────────────────
export async function getLegalDocuments(): Promise<ApiResponse<LegalDocument[]>> {
  await delay();
  return ok(mockLegalDocuments);
}

export async function getLegalConsents(): Promise<ApiResponse<LegalConsent[]>> {
  await delay();
  return ok(mockLegalConsents);
}

// ── Dashboard KPIs ─────────────────────────────
export interface DashboardKpis {
  totalBalance: number;
  totalPnl: number;
  activeAccounts: number;
  totalPayouts: number;
  winRate: number;
  totalTrades: number;
}

export async function getDashboardKpis(): Promise<ApiResponse<DashboardKpis>> {
  await delay();
  return ok({
    totalBalance: 158800,
    totalPnl: 8800,
    activeAccounts: 2,
    totalPayouts: 4505,
    winRate: 59.3,
    totalTrades: 347,
  });
}
