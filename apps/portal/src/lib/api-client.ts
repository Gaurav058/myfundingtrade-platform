/* ──────────────────────────────────────────────
 * API client — real HTTP calls to NestJS backend
 * ────────────────────────────────────────────── */

import type {
  UserWithProfile,
  TraderAccount,
  TraderAccountPhase,
  Order,
  KycSubmission,
  PayoutRequest,
  PayoutMethod,
  AffiliateAccount,
  AffiliateConversion,
  AffiliateClick,
  CommissionPayout,
  SupportTicket,
  SupportMessage,
  Notification,
  LegalConsent,
  LegalDocument,
  ApiResponse,
} from "@myfundingtrade/types";

import { getAccessToken, setAccessToken } from "./auth";
import { removeStoredToken } from "./auth-store";

const API_BASE = "/api/v1";

// ── HTTP Transport ─────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) { setAccessToken(null); return null; }
      const json = await res.json();
      const token = json.data?.accessToken ?? json.accessToken;
      setAccessToken(token);
      return token as string;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  // Don't set Content-Type for FormData — browser handles it
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // Auto-refresh on 401
  if (res.status === 401 && !isRefreshing) {
    const newToken = await refreshToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: "include",
      });
    }
  }

  if (res.status === 401) {
    setAccessToken(null);
    removeStoredToken();
    if (typeof window !== "undefined") {
      document.cookie = "session=; path=/; max-age=0";
      window.location.href = "/login";
    }
    return { success: false, error: "Session expired" };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.message || body.error || `Request failed (${res.status})` };
  }

  // Handle 204 No Content
  if (res.status === 204) return { success: true, data: undefined as T };

  const json = await res.json();
  // Unwrap the API envelope { success, data } if present
  const unwrapped = json.data ?? json;
  // Add totalPages for paginated responses
  if (unwrapped && typeof unwrapped === 'object' && 'items' in unwrapped && 'total' in unwrapped && 'pageSize' in unwrapped) {
    unwrapped.totalPages = Math.ceil(unwrapped.total / unwrapped.pageSize);
  }
  return { success: true, data: unwrapped };
}

// ── Auth helpers ───────────────────────────────
export async function forgotPassword(email: string): Promise<ApiResponse<void>> {
  return apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

// ── User ───────────────────────────────────────
export async function getMe(): Promise<ApiResponse<UserWithProfile>> {
  return apiFetch("/auth/me");
}

export async function updateProfile(data: Partial<UserWithProfile["profile"]>): Promise<ApiResponse<UserWithProfile>> {
  return apiFetch("/profiles/me", { method: "PATCH", body: JSON.stringify(data) });
}

// Helper: unwrap paginated { items } responses into arrays
async function apiFetchList<T>(path: string, options?: RequestInit): Promise<ApiResponse<T[]>> {
  const res = await apiFetch<any>(path, options);
  if (!res.success) return res;
  const data = res.data;
  return { success: true, data: Array.isArray(data) ? data : (data?.items ?? []) };
}

// ── Accounts ───────────────────────────────────
export async function getAccounts(): Promise<ApiResponse<TraderAccount[]>> {
  return apiFetchList("/trader-accounts");
}

export async function getAccount(id: string): Promise<ApiResponse<TraderAccount>> {
  return apiFetch(`/trader-accounts/${id}`);
}

export async function getAccountPhases(accountId: string): Promise<ApiResponse<TraderAccountPhase[]>> {
  return apiFetch(`/trader-accounts/${accountId}/status`);
}

// ── KYC ────────────────────────────────────────
export async function getKycStatus(): Promise<ApiResponse<KycSubmission>> {
  return apiFetch("/kyc/status");
}

export async function submitKyc(formData: FormData): Promise<ApiResponse<KycSubmission>> {
  return apiFetch("/kyc/submit", { method: "POST", body: formData });
}

// ── Payouts ────────────────────────────────────
export async function getPayouts(): Promise<ApiResponse<PayoutRequest[]>> {
  return apiFetchList("/payouts");
}

export async function getPayoutMethods(): Promise<ApiResponse<PayoutMethod[]>> {
  return apiFetch("/profiles/me").then((res) => {
    // Payout methods are stored on the profile; adapt shape
    if (res.success && res.data) {
      return { success: true, data: (res.data as any).payoutMethods ?? [] } as ApiResponse<PayoutMethod[]>;
    }
    return { success: false, error: res.error } as ApiResponse<PayoutMethod[]>;
  });
}

export async function requestPayout(data: { traderAccountId: string; amount: number; payoutMethod?: string }) {
  return apiFetch("/payouts/request", { method: "POST", body: JSON.stringify(data) });
}

// ── Affiliate ──────────────────────────────────
export async function getAffiliateAccount(): Promise<ApiResponse<AffiliateAccount>> {
  return apiFetch("/affiliates/dashboard");
}

export async function getAffiliateConversions(): Promise<ApiResponse<AffiliateConversion[]>> {
  return apiFetchList("/affiliates/conversions");
}

export async function getAffiliateClicks(): Promise<ApiResponse<AffiliateClick[]>> {
  return apiFetchList("/affiliates/clicks");
}

export async function getAffiliatePayouts(): Promise<ApiResponse<CommissionPayout[]>> {
  return apiFetchList("/affiliates/payouts");
}

export async function requestAffiliatePayout(data: { payoutMethod?: string; note?: string }) {
  return apiFetch("/affiliates/payouts", { method: "POST", body: JSON.stringify(data) });
}

// ── Support ────────────────────────────────────
export async function getTickets(): Promise<ApiResponse<SupportTicket[]>> {
  return apiFetchList("/tickets");
}

export async function getTicketMessages(ticketId: string): Promise<ApiResponse<SupportMessage[]>> {
  return apiFetch(`/tickets/${ticketId}`).then((res) => {
    if (res.success && res.data) {
      const ticket = res.data as any;
      return { success: true, data: ticket.messages ?? [] } as ApiResponse<SupportMessage[]>;
    }
    return { success: false, error: res.error } as ApiResponse<SupportMessage[]>;
  });
}

export async function createTicket(data: { subject: string; category: string; body: string }) {
  return apiFetch("/tickets", { method: "POST", body: JSON.stringify(data) });
}

export async function replyToTicket(ticketId: string, body: string) {
  return apiFetch(`/tickets/${ticketId}/reply`, { method: "POST", body: JSON.stringify({ body }) });
}

// ── Orders & Checkout ──────────────────────────
export async function createOrder(data: { variantId: string; couponCode?: string; affiliateCode?: string }): Promise<ApiResponse<Order>> {
  return apiFetch("/orders", { method: "POST", body: JSON.stringify(data) });
}

export async function initiateCheckout(orderId: string) {
  return apiFetch<{ checkoutUrl: string; sessionId: string }>("/payments/checkout", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}

export async function getOrders(): Promise<ApiResponse<Order[]>> {
  return apiFetchList("/orders");
}

export async function getOrder(id: string): Promise<ApiResponse<Order>> {
  return apiFetch(`/orders/${id}`);
}

export async function cancelOrder(id: string) {
  return apiFetch(`/orders/${id}/cancel`, { method: "POST" });
}

// ── Notifications ──────────────────────────────
export async function getNotifications(): Promise<ApiResponse<Notification[]>> {
  return apiFetchList("/notifications");
}

export async function markNotificationRead(id: string) {
  return apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
}

// ── Legal ──────────────────────────────────────
export async function getLegalDocuments(): Promise<ApiResponse<LegalDocument[]>> {
  return apiFetchList("/legal");
}

export async function getLegalConsents(): Promise<ApiResponse<LegalConsent[]>> {
  return apiFetchList("/legal/consent");
}

export async function recordConsent(documentId: string): Promise<ApiResponse<{ id: string }>> {
  return apiFetch("/legal/consent", { method: "POST", body: JSON.stringify({ documentId }) });
}

export async function recordBulkConsent(documentIds: string[]): Promise<ApiResponse<{ count: number }>> {
  return apiFetch("/legal/consent/bulk", { method: "POST", body: JSON.stringify({ documentIds }) });
}

export async function getPendingConsents(): Promise<ApiResponse<LegalDocument[]>> {
  return apiFetch("/legal/consent/pending");
}

// ── Challenge Plans (public) ───────────────────
export async function getChallengePlans() {
  return apiFetch("/challenge-plans");
}

export async function getChallengeVariants(planId: string) {
  return apiFetch(`/challenge-plans/variants/${planId}`);
}

// ── Coupons (validate) ─────────────────────────
export async function validateCoupon(code: string, amount?: number) {
  const q = amount ? `?amount=${amount}` : "";
  return apiFetch(`/coupons/validate/${encodeURIComponent(code)}${q}`);
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
  // Composed from real endpoints on the client side
  const [accountsRes, payoutsRes] = await Promise.all([getAccounts(), getPayouts()]);
  const accounts = accountsRes.data ?? [];
  const payouts = payoutsRes.data ?? [];
  const active = accounts.filter((a) => ["ACTIVE", "FUNDED"].includes(a.status));
  const totalBalance = active.reduce((s, a) => s + Number(a.currentBalance), 0);
  const totalPnl = active.reduce((s, a) => s + (Number(a.currentBalance) - Number(a.startingBalance)), 0);
  const totalPayouts = payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + Number(p.amount), 0);

  return {
    success: true,
    data: {
      totalBalance,
      totalPnl,
      activeAccounts: active.length,
      totalPayouts,
      winRate: 0,
      totalTrades: 0,
    },
  };
}
