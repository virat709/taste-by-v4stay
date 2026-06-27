export function getEffectivePlan(restaurant) {
  if (!restaurant) return 'free';
  if (restaurant.plan === 'paid') return 'paid';
  if (restaurant.plan === 'trial') {
    const now = Date.now();
    const endsAt = restaurant.trialEndsAt?.toDate?.()?.getTime();
    if (endsAt && now > endsAt) return 'free';
    return 'trial';
  }
  return 'free';
}

export function getTrialDaysRemaining(restaurant) {
  if (!restaurant?.trialEndsAt) return 0;
  const endsAt = restaurant.trialEndsAt.toDate?.();
  if (!endsAt) return 0;
  const remaining = Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, remaining);
}

export function canPlaceOrders(restaurant) {
  const plan = getEffectivePlan(restaurant);
  return plan === 'paid' || plan === 'trial';
}

export function canViewAnalytics(restaurant) {
  const plan = getEffectivePlan(restaurant);
  return plan === 'paid' || plan === 'trial';
}

export const PLAN_LABELS = {
  trial: { label: 'Free Trial', color: '#1e90ff' },
  paid: { label: 'Premium', color: '#2ed573' },
  free: { label: 'Free', color: '#a4b0be' },
};

export const PROVIDER_UPI_ID = '9714056759@ybl';
export const PROVIDER_PHONE = '+91 9714056759';
export const PREMIUM_PRICE = 9999;
export const PREMIUM_PRICE_LABEL = '₹9,999/year';

export const PLAN_FEATURES = {
  trial: ['Digital Menu', 'QR Codes', 'Guest Ordering', 'Analytics', 'Feedback', 'Staff Dashboard', 'Kitchen Display'],
  paid: ['Digital Menu', 'QR Codes', 'Guest Ordering', 'Analytics', 'Feedback', 'Staff Dashboard', 'Kitchen Display'],
  free: ['Digital Menu', 'QR Codes', 'Menu Viewing Only'],
};