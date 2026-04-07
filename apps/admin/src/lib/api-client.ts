/* ──────────────────────────────────────────────
 * Admin API client — real HTTP calls to NestJS backend
 * ────────────────────────────────────────────── */

import type { ApiResponse } from "@myfundingtrade/types";
import { getAccessToken, setAccessToken } from "./auth";
import { removeStoredToken } from "./auth-store";

const API_BASE = "/api/v1";

// Helper: wrap plain arrays from the API into paginated format
function ensurePaginated<T>(data: any): { items: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  if (Array.isArray(data)) {
    return { items: data as T[], total: data.length, page: 1, pageSize: data.length || 1, totalPages: 1 };
  }
  return data;
}

// ── HTTP Transport ─────────────────────────────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });

  if (res.status === 401 && !isRefreshing) {
    const newToken = await doRefresh();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });
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

// ── Users ───────────────────────────────────────────────────────────────

export async function getUsers(page?: number) {
  const q = page ? `?page=${page}` : "";
  return apiFetch(`/users${q}`);
}
export async function getUser(id: string) { return apiFetch(`/users/${id}`); }
export async function updateUserStatus(id: string, status: string) {
  return apiFetch(`/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// ── Challenge Plans & Rules ─────────────────────────────────────────────

export async function getPlans(page?: number) {
  const q = page ? `?page=${page}` : "";
  const res = await apiFetch(`/challenge-plans${q}`);
  if (res.success && res.data) res.data = ensurePaginated(res.data);
  return res;
}
export async function getPlan(id: string) { return apiFetch(`/challenge-plans/${id}`); }
export async function getRuleSets() { return apiFetch("/rules"); }
export async function getRuleSet(id: string) { return apiFetch(`/rules/${id}`); }
export async function getVariants(planId?: string) {
  return planId
    ? apiFetch(`/challenge-plans/variants/${planId}`)
    : apiFetch("/challenge-plans");
}

// ── Orders & Payments ───────────────────────────────────────────────────

export async function getOrders(page?: number) {
  const q = page ? `?page=${page}` : "";
  return apiFetch(`/orders/admin/list${q}`);
}
export async function getOrder(id: string) { return apiFetch(`/orders/${id}`); }
export async function getPayments(page?: number) {
  const q = page ? `?page=${page}` : "";
  return apiFetch(`/payments/admin/list${q}`);
}
export async function getPayment(id: string) { return apiFetch(`/payments/admin/${id}`); }
export async function refundPayment(id: string, amount?: number) {
  return apiFetch(`/payments/${id}/refund`, { method: "POST", body: JSON.stringify({ amount }) });
}

// ── Coupons ─────────────────────────────────────────────────────────────

export async function getCoupons(page?: number) {
  const q = page ? `?page=${page}` : "";
  const res = await apiFetch(`/coupons${q}`);
  if (res.success && res.data) res.data = ensurePaginated(res.data);
  return res;
}

// ── Trader Accounts ─────────────────────────────────────────────────────

export async function getAccounts(page?: number) {
  const q = page ? `?page=${page}` : "";
  return apiFetch(`/trader-accounts/admin${q}`);
}
export async function getAccount(id: string) { return apiFetch(`/trader-accounts/${id}`); }

// ── KYC ─────────────────────────────────────────────────────────────────

export async function getKycSubmissions(page?: number) {
  const q = page ? `?page=${page}` : "";
  return apiFetch(`/kyc/admin${q}`);
}
export async function getKycSubmission(id: string) { return apiFetch(`/kyc/admin/${id}`); }
export async function reviewKyc(submissionId: string, decision: string, reason: string) {
  return apiFetch(`/kyc/${submissionId}/review`, {
    method: "POST",
    body: JSON.stringify({ decision, reason }),
  });
}

// ── Payouts ─────────────────────────────────────────────────────────────

export async function getPayoutRequests(page?: number) {
  const q = page ? `?page=${page}` : "";
  return apiFetch(`/payouts/admin${q}`);
}
export async function reviewPayout(id: string, action: "APPROVED" | "REJECTED", note: string) {
  return apiFetch(`/payouts/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ action, note }),
  });
}

// ── Affiliates ──────────────────────────────────────────────────────────

export async function getAffiliates(page?: number) {
  const q = page ? `?page=${page}` : "";
  return apiFetch(`/affiliates/admin${q}`);
}
export async function getAffiliateConversions(affId: string) {
  return apiFetch(`/affiliates/admin/${affId}/conversions`);
}
export async function getCommissionPayouts(affId: string) {
  return apiFetch(`/affiliates/admin/${affId}/payouts`);
}
export async function getAffiliateClicks(affId: string) {
  return apiFetch(`/affiliates/admin/${affId}/clicks`);
}
export async function updateAffiliateStatus(id: string, status: string) {
  return apiFetch(`/affiliates/admin/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}
export async function updateAffiliateRate(id: string, commissionRate: number) {
  return apiFetch(`/affiliates/admin/${id}/rate`, { method: "PATCH", body: JSON.stringify({ commissionRate }) });
}
export async function reviewAffiliateConversion(id: string, decision: string, reason?: string) {
  return apiFetch(`/affiliates/admin/conversions/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ decision, reason }),
  });
}
export async function reviewCommissionPayout(id: string, decision: string, note?: string, transactionRef?: string) {
  return apiFetch(`/affiliates/admin/payouts/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ decision, note, transactionRef }),
  });
}
export async function getAffiliateFraudSignals(affiliateId?: string) {
  const q = affiliateId ? `?affiliateId=${affiliateId}` : "";
  return apiFetch(`/affiliates/admin/fraud-signals${q}`);
}

// ── Support ─────────────────────────────────────────────────────────────

export async function getTickets(page?: number) {
  const q = page ? `?page=${page}` : "";
  return apiFetch(`/tickets/admin${q}`);
}
export async function getTicket(id: string) { return apiFetch(`/tickets/${id}`); }
export async function replyToTicket(ticketId: string, body: string, isInternal: boolean) {
  return apiFetch(`/tickets/${ticketId}/admin-reply`, {
    method: "POST",
    body: JSON.stringify({ body, isInternal }),
  });
}
export async function updateTicketStatus(ticketId: string, status: string) {
  return apiFetch(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ── Content ─────────────────────────────────────────────────────────────

export async function getBlogPosts(page?: number) {
  const q = page ? `?page=${page}` : "";
  return apiFetch(`/blog/admin/all${q}`);
}
export async function getBlogPost(id: string) { return apiFetch(`/blog/${id}`); }
export async function getBlogCategories() { return apiFetch("/blog/categories"); }
export async function createBlogPost(data: Record<string, unknown>) {
  return apiFetch("/blog", { method: "POST", body: JSON.stringify(data) });
}
export async function updateBlogPost(id: string, data: Record<string, unknown>) {
  return apiFetch(`/blog/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteBlogPost(id: string) {
  return apiFetch(`/blog/${id}`, { method: "DELETE" });
}
export async function createBlogCategory(data: Record<string, unknown>) {
  return apiFetch("/blog/categories", { method: "POST", body: JSON.stringify(data) });
}
export async function updateBlogCategory(id: string, data: Record<string, unknown>) {
  return apiFetch(`/blog/categories/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteBlogCategory(id: string) {
  return apiFetch(`/blog/categories/${id}`, { method: "DELETE" });
}

export async function getFaqs(page?: number) {
  const q = page ? `?page=${page}` : "";
  return apiFetch(`/faq/admin${q}`);
}
export async function createFaq(data: Record<string, unknown>) {
  return apiFetch("/faq", { method: "POST", body: JSON.stringify(data) });
}
export async function updateFaq(id: string, data: Record<string, unknown>) {
  return apiFetch(`/faq/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteFaq(id: string) {
  return apiFetch(`/faq/${id}`, { method: "DELETE" });
}

export async function getLegalDocuments(page?: number) {
  const q = page ? `?page=${page}` : "";
  const res = await apiFetch(`/legal/admin/all${q}`);
  if (res.success && res.data) res.data = ensurePaginated(res.data);
  return res;
}
export async function createLegalDocument(data: Record<string, unknown>) {
  return apiFetch("/legal", { method: "POST", body: JSON.stringify(data) });
}
export async function updateLegalDocument(id: string, data: Record<string, unknown>) {
  return apiFetch(`/legal/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteLegalDocument(id: string) {
  return apiFetch(`/legal/${id}`, { method: "DELETE" });
}

// ── Restrictions ────────────────────────────────────────────────────────

export async function getGeoRestrictions() {
  const res = await apiFetch("/restrictions/admin/countries");
  if (res.success && res.data && !Array.isArray(res.data) && res.data.items) {
    res.data = res.data.items;
  }
  return res;
}
export async function getPlatformRestrictions() { return apiFetch("/restrictions/platform"); }

// ── Notifications ───────────────────────────────────────────────────────

export async function getNotifications(page?: number) {
  const q = page ? `?page=${page}` : "";
  return apiFetch(`/notifications/admin/list${q}`);
}

// ── Audit Logs ──────────────────────────────────────────────────────────

export async function getAuditLogs(page?: number) {
  const q = page ? `?page=${page}` : "";
  return apiFetch(`/admin/audit-logs${q}`);
}

// ── System Settings ─────────────────────────────────────────────────────

export async function getSettings() { return apiFetch("/system-settings"); }
export async function updateSetting(key: string, value: string) {
  return apiFetch("/system-settings", { method: "POST", body: JSON.stringify({ key, value }) });
}

// ── Dashboard KPIs ──────────────────────────────────────────────────────

export interface DashboardKpis {
  totalUsers: number;
  activeAccounts: number;
  pendingKyc: number;
  pendingPayouts: number;
  openTickets: number;
  revenueThisMonth: number;
  activeAffiliates: number;
  totalOrders: number;
}

export async function getDashboardKpis(): Promise<ApiResponse<DashboardKpis>> {
  const res = await apiFetch<Record<string, any>>("/admin/dashboard");
  if (!res.success || !res.data) return { success: false, error: res.error };
  const d = res.data;
  return {
    success: true,
    data: {
      totalUsers: d.users?.total ?? 0,
      activeAccounts: d.accounts?.active ?? 0,
      pendingKyc: d.pendingKyc ?? 0,
      pendingPayouts: d.pendingPayouts ?? 0,
      openTickets: d.openTickets ?? 0,
      revenueThisMonth: parseFloat(d.revenue) || 0,
      activeAffiliates: d.activeAffiliates ?? 0,
      totalOrders: d.orders?.total ?? 0,
    },
  };
}

// ── Analytics ───────────────────────────────────────────────────────────

export async function getRevenueAnalytics(dateRange?: string) {
  const q = dateRange ? `?dateRange=${dateRange}` : "";
  return apiFetch(`/analytics/revenue${q}`);
}
export async function getUserAnalytics(dateRange?: string) {
  const q = dateRange ? `?dateRange=${dateRange}` : "";
  return apiFetch(`/analytics/users${q}`);
}
export async function getChallengeAnalytics(dateRange?: string) {
  const q = dateRange ? `?dateRange=${dateRange}` : "";
  return apiFetch(`/analytics/challenges${q}`);
}
export async function getPayoutAnalytics(dateRange?: string) {
  const q = dateRange ? `?dateRange=${dateRange}` : "";
  return apiFetch(`/analytics/payouts${q}`);
}
