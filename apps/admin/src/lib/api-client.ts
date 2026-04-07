import type { ApiResponse, PaginatedResponse } from "@myfundingtrade/types";
import {
  mockUsers, mockPlans, mockRuleSets, mockVariants,
  mockOrders, mockPayments, mockCoupons,
  mockAccounts, mockPhases, mockEvaluations,
  mockKycSubmissions, mockKycReviews,
  mockPayoutRequests,
  mockAffiliates, mockConversions, mockCommissionPayouts, mockAffiliateClicks, mockFraudSignals,
  mockTickets, mockMessages,
  mockBlogPosts, mockBlogCategories, mockFaqs, mockLegalDocs,
  mockGeoRestrictions, mockPlatformRestrictions,
  mockNotifications, mockAuditLogs, mockSettings,
} from "./mock-data";

// ── Helpers ─────────────────────────────────────────────────────────────

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

function paginate<T>(items: T[], page = 1, pageSize = 20): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
}

// ── Auth ────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, _password: string) {
  await delay();
  const user = mockUsers.find((u) => u.email === email && ["SUPER_ADMIN", "FINANCE_ADMIN", "KYC_REVIEWER", "SUPPORT_AGENT", "CONTENT_ADMIN"].includes(u.role));
  if (!user) return { success: false, error: "Invalid credentials" } as ApiResponse;
  return ok({ user, accessToken: "mock_token" });
}

// ── Users ───────────────────────────────────────────────────────────────

export async function getUsers(page?: number) { await delay(); return ok(paginate(mockUsers, page)); }
export async function getUser(id: string) { await delay(); return ok(mockUsers.find((u) => u.id === id)); }
export async function updateUserStatus(id: string, status: string) { await delay(); return ok({ id, status }); }

// ── Challenge Plans & Rules ─────────────────────────────────────────────

export async function getPlans(page?: number) { await delay(); return ok(paginate(mockPlans, page)); }
export async function getPlan(id: string) { await delay(); const plan = mockPlans.find((p) => p.id === id); const variants = mockVariants.filter((v) => v.planId === id); return ok({ plan, variants }); }
export async function getRuleSets() { await delay(); return ok(mockRuleSets); }
export async function getRuleSet(id: string) { await delay(); return ok(mockRuleSets.find((r) => r.id === id)); }
export async function getVariants(planId?: string) { await delay(); return ok(planId ? mockVariants.filter((v) => v.planId === planId) : mockVariants); }

// ── Orders & Payments ───────────────────────────────────────────────────

export async function getOrders(page?: number) { await delay(); return ok(paginate(mockOrders, page)); }
export async function getOrder(id: string) { await delay(); return ok(mockOrders.find((o) => o.id === id)); }
export async function getPayments(page?: number) { await delay(); return ok(paginate(mockPayments, page)); }

// ── Coupons ─────────────────────────────────────────────────────────────

export async function getCoupons(page?: number) { await delay(); return ok(paginate(mockCoupons, page)); }

// ── Trader Accounts ─────────────────────────────────────────────────────

export async function getAccounts(page?: number) { await delay(); return ok(paginate(mockAccounts, page)); }
export async function getAccount(id: string) { await delay(); const acc = mockAccounts.find((a) => a.id === id); const phases = mockPhases.filter((p) => p.traderAccountId === id); const evals = mockEvaluations.filter((e) => phases.some((p) => p.id === e.phaseId)); return ok({ account: acc, phases, evaluations: evals }); }

// ── KYC ─────────────────────────────────────────────────────────────────

export async function getKycSubmissions(page?: number) { await delay(); return ok(paginate(mockKycSubmissions, page)); }
export async function getKycSubmission(id: string) { await delay(); const sub = mockKycSubmissions.find((k) => k.id === id); const reviews = mockKycReviews.filter((r) => r.submissionId === id); return ok({ submission: sub, reviews }); }
export async function reviewKyc(submissionId: string, decision: string, reason: string) { await delay(); return ok({ submissionId, decision, reason }); }

// ── Payouts ─────────────────────────────────────────────────────────────

export async function getPayoutRequests(page?: number) { await delay(); return ok(paginate(mockPayoutRequests, page)); }
export async function reviewPayout(id: string, action: "APPROVED" | "REJECTED", note: string) { await delay(); return ok({ id, action, note }); }

// ── Affiliates ──────────────────────────────────────────────────────────

export async function getAffiliates(page?: number) { await delay(); return ok(paginate(mockAffiliates, page)); }
export async function getAffiliateConversions(affId: string) { await delay(); return ok(mockConversions.filter((c) => c.affiliateId === affId)); }
export async function getCommissionPayouts(affId: string) { await delay(); return ok(mockCommissionPayouts.filter((c) => c.affiliateId === affId)); }
export async function getAffiliateClicks(affId: string) { await delay(); return ok(mockAffiliateClicks.filter((c) => c.affiliateId === affId)); }
export async function updateAffiliateStatus(id: string, status: string) { await delay(); return ok({ id, status }); }
export async function updateAffiliateRate(id: string, commissionRate: number) { await delay(); return ok({ id, commissionRate }); }
export async function reviewAffiliateConversion(id: string, decision: string, reason?: string) { await delay(); return ok({ id, decision, reason }); }
export async function reviewCommissionPayout(id: string, decision: string, note?: string, transactionRef?: string) { await delay(); return ok({ id, decision, note, transactionRef }); }
export async function getAffiliateFraudSignals(affiliateId?: string) { await delay(); return ok(affiliateId ? mockFraudSignals.filter((f) => f.affiliateId === affiliateId) : mockFraudSignals); }

// ── Support ─────────────────────────────────────────────────────────────

export async function getTickets(page?: number) { await delay(); return ok(paginate(mockTickets, page)); }
export async function getTicket(id: string) { await delay(); const ticket = mockTickets.find((t) => t.id === id); const messages = mockMessages.filter((m) => m.ticketId === id); return ok({ ticket, messages }); }
export async function replyToTicket(ticketId: string, body: string, isInternal: boolean) { await delay(); return ok({ ticketId, body, isInternal }); }
export async function updateTicketStatus(ticketId: string, status: string) { await delay(); return ok({ ticketId, status }); }

// ── Content ─────────────────────────────────────────────────────────────

export async function getBlogPosts(page?: number) { await delay(); return ok(paginate(mockBlogPosts, page)); }
export async function getBlogPost(id: string) { await delay(); return ok(mockBlogPosts.find((p) => p.id === id)); }
export async function getBlogCategories() { await delay(); return ok(mockBlogCategories); }
export async function createBlogPost(data: Record<string, unknown>) { await delay(); return ok({ id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() }); }
export async function updateBlogPost(id: string, data: Record<string, unknown>) { await delay(); return ok({ id, ...data }); }
export async function deleteBlogPost(id: string) { await delay(); return ok({ id }); }
export async function createBlogCategory(data: Record<string, unknown>) { await delay(); return ok({ id: crypto.randomUUID(), ...data }); }
export async function updateBlogCategory(id: string, data: Record<string, unknown>) { await delay(); return ok({ id, ...data }); }
export async function deleteBlogCategory(id: string) { await delay(); return ok({ id }); }

export async function getFaqs(page?: number) { await delay(); return ok(paginate(mockFaqs, page)); }
export async function createFaq(data: Record<string, unknown>) { await delay(); return ok({ id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() }); }
export async function updateFaq(id: string, data: Record<string, unknown>) { await delay(); return ok({ id, ...data }); }
export async function deleteFaq(id: string) { await delay(); return ok({ id }); }

export async function getLegalDocuments(page?: number) { await delay(); return ok(paginate(mockLegalDocs, page)); }
export async function createLegalDocument(data: Record<string, unknown>) { await delay(); return ok({ id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() }); }
export async function updateLegalDocument(id: string, data: Record<string, unknown>) { await delay(); return ok({ id, ...data }); }
export async function deleteLegalDocument(id: string) { await delay(); return ok({ id }); }

// ── Restrictions ────────────────────────────────────────────────────────

export async function getGeoRestrictions() { await delay(); return ok(mockGeoRestrictions); }
export async function getPlatformRestrictions() { await delay(); return ok(mockPlatformRestrictions); }

// ── Notifications ───────────────────────────────────────────────────────

export async function getNotifications(page?: number) { await delay(); return ok(paginate(mockNotifications, page)); }

// ── Audit Logs ──────────────────────────────────────────────────────────

export async function getAuditLogs(page?: number) { await delay(); return ok(paginate(mockAuditLogs, page)); }

// ── System Settings ─────────────────────────────────────────────────────

export async function getSettings() { await delay(); return ok(mockSettings); }
export async function updateSetting(id: string, value: string) { await delay(); return ok({ id, value }); }

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
  await delay();
  return ok({
    totalUsers: mockUsers.length,
    activeAccounts: mockAccounts.filter((a) => a.status === "ACTIVE" || a.status === "FUNDED").length,
    pendingKyc: mockKycSubmissions.filter((k) => k.status === "UNDER_REVIEW").length,
    pendingPayouts: mockPayoutRequests.filter((p) => p.status === "PENDING_APPROVAL").length,
    openTickets: mockTickets.filter((t) => ["OPEN", "IN_PROGRESS", "ESCALATED"].includes(t.status)).length,
    revenueThisMonth: mockOrders.filter((o) => o.status === "PAID").reduce((s, o) => s + o.totalAmount, 0),
    activeAffiliates: mockAffiliates.filter((a) => a.status === "ACTIVE").length,
    totalOrders: mockOrders.length,
  });
}
