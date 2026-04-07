// ── @myfundingtrade/business-rules ───────────────────────────────────────
// Pure, framework-agnostic domain logic for MyFundingTrade platform.

// Core helpers
export { allow, deny, type RuleResult } from './result';

// Constants & state machines
export * from './constants';

// Domain modules
export * from './purchase';
export * from './evaluation';
export * from './lifecycle';
export * from './kyc';
export * from './payout';
export * from './affiliate';
export * from './restrictions';
export * from './compliance';
export * from './support';
export * from './audit';
