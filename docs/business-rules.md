# Business Rules – MyFundingTrade Platform

> **Package:** `@myfundingtrade/business-rules`  
> **Location:** `packages/business-rules/`  
> **Pattern:** Pure TypeScript functions — no framework, no database, no side-effects.

Every rule function returns a `RuleResult`:

```ts
{ allowed: boolean; reason?: string; code?: string }
```

---

## 1. Purchase Flow (`purchase.ts`)

| Rule | Function | Key Checks |
|------|----------|------------|
| **Can user buy a challenge?** | `canPurchase()` | User status ACTIVE, email verified, country not blocked, required legal consents accepted (TOS, Privacy, Risk Disclosure, Refund Policy) |
| **Order transitions** | `canTransitionOrder(from, to)` | Validated against `ORDER_TRANSITIONS` state map |
| **Coupon validation** | `validateCoupon()` | Active, within date range, usage limit, per-user limit, min order amount |
| **Discount calculation** | `computeDiscount()` | Percentage capped at 50%, fixed amount capped at subtotal |

### Order State Machine

```
DRAFT → PENDING_PAYMENT → PAID → FULFILLED
  ↓                        ↓        ↓
CANCELLED              REFUNDED  REFUNDED
                       DISPUTED  DISPUTED
```

---

## 2. Evaluation Engine (`evaluation.ts`)

| Rule | Function | Details |
|------|----------|---------|
| **Phase evaluation** | `evaluatePhase()` | Evaluates metrics against rule-set thresholds (profit target, drawdown, trading days, calendar days, inactivity) |
| **Phase transitions** | `canTransitionPhase()` | Validated against `PHASE_TRANSITIONS` state map |
| **Next phase** | `getNextPhase()` | PHASE_1 → PHASE_2 (if 2-phase plan) or FUNDED |

### Verdict Priority (highest to lowest)

1. `FAILED_DAILY_LOSS` — daily drawdown exceeded
2. `FAILED_TOTAL_LOSS` — total drawdown exceeded  
3. `FAILED_TIME_LIMIT` — calendar day limit exceeded
4. `FAILED_INACTIVITY` — no trades for N days
5. `PASSED` — profit target met + minimum trading days
6. `IN_PROGRESS` — still evaluating

### Input Thresholds (from Rule Set)

- `profitTargetPct` — e.g. 10% for Phase 1
- `maxDailyLossPct` — e.g. 5%
- `maxTotalLossPct` — e.g. 10%
- `minTradingDays` — e.g. 5
- `maxCalendarDays` — e.g. 30 (null = unlimited)
- `maxInactivityDays` — e.g. 30 (default constant)

---

## 3. Account Lifecycle (`lifecycle.ts`)

| Rule | Function | Details |
|------|----------|---------|
| **Account transitions** | `canTransitionAccount()` | Validated against `ACCOUNT_TRANSITIONS` map |
| **Terminal check** | `isAccountTerminal()` | BREACHED or CLOSED |
| **Can trade?** | `canTrade()` | Only ACTIVE or FUNDED |
| **Activation from provisioning** | `canActivateAccount()` | PROVISIONING + platform provisioned + login assigned |
| **Funded activation** | `canActivateFunded()` | PASSED + all phases passed + KYC approved |
| **Status after phase pass** | `statusAfterPhasePass()` | Last phase → PASSED; otherwise → ACTIVE |
| **Status after phase fail** | `statusAfterPhaseFail()` | Always → BREACHED |

### Account State Machine

```
PROVISIONING → ACTIVE → PASSED → FUNDED
                 ↓                  ↓
              BREACHED           BREACHED
                 ↓                  ↓
              CLOSED              CLOSED
              
ACTIVE ↔ SUSPENDED
FUNDED ↔ SUSPENDED
```

---

## 4. KYC Requirements (`kyc.ts`)

| Rule | Function | Details |
|------|----------|---------|
| **Is KYC required?** | `isKycRequired()` | Required when account is PASSED or FUNDED |
| **Is KYC valid?** | `isKycValid()` | APPROVED + approved within 365 days |
| **Action gating** | `checkKycForAction()` | Blocks payout/funded actions if KYC not approved/valid |
| **Can submit documents?** | `canSubmitKyc()` | Blocked if already APPROVED or UNDER_REVIEW |
| **Required documents** | `getRequiredKycDocuments()` | GOVERNMENT_ID, PROOF_OF_ADDRESS, SELFIE |

### KYC State Machine

```
NOT_STARTED → PENDING_DOCUMENTS → UNDER_REVIEW → APPROVED → EXPIRED
                                       ↓                       ↓
                                   REJECTED → RESUBMISSION_REQUIRED
                                                       ↓
                                              PENDING_DOCUMENTS
```

---

## 5. Payout Eligibility (`payout.ts`)

| Rule | Function | Details |
|------|----------|---------|
| **Can request payout?** | `canRequestPayout()` | FUNDED + KYC approved + 14-day wait + $50 min profit + no pending payouts + has payout method |
| **Profit split** | `calculatePayoutSplit()` | Default 80/20 (trader/company), configurable |
| **Initial status** | `determineInitialPayoutStatus()` | PENDING_APPROVAL if KYC approved, else PENDING_KYC |
| **Payout transitions** | `canTransitionPayout()` | State map validated |
| **Active check** | `isPayoutActive()` | DRAFT, PENDING_KYC, PENDING_APPROVAL, APPROVED, PROCESSING |

### Constants

- First payout wait: **14 days** after funded
- Minimum payout: **$50**
- Max concurrent pending payouts: **1** per account
- Default profit split: **80%** trader

---

## 6. Affiliate Tracking (`affiliate.ts`)

| Rule | Function | Details |
|------|----------|---------|
| **Can earn commission?** | `canEarnCommission()` | Affiliate must be ACTIVE |
| **Conversion eligibility** | `canCreateConversion()` | Active affiliate + paid order + not self-referral |
| **Commission calculation** | `calculateCommission()` | Default 10% of order amount |
| **Confirm conversion** | `canConfirmConversion()` | PENDING conversion + order not refunded |
| **Commission payout** | `canRequestCommissionPayout()` | Active + 1+ confirmed conversions + balance > 0 + 30-day cooldown |

### Constants

- Default commission rate: **10%**
- Payout cooldown: **30 days**
- Minimum conversions for payout: **1**

---

## 7. Geo & Platform Restrictions (`restrictions.ts`)

| Rule | Function | Details |
|------|----------|---------|
| **Country blocked?** | `isCountryBlocked()` | Case-insensitive country code check |
| **Platform access** | `canAccessPlatform()` | Checks both user country and IP country |
| **Feature enabled?** | `isFeatureEnabled()` | Feature not in disabled list |
| **Purchase from country** | `canPurchaseFromCountry()` | Country not in blocked list |

---

## 8. Legal Compliance (`compliance.ts`)

| Rule | Function | Details |
|------|----------|---------|
| **Required consents** | `getRequiredConsents(action)` | Returns required consent types by action |
| **Missing consents** | `getMissingConsents()` | Returns list of unaccepted consents |
| **Consent gate** | `hasRequiredConsents()` | RuleResult — blocks if any missing |

### Required Consents by Action

| Action | Required Consents |
|--------|------------------|
| **Purchase** | Terms of Service, Privacy Policy, Risk Disclosure, Refund Policy |
| **Payout** | Terms of Service, AML Policy |
| **Affiliate** | Affiliate Agreement |

---

## 9. Support Workflows (`support.ts`)

| Rule | Function | Details |
|------|----------|---------|
| **Ticket transitions** | `canTransitionTicket()` | State map validated |
| **Can reply?** | `canReplyToTicket()` | Blocked for CLOSED; staff blocked for RESOLVED |
| **Status after reply** | `statusAfterReply()` | Staff → WAITING_CUSTOMER; Customer → OPEN |
| **Can close?** | `canCloseTicket()` | Cannot re-close a CLOSED ticket |
| **Priority suggestion** | `suggestPriority()` | URGENT for breach keywords, HIGH for KYC/payout, MEDIUM default |

---

## 10. Audit Requirements (`audit.ts`)

| Rule | Function | Details |
|------|----------|---------|
| **Requires audit?** | `requiresAudit(action)` | Returns true for mandatory audit actions |
| **Mandatory actions** | `getMandatoryAuditActions()` | ORDER_PAID, ORDER_REFUNDED, ACCOUNT_BREACHED, ACCOUNT_FUNDED, KYC_APPROVED/REJECTED, PAYOUT_APPROVED/REJECTED/COMPLETED, ADMIN_LOGIN, SETTINGS_CHANGED, USER_SUSPENDED, USER_BANNED |
| **Build entry** | `buildAuditEntry()` | Creates well-formed AuditEntry with timestamp |

---

## Architecture Decisions

1. **Pure functions** — No async, no database, no framework dependency. Can be used in API, frontend, or worker.
2. **RuleResult pattern** — Functions return `{ allowed, reason, code }` instead of throwing. Callers decide how to handle denial.
3. **State transition maps** — Declared as `Record<Status, readonly Status[]>` for deterministic, testable state machines.
4. **Constants as single source of truth** — All magic numbers in `constants.ts`. Change once, reflected everywhere.
5. **Composable** — Rules can be chained: check `canRequestPayout` → then `checkKycForAction` → then `hasRequiredConsents('payout')`.
