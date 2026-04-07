// ════════════════════════════════════════════════════════════════════════════
// MyFundingTrade — Database Seed Script
// Generates realistic demo data for development/staging
// Usage: pnpm db:seed
// ════════════════════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────────────────

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOrderNumber(): string {
  const prefix = 'MFT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function generateAccountNumber(): string {
  return `MFT${randomBetween(100000, 999999)}`;
}

function generateTicketNumber(): string {
  return `TKT-${randomBetween(10000, 99999)}`;
}

function generatePayoutNumber(): string {
  return `PAY-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// ── Main Seed ────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── 1. System Settings ──────────────────────────────────────────────────
  console.log('  → System settings');
  const settings = [
    { key: 'platform.name', value: 'MyFundingTrade', dataType: 'string', description: 'Platform display name', isPublic: true },
    { key: 'platform.support_email', value: 'support@myfundingtrade.com', dataType: 'string', description: 'Support email', isPublic: true },
    { key: 'platform.min_payout', value: '50', dataType: 'number', description: 'Minimum payout amount in USD', isPublic: true },
    { key: 'platform.payout_frequency_days', value: '14', dataType: 'number', description: 'Funded payout cycle in days', isPublic: true },
    { key: 'platform.affiliate_default_rate', value: '10', dataType: 'number', description: 'Default affiliate commission %', isPublic: false },
    { key: 'platform.kyc_required_for_funded', value: 'true', dataType: 'boolean', description: 'Require KYC before funding', isPublic: false },
    { key: 'platform.max_concurrent_accounts', value: '3', dataType: 'number', description: 'Max concurrent trader accounts per user', isPublic: true },
    { key: 'trading.default_leverage', value: '100', dataType: 'number', description: 'Default leverage for new accounts', isPublic: true },
  ];
  for (const s of settings) {
    await prisma.systemSetting.upsert({ where: { key: s.key }, update: s, create: s });
  }

  // ── 2. Geo Restrictions ─────────────────────────────────────────────────
  console.log('  → Geo restrictions');
  const blockedCountries = [
    { countryCode: 'US', countryName: 'United States', reason: 'Regulatory restrictions' },
    { countryCode: 'KP', countryName: 'North Korea', reason: 'Sanctions' },
    { countryCode: 'IR', countryName: 'Iran', reason: 'Sanctions' },
    { countryCode: 'SY', countryName: 'Syria', reason: 'Sanctions' },
    { countryCode: 'CU', countryName: 'Cuba', reason: 'Sanctions' },
  ];
  for (const c of blockedCountries) {
    await prisma.geoRestriction.upsert({
      where: { countryCode: c.countryCode },
      update: c,
      create: { ...c, type: 'BLOCKED', isActive: true },
    });
  }

  // ── 3. Legal Documents ──────────────────────────────────────────────────
  console.log('  → Legal documents');
  const legalDocs = [
    { type: 'TERMS_OF_SERVICE' as const, version: '1.0', title: 'Terms of Service', content: 'These are the Terms of Service for MyFundingTrade platform...', effectiveAt: daysAgo(90) },
    { type: 'PRIVACY_POLICY' as const, version: '1.0', title: 'Privacy Policy', content: 'This Privacy Policy describes how MyFundingTrade collects and processes data...', effectiveAt: daysAgo(90) },
    { type: 'RISK_DISCLOSURE' as const, version: '1.0', title: 'Risk Disclosure', content: 'Trading involves substantial risk of loss and is not suitable for every investor...', effectiveAt: daysAgo(90) },
    { type: 'REFUND_POLICY' as const, version: '1.0', title: 'Refund Policy', content: 'Refund requests are evaluated on a case-by-case basis within 14 days of purchase...', effectiveAt: daysAgo(90) },
    { type: 'AML_POLICY' as const, version: '1.0', title: 'Anti-Money Laundering Policy', content: 'MyFundingTrade is committed to preventing money laundering and terrorist financing...', effectiveAt: daysAgo(90) },
    { type: 'AFFILIATE_AGREEMENT' as const, version: '1.0', title: 'Affiliate Agreement', content: 'By joining the MyFundingTrade affiliate program, you agree to...', effectiveAt: daysAgo(60) },
  ];
  const createdLegalDocs = [];
  for (const doc of legalDocs) {
    const ld = await prisma.legalDocument.upsert({
      where: { type_version: { type: doc.type, version: doc.version } },
      update: doc,
      create: doc,
    });
    createdLegalDocs.push(ld);
  }

  // ── 4. Challenge Rule Sets ──────────────────────────────────────────────
  console.log('  → Challenge rule sets');
  const ruleSetStandard = await prisma.challengeRuleSet.create({
    data: {
      name: 'Standard Evaluation Rules',
      profitTargetPct: 10,
      maxDailyLossPct: 5,
      maxTotalLossPct: 10,
      minTradingDays: 5,
      maxCalendarDays: 30,
      maxInactivityDays: 14,
      allowWeekendHolding: false,
      allowNewsTrading: true,
      allowExpertAdvisors: true,
      allowHedging: true,
      allowCopying: false,
      fundedProfitTargetPct: null,
      fundedMaxDailyLossPct: 5,
      fundedMaxTotalLossPct: 10,
    },
  });

  const ruleSetAggressive = await prisma.challengeRuleSet.create({
    data: {
      name: 'Aggressive Evaluation Rules',
      profitTargetPct: 8,
      maxDailyLossPct: 5,
      maxTotalLossPct: 8,
      minTradingDays: 3,
      maxCalendarDays: 60,
      maxInactivityDays: 30,
      allowWeekendHolding: true,
      allowNewsTrading: true,
      allowExpertAdvisors: true,
      allowHedging: true,
      allowCopying: true,
      fundedProfitTargetPct: null,
      fundedMaxDailyLossPct: 5,
      fundedMaxTotalLossPct: 8,
    },
  });

  const ruleSetRapid = await prisma.challengeRuleSet.create({
    data: {
      name: 'Rapid Evaluation Rules',
      profitTargetPct: 12,
      maxDailyLossPct: 4,
      maxTotalLossPct: 8,
      minTradingDays: 2,
      maxCalendarDays: 14,
      maxInactivityDays: 7,
      allowWeekendHolding: false,
      allowNewsTrading: false,
      allowExpertAdvisors: true,
      allowHedging: false,
      allowCopying: false,
      fundedProfitTargetPct: null,
      fundedMaxDailyLossPct: 4,
      fundedMaxTotalLossPct: 8,
    },
  });

  // ── 5. Challenge Plans & Variants ───────────────────────────────────────
  console.log('  → Challenge plans & variants');
  const planStandard = await prisma.challengePlan.create({
    data: {
      name: 'Standard Challenge',
      slug: 'standard-challenge',
      description: 'Our classic 2-phase evaluation. Prove your skills over 30 calendar days per phase with a 10% profit target.',
      sortOrder: 1,
    },
  });

  const planAggressive = await prisma.challengePlan.create({
    data: {
      name: 'Aggressive Challenge',
      slug: 'aggressive-challenge',
      description: 'Higher risk tolerance with an 8/8 drawdown structure. Perfect for swing traders who need more time.',
      sortOrder: 2,
    },
  });

  const planRapid = await prisma.challengePlan.create({
    data: {
      name: 'Rapid Challenge',
      slug: 'rapid-challenge',
      description: 'Fast-track 1-phase evaluation. Hit a 12% target in 14 days. For experienced, consistent traders.',
      sortOrder: 3,
    },
  });

  const accountSizes = [
    { size: 10000, prices: [99, 89, 129] },
    { size: 25000, prices: [199, 179, 249] },
    { size: 50000, prices: [349, 319, 449] },
    { size: 100000, prices: [549, 499, 699] },
    { size: 200000, prices: [999, 899, 1249] },
  ];

  const plans = [planStandard, planAggressive, planRapid];
  const ruleSets = [ruleSetStandard, ruleSetAggressive, ruleSetRapid];
  const phaseCounts = [2, 2, 1];
  const allVariants: any[] = [];

  for (let pi = 0; pi < plans.length; pi++) {
    for (const as of accountSizes) {
      const v = await prisma.challengeVariant.create({
        data: {
          planId: plans[pi].id,
          ruleSetId: ruleSets[pi].id,
          accountSize: as.size,
          price: as.prices[pi],
          leverage: 100,
          profitSplit: pi === 1 ? 85 : 80,
          phases: phaseCounts[pi],
        },
      });
      allVariants.push(v);
    }
  }

  // ── 6. Users ────────────────────────────────────────────────────────────
  console.log('  → Users');
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@myfundingtrade.com',
      passwordHash: hashPassword('Admin@12345'),
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      lastLoginAt: daysAgo(0),
      lastLoginIp: '192.168.1.1',
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Admin',
          country: 'GB',
          timezone: 'Europe/London',
          referralCode: 'ADMIN001',
        },
      },
    },
  });

  const supportAgent = await prisma.user.create({
    data: {
      email: 'support@myfundingtrade.com',
      passwordHash: hashPassword('Support@12345'),
      role: 'SUPPORT_AGENT',
      status: 'ACTIVE',
      emailVerified: true,
      lastLoginAt: daysAgo(1),
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Support',
          country: 'GB',
          timezone: 'Europe/London',
        },
      },
    },
  });

  const kycReviewer = await prisma.user.create({
    data: {
      email: 'kyc@myfundingtrade.com',
      passwordHash: hashPassword('Kyc@12345'),
      role: 'KYC_REVIEWER',
      status: 'ACTIVE',
      emailVerified: true,
      profile: {
        create: {
          firstName: 'James',
          lastName: 'Reviewer',
          country: 'GB',
          timezone: 'Europe/London',
        },
      },
    },
  });

  const contentAdmin = await prisma.user.create({
    data: {
      email: 'content@myfundingtrade.com',
      passwordHash: hashPassword('Content@12345'),
      role: 'CONTENT_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      profile: {
        create: {
          firstName: 'Emily',
          lastName: 'Content',
          country: 'GB',
        },
      },
    },
  });

  // Demo traders
  const traderData = [
    { email: 'trader1@demo.com', first: 'Alex', last: 'Thompson', country: 'GB', verified: true },
    { email: 'trader2@demo.com', first: 'Maria', last: 'Garcia', country: 'ES', verified: true },
    { email: 'trader3@demo.com', first: 'Yuki', last: 'Tanaka', country: 'JP', verified: true },
    { email: 'trader4@demo.com', first: 'Hans', last: 'Mueller', country: 'DE', verified: false },
    { email: 'trader5@demo.com', first: 'Aisha', last: 'Rahman', country: 'AE', verified: true },
    { email: 'trader6@demo.com', first: 'Lucas', last: 'Pereira', country: 'BR', verified: false },
    { email: 'trader7@demo.com', first: 'Priya', last: 'Sharma', country: 'IN', verified: true },
    { email: 'trader8@demo.com', first: 'Chen', last: 'Wei', country: 'SG', verified: true },
  ];

  const traders: any[] = [];
  for (const td of traderData) {
    const t = await prisma.user.create({
      data: {
        email: td.email,
        passwordHash: hashPassword('Trader@12345'),
        role: 'TRADER',
        status: 'ACTIVE',
        emailVerified: td.verified,
        lastLoginAt: daysAgo(randomBetween(0, 7)),
        lastLoginIp: `10.0.0.${randomBetween(10, 250)}`,
        profile: {
          create: {
            firstName: td.first,
            lastName: td.last,
            country: td.country,
            referralCode: `${td.first.toUpperCase()}${randomBetween(1000, 9999)}`,
          },
        },
      },
    });
    traders.push(t);

    // Consent to legal docs
    for (const ld of createdLegalDocs.slice(0, 3)) {
      await prisma.legalConsent.create({
        data: {
          userId: t.id,
          documentId: ld.id,
          ipAddress: `10.0.0.${randomBetween(10, 250)}`,
          userAgent: 'Mozilla/5.0 (seed)',
        },
      });
    }
  }

  // ── 7. Coupons ──────────────────────────────────────────────────────────
  console.log('  → Coupons');
  const coupon10 = await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      maxUsageCount: 1000,
      validFrom: daysAgo(60),
      validUntil: new Date('2025-12-31'),
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'LAUNCH25',
      type: 'FIXED_AMOUNT',
      value: 25,
      maxUsageCount: 500,
      minOrderAmount: 199,
      validFrom: daysAgo(30),
      validUntil: new Date('2025-06-30'),
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'VIP50',
      type: 'FIXED_AMOUNT',
      value: 50,
      maxUsageCount: 100,
      minOrderAmount: 349,
      validFrom: daysAgo(14),
    },
  });

  // ── 8. Orders, Payments, Trader Accounts ────────────────────────────────
  console.log('  → Orders, payments, trader accounts');
  const activeTraders = traders.slice(0, 5);
  const createdAccounts: any[] = [];

  for (const trader of activeTraders) {
    const variant = randomElement(allVariants);
    const useCoupon = Math.random() > 0.6;
    const subtotal = Number(variant.price);
    const discount = useCoupon ? subtotal * 0.1 : 0;
    const total = subtotal - discount;

    const order = await prisma.order.create({
      data: {
        userId: trader.id,
        variantId: variant.id,
        couponId: useCoupon ? coupon10.id : null,
        orderNumber: generateOrderNumber(),
        status: 'FULFILLED',
        subtotal,
        discountAmount: discount,
        totalAmount: total,
        ipAddress: `10.0.0.${randomBetween(10, 250)}`,
        paidAt: daysAgo(randomBetween(5, 30)),
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: randomElement(['STRIPE', 'CRYPTO'] as const),
        status: 'SUCCEEDED',
        amount: total,
        providerPaymentId: `pi_${crypto.randomBytes(12).toString('hex')}`,
        providerFee: randomDecimal(1, 20),
        paidAt: order.paidAt,
      },
    });

    const accountNumber = generateAccountNumber();
    const accountSize = variant.accountSize;
    const isPhase1Active = Math.random() > 0.3;
    const pl = isPhase1Active ? randomDecimal(-accountSize * 0.03, accountSize * 0.08) : 0;

    const ta = await prisma.traderAccount.create({
      data: {
        userId: trader.id,
        orderId: order.id,
        variantId: variant.id,
        accountNumber,
        platform: 'MT5',
        server: 'MFT-Live01',
        login: `${randomBetween(600000, 699999)}`,
        status: isPhase1Active ? 'ACTIVE' : 'PROVISIONING',
        startingBalance: accountSize,
        currentBalance: accountSize + pl,
        currentEquity: accountSize + pl + randomDecimal(-200, 200),
        highWaterMark: accountSize + Math.max(pl, 0),
        currentPhase: 'PHASE_1',
      },
    });
    createdAccounts.push(ta);

    // Create phase record
    await prisma.traderAccountPhase.create({
      data: {
        traderAccountId: ta.id,
        phase: 'PHASE_1',
        status: isPhase1Active ? 'ACTIVE' : 'PENDING',
        startDate: isPhase1Active ? daysAgo(randomBetween(3, 20)) : null,
        startingBalance: accountSize,
        highWaterMark: accountSize + Math.max(pl, 0),
        totalTrades: isPhase1Active ? randomBetween(10, 80) : 0,
        winningTrades: isPhase1Active ? randomBetween(5, 50) : 0,
        losingTrades: isPhase1Active ? randomBetween(3, 30) : 0,
        tradingDays: isPhase1Active ? randomBetween(1, 15) : 0,
        profitLoss: pl,
      },
    });
  }

  // A funded trader (trader index 0)
  const fundedVariant = allVariants.find((v: any) => v.accountSize === 100000);
  if (fundedVariant && traders[0]) {
    const fundedOrder = await prisma.order.create({
      data: {
        userId: traders[0].id,
        variantId: fundedVariant.id,
        orderNumber: generateOrderNumber(),
        status: 'FULFILLED',
        subtotal: Number(fundedVariant.price),
        discountAmount: 0,
        totalAmount: Number(fundedVariant.price),
        paidAt: daysAgo(60),
      },
    });

    await prisma.payment.create({
      data: {
        orderId: fundedOrder.id,
        provider: 'STRIPE',
        status: 'SUCCEEDED',
        amount: Number(fundedVariant.price),
        providerPaymentId: `pi_${crypto.randomBytes(12).toString('hex')}`,
        paidAt: daysAgo(60),
      },
    });

    const fundedAccount = await prisma.traderAccount.create({
      data: {
        userId: traders[0].id,
        orderId: fundedOrder.id,
        variantId: fundedVariant.id,
        accountNumber: generateAccountNumber(),
        platform: 'MT5',
        server: 'MFT-Live01',
        login: `${randomBetween(700000, 799999)}`,
        status: 'FUNDED',
        startingBalance: 100000,
        currentBalance: 107500,
        currentEquity: 107200,
        highWaterMark: 108000,
        currentPhase: 'FUNDED',
        fundedAt: daysAgo(15),
      },
    });

    // Passed phases
    const p1 = await prisma.traderAccountPhase.create({
      data: {
        traderAccountId: fundedAccount.id,
        phase: 'PHASE_1',
        status: 'PASSED',
        startDate: daysAgo(55),
        endDate: daysAgo(40),
        startingBalance: 100000,
        endingBalance: 110200,
        highWaterMark: 110500,
        totalTrades: 45,
        winningTrades: 28,
        losingTrades: 17,
        tradingDays: 12,
        profitLoss: 10200,
      },
    });

    await prisma.accountEvaluationResult.create({
      data: {
        phaseId: p1.id,
        verdict: 'PASSED',
        profitTargetMet: true,
        dailyLossBreached: false,
        totalLossBreached: false,
        minDaysMet: true,
        evaluatedAt: daysAgo(40),
        reviewedBy: superAdmin.id,
      },
    });

    const p2 = await prisma.traderAccountPhase.create({
      data: {
        traderAccountId: fundedAccount.id,
        phase: 'PHASE_2',
        status: 'PASSED',
        startDate: daysAgo(38),
        endDate: daysAgo(20),
        startingBalance: 100000,
        endingBalance: 105300,
        highWaterMark: 106000,
        totalTrades: 32,
        winningTrades: 20,
        losingTrades: 12,
        tradingDays: 10,
        profitLoss: 5300,
      },
    });

    await prisma.accountEvaluationResult.create({
      data: {
        phaseId: p2.id,
        verdict: 'PASSED',
        profitTargetMet: true,
        dailyLossBreached: false,
        totalLossBreached: false,
        minDaysMet: true,
        evaluatedAt: daysAgo(20),
        reviewedBy: superAdmin.id,
      },
    });

    // Funded phase
    await prisma.traderAccountPhase.create({
      data: {
        traderAccountId: fundedAccount.id,
        phase: 'FUNDED',
        status: 'ACTIVE',
        startDate: daysAgo(15),
        startingBalance: 100000,
        highWaterMark: 108000,
        totalTrades: 22,
        winningTrades: 14,
        losingTrades: 8,
        tradingDays: 10,
        profitLoss: 7500,
      },
    });

    // Payout method & request
    const payoutMethod = await prisma.payoutMethod.create({
      data: {
        userId: traders[0].id,
        type: 'BANK_WIRE',
        label: 'HSBC Main Account',
        details: { bankName: 'HSBC', accountNumber: '****4321', sortCode: '40-11-22', currency: 'GBP' },
        isDefault: true,
        isVerified: true,
      },
    });

    await prisma.payoutRequest.create({
      data: {
        userId: traders[0].id,
        traderAccountId: fundedAccount.id,
        payoutMethodId: payoutMethod.id,
        requestNumber: generatePayoutNumber(),
        amount: 7500,
        profitSplit: 80,
        traderShare: 6000,
        companyShare: 1500,
        status: 'PENDING_APPROVAL',
      },
    });
  }

  // ── 9. KYC Submissions ─────────────────────────────────────────────────
  console.log('  → KYC submissions');
  // Approved KYC for trader 0
  const kyc1 = await prisma.kycSubmission.create({
    data: {
      userId: traders[0].id,
      status: 'APPROVED',
      documentType: 'PASSPORT',
      documentFrontUrl: '/uploads/kyc/passport-front-demo.jpg',
      selfieUrl: '/uploads/kyc/selfie-demo.jpg',
      proofOfAddressUrl: '/uploads/kyc/poa-demo.pdf',
      fullName: 'Alex Thompson',
      dateOfBirth: new Date('1990-05-15'),
      nationality: 'GB',
      submittedAt: daysAgo(25),
      ipAddress: '10.0.0.10',
    },
  });

  await prisma.kycReview.create({
    data: {
      submissionId: kyc1.id,
      reviewerId: kycReviewer.id,
      decision: 'APPROVED',
      reason: 'Documents verified. All clear.',
    },
  });

  // Pending KYC for trader 3
  await prisma.kycSubmission.create({
    data: {
      userId: traders[3].id,
      status: 'UNDER_REVIEW',
      documentType: 'GOVERNMENT_ID',
      documentFrontUrl: '/uploads/kyc/id-front-demo.jpg',
      documentBackUrl: '/uploads/kyc/id-back-demo.jpg',
      selfieUrl: '/uploads/kyc/selfie-demo2.jpg',
      fullName: 'Hans Mueller',
      dateOfBirth: new Date('1988-11-03'),
      nationality: 'DE',
      submittedAt: daysAgo(2),
      ipAddress: '10.0.0.40',
    },
  });

  // ── 10. Affiliate System ────────────────────────────────────────────────
  console.log('  → Affiliates');
  const affiliateUser = await prisma.user.create({
    data: {
      email: 'affiliate@demo.com',
      passwordHash: hashPassword('Affiliate@12345'),
      role: 'AFFILIATE',
      status: 'ACTIVE',
      emailVerified: true,
      profile: {
        create: {
          firstName: 'Jake',
          lastName: 'Affiliate',
          country: 'AU',
          referralCode: 'JAKE5000',
        },
      },
    },
  });

  const affiliateAccount = await prisma.affiliateAccount.create({
    data: {
      userId: affiliateUser.id,
      affiliateCode: 'JAKE2024',
      status: 'ACTIVE',
      commissionRate: 12,
      tier: 2,
      totalEarnings: 2450,
      totalPaid: 1800,
      pendingBalance: 650,
      approvedAt: daysAgo(90),
    },
  });

  // Some affiliate clicks
  for (let i = 0; i < 15; i++) {
    await prisma.affiliateClick.create({
      data: {
        affiliateId: affiliateAccount.id,
        ipAddress: `${randomBetween(1, 255)}.${randomBetween(0, 255)}.${randomBetween(0, 255)}.${randomBetween(1, 255)}`,
        referrerUrl: randomElement(['https://youtube.com/watch?v=abc', 'https://twitter.com/jake', 'https://blog.jake.com']),
        landingUrl: 'https://myfundingtrade.com/?ref=JAKE2024',
        utmSource: randomElement(['youtube', 'twitter', 'blog']),
        utmMedium: randomElement(['social', 'cpc', 'organic']),
        utmCampaign: 'summer2024',
        createdAt: daysAgo(randomBetween(0, 30)),
      },
    });
  }

  // ── 11. Support Tickets ─────────────────────────────────────────────────
  console.log('  → Support tickets');
  const ticket1 = await prisma.supportTicket.create({
    data: {
      userId: traders[1].id,
      assigneeId: supportAgent.id,
      ticketNumber: generateTicketNumber(),
      subject: 'Cannot access my trading account',
      category: 'ACCOUNT',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
    },
  });

  await prisma.supportMessage.create({
    data: {
      ticketId: ticket1.id,
      senderId: traders[1].id,
      body: 'I purchased a $50K Standard Challenge two days ago but my MT5 account shows "Provisioning" status. Can you please check?',
    },
  });

  await prisma.supportMessage.create({
    data: {
      ticketId: ticket1.id,
      senderId: supportAgent.id,
      body: 'Hi Maria, I can see your account MFT654321 is being provisioned. Let me escalate to our trading desk. You should have access within 2 hours.',
    },
  });

  const ticket2 = await prisma.supportTicket.create({
    data: {
      userId: traders[4].id,
      ticketNumber: generateTicketNumber(),
      subject: 'Payout processing time question',
      category: 'PAYOUT',
      priority: 'LOW',
      status: 'RESOLVED',
      closedAt: daysAgo(3),
    },
  });

  await prisma.supportMessage.create({
    data: {
      ticketId: ticket2.id,
      senderId: traders[4].id,
      body: 'How long does it typically take to process a bank wire payout?',
    },
  });

  await prisma.supportMessage.create({
    data: {
      ticketId: ticket2.id,
      senderId: supportAgent.id,
      body: 'Bank wire payouts typically take 3-5 business days after approval. Crypto payouts are usually processed within 24 hours.',
    },
  });

  // ── 12. Blog Content ────────────────────────────────────────────────────
  console.log('  → Blog content');
  const blogCat1 = await prisma.blogCategory.create({ data: { name: 'Trading Education', slug: 'trading-education', sortOrder: 1 } });
  const blogCat2 = await prisma.blogCategory.create({ data: { name: 'Platform Updates', slug: 'platform-updates', sortOrder: 2 } });
  const blogCat3 = await prisma.blogCategory.create({ data: { name: 'Success Stories', slug: 'success-stories', sortOrder: 3 } });

  await prisma.blogPost.create({
    data: {
      authorId: contentAdmin.id,
      categoryId: blogCat1.id,
      title: '5 Risk Management Rules Every Prop Trader Must Follow',
      slug: '5-risk-management-rules-prop-trader',
      excerpt: 'Learn the essential risk management principles that separate funded traders from failed evaluations.',
      content: 'Risk management is the cornerstone of successful prop trading. Here are five rules that will keep you in the game...\n\n## 1. Never Risk More Than 1% Per Trade\n...\n## 2. Use Stop Losses on Every Position\n...',
      status: 'PUBLISHED',
      publishedAt: daysAgo(14),
      seoTitle: '5 Risk Management Rules for Prop Traders | MyFundingTrade',
      seoDescription: 'Master these 5 risk management rules to pass your prop trading evaluation and get funded.',
    },
  });

  await prisma.blogPost.create({
    data: {
      authorId: contentAdmin.id,
      categoryId: blogCat2.id,
      title: 'Introducing the Rapid Challenge — Get Funded in 14 Days',
      slug: 'introducing-rapid-challenge',
      excerpt: 'Our new 1-phase evaluation lets experienced traders get funded faster than ever.',
      content: 'We are excited to announce the Rapid Challenge — a streamlined evaluation process designed for experienced traders...',
      status: 'PUBLISHED',
      publishedAt: daysAgo(7),
    },
  });

  await prisma.blogPost.create({
    data: {
      authorId: contentAdmin.id,
      categoryId: blogCat3.id,
      title: 'How Alex Turned a $100K Challenge into a Funded Career',
      slug: 'alex-100k-funded-success-story',
      excerpt: 'Read how Alex passed both phases and earned his first payout within 45 days.',
      content: 'Placeholder success story content...',
      status: 'DRAFT',
    },
  });

  // ── 13. FAQ Items ───────────────────────────────────────────────────────
  console.log('  → FAQ items');
  const faqs = [
    { question: 'What is a prop trading challenge?', answer: 'A prop trading challenge is an evaluation process where traders demonstrate their skills on a simulated account. Once you pass, you get access to a funded account and keep up to 80% of the profits.', category: 'General', sortOrder: 1 },
    { question: 'How much does it cost to start?', answer: 'Our challenges start from $99 for a $10,000 account. We offer account sizes up to $200,000. Use code WELCOME10 for 10% off your first purchase.', category: 'General', sortOrder: 2 },
    { question: 'What are the evaluation rules?', answer: 'Each plan has specific rules including profit targets, maximum daily/total loss limits, and minimum trading days. Check our challenge comparison page for full details.', category: 'Evaluation', sortOrder: 3 },
    { question: 'How do payouts work?', answer: 'Once funded, you can request a payout every 14 days. We support bank wire, crypto, PayPal, and Wise. Payouts are processed within 1-5 business days after approval.', category: 'Payouts', sortOrder: 4 },
    { question: 'Can I use Expert Advisors (EAs)?', answer: 'Yes, EAs are allowed on Standard and Aggressive challenges. However, copy trading is only allowed on the Aggressive plan. The Rapid Challenge does not allow EAs or hedging.', category: 'Trading Rules', sortOrder: 5 },
    { question: 'What trading platforms do you support?', answer: 'We currently support MetaTrader 5 (MT5). We are working on adding cTrader and TradingView integration.', category: 'Platform', sortOrder: 6 },
    { question: 'Is KYC required?', answer: 'KYC verification is required before you can receive a funded account. You will need to submit a government-issued ID and proof of address.', category: 'Compliance', sortOrder: 7 },
  ];
  for (const faq of faqs) {
    await prisma.fAQItem.create({ data: faq });
  }

  // ── 14. Newsletter Subscribers ──────────────────────────────────────────
  console.log('  → Newsletter subscribers');
  const newsletterEmails = [
    'subscriber1@example.com', 'subscriber2@example.com', 'subscriber3@example.com',
    'subscriber4@example.com', 'subscriber5@example.com',
  ];
  for (const email of newsletterEmails) {
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        isConfirmed: Math.random() > 0.3,
        confirmedAt: Math.random() > 0.3 ? daysAgo(randomBetween(5, 30)) : null,
        source: randomElement(['homepage', 'blog', 'footer']),
        ipAddress: `10.0.${randomBetween(0, 255)}.${randomBetween(1, 255)}`,
      },
    });
  }

  // ── 15. Notifications ───────────────────────────────────────────────────
  console.log('  → Notifications');
  await prisma.notification.create({
    data: {
      userId: traders[0].id,
      type: 'IN_APP',
      status: 'DELIVERED',
      channel: 'in-app',
      title: 'Congratulations! You are now funded!',
      body: 'Your $100K Standard Challenge evaluation is complete. Your funded account is ready.',
      sentAt: daysAgo(15),
      readAt: daysAgo(15),
    },
  });

  await prisma.notification.create({
    data: {
      userId: traders[0].id,
      type: 'EMAIL',
      status: 'SENT',
      channel: 'email',
      title: 'Payout Request Received',
      body: 'Your payout request for $6,000.00 has been submitted and is pending approval.',
      sentAt: daysAgo(1),
    },
  });

  for (const trader of traders.slice(0, 4)) {
    await prisma.notification.create({
      data: {
        userId: trader.id,
        type: 'IN_APP',
        status: 'QUEUED',
        channel: 'in-app',
        title: 'New Rapid Challenge Available!',
        body: 'Get funded in just 14 days with our new 1-phase Rapid Challenge. Use code LAUNCH25 for $25 off!',
      },
    });
  }

  // ── 16. Admin Action Logs ───────────────────────────────────────────────
  console.log('  → Admin action logs');
  await prisma.adminActionLog.create({
    data: {
      performerId: superAdmin.id,
      action: 'CREATE',
      resource: 'ChallengePlan',
      ipAddress: '192.168.1.1',
      metadata: { plans: ['Standard Challenge', 'Aggressive Challenge', 'Rapid Challenge'] },
    },
  });

  await prisma.adminActionLog.create({
    data: {
      performerId: kycReviewer.id,
      targetUserId: traders[0].id,
      action: 'APPROVE',
      resource: 'KycSubmission',
      resourceId: kyc1.id,
      ipAddress: '192.168.1.2',
      metadata: { reason: 'Documents verified' },
    },
  });

  await prisma.adminActionLog.create({
    data: {
      performerId: superAdmin.id,
      action: 'SETTINGS_CHANGE',
      resource: 'SystemSetting',
      ipAddress: '192.168.1.1',
      before: { key: 'platform.min_payout', value: '100' },
      after: { key: 'platform.min_payout', value: '50' },
    },
  });

  // ── 17. Platform Restrictions ───────────────────────────────────────────
  console.log('  → Platform restrictions');
  const restrictions = [
    { key: 'registration.enabled', isEnabled: true, description: 'Allow new user registrations' },
    { key: 'trading.weekend_trading', isEnabled: false, description: 'Allow weekend trading globally' },
    { key: 'payout.crypto_enabled', isEnabled: true, description: 'Allow cryptocurrency payouts' },
    { key: 'affiliate.registration_open', isEnabled: true, description: 'Allow new affiliate signups' },
    { key: 'maintenance_mode', isEnabled: false, description: 'Enable maintenance mode (blocks all user actions)' },
  ];
  for (const r of restrictions) {
    await prisma.platformRestriction.upsert({
      where: { key: r.key },
      update: r,
      create: r,
    });
  }

  // ── Done ────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n');
  console.log('  Demo credentials (password: respective role + @12345):');
  console.log('    Admin:    admin@myfundingtrade.com');
  console.log('    Support:  support@myfundingtrade.com');
  console.log('    KYC:      kyc@myfundingtrade.com');
  console.log('    Content:  content@myfundingtrade.com');
  console.log('    Traders:  trader1@demo.com through trader8@demo.com');
  console.log('    Affiliate: affiliate@demo.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
