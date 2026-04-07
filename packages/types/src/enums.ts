export type UserRole = 'trader' | 'admin' | 'super_admin';

export type AccountStatus = 'active' | 'inactive' | 'suspended' | 'banned';

export type ChallengePhase = 'phase_1' | 'phase_2' | 'funded';

export type ChallengeStatus =
  | 'pending'
  | 'active'
  | 'passed'
  | 'failed'
  | 'expired';

export type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export type OrderSide = 'buy' | 'sell';

export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
