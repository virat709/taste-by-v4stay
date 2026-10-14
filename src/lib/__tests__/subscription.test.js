import { describe, it, expect } from 'vitest';
import {
  getEffectivePlan,
  getTrialDaysRemaining,
  canPlaceOrders,
  canViewAnalytics,
  PLAN_LABELS,
  PREMIUM_PRICE
} from '../subscription';

describe('Subscription Library', () => {
  it('returns free plan for null or empty restaurant object', () => {
    expect(getEffectivePlan(null)).toBe('free');
    expect(getEffectivePlan({})).toBe('free');
  });

  it('returns paid plan when restaurant.plan is paid', () => {
    const restaurant = { plan: 'paid' };
    expect(getEffectivePlan(restaurant)).toBe('paid');
    expect(canPlaceOrders(restaurant)).toBe(true);
    expect(canViewAnalytics(restaurant)).toBe(true);
  });

  it('returns trial plan when trial has not expired', () => {
    const futureDate = new Date(Date.now() + 86400000 * 5); // 5 days from now
    const restaurant = {
      plan: 'trial',
      trialEndsAt: { toDate: () => futureDate }
    };
    expect(getEffectivePlan(restaurant)).toBe('trial');
    expect(canPlaceOrders(restaurant)).toBe(true);
    expect(canViewAnalytics(restaurant)).toBe(true);
    expect(getTrialDaysRemaining(restaurant)).toBe(5);
  });

  it('returns free plan when trial has expired', () => {
    const pastDate = new Date(Date.now() - 86400000); // 1 day ago
    const restaurant = {
      plan: 'trial',
      trialEndsAt: { toDate: () => pastDate }
    };
    expect(getEffectivePlan(restaurant)).toBe('free');
    expect(canPlaceOrders(restaurant)).toBe(false);
    expect(canViewAnalytics(restaurant)).toBe(false);
    expect(getTrialDaysRemaining(restaurant)).toBe(0);
  });

  it('has valid constants and plan labels', () => {
    expect(PREMIUM_PRICE).toBe(14999);
    expect(PLAN_LABELS.paid.label).toBe('Premium');
    expect(PLAN_LABELS.free.label).toBe('Free');
  });
});
