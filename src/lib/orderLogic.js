// ─── Order flow logic (pure functions shared by staff portal / kitchen) ──────
// Extracted verbatim from StaffDashboard so the claim & status logic is
// unit-testable. No state, no Firestore calls.

const todayKey = () => new Date().toISOString().slice(0, 10);

export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m ${String(s % 60).padStart(2, '0')}s`;
}

export { todayKey };

// ─── Status machine (single source of truth for both portals) ────────────────
export const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#ff9f43', next: 'preparing', nextLabel: 'Start' },
  confirmed: { label: 'Confirmed', color: '#3b82f6', next: 'preparing', nextLabel: 'Start' },
  preparing: { label: 'Preparing', color: '#1e90ff', next: 'ready', nextLabel: 'Ready' },
  ready: { label: 'Ready', color: '#2ed573', next: 'completed', nextLabel: 'Serve' },
  completed: { label: 'Done', color: '#a4b0be', next: null },
  delivered: { label: 'Delivered', color: '#10b981', next: null },
  cancelled: { label: 'Cancelled', color: '#ff4757', next: null },
};

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
}

// ─── Order classification ────────────────────────────────────────────────────
export function isOrderUnclaimed(order) {
  return order.status === 'pending' && !order.pickedBy;
}

export function isOrderClaimedByOther(order, staffId) {
  return order.status === 'pending' && order.pickedBy && order.pickedBy.id !== staffId;
}

export function unclaimedCount(orders) {
  return orders.filter(isOrderUnclaimed).length;
}

export function countPickedToday(orders, staffId, dateKey = todayKey()) {
  return orders.filter(o =>
    o.pickedBy?.id === staffId && o.pickedAt?.toDate?.()?.toISOString().slice(0, 10) === dateKey
  ).length;
}

// ─── Staff feed filter: today's orders only, hotel orders excluded ──────────
// Hotel (V4Stay) room orders are delivered by hotel staff — NOT claimable by
// waiters. Orders still committing their serverTimestamp (createdAt null on
// the local optimistic snapshot) are ignored until the timestamp resolves.
export function filterStaffTodayOrders(orders, now = new Date()) {
  const today = now.toDateString();
  return orders
    .filter(o => o.source !== 'hotel')
    .filter(o => {
      const d = o.createdAt?.toDate?.();
      return d && d.toDateString() === today;
    });
}

// ─── Kitchen display filter ──────────────────────────────────────────────────
export function activeKitchenOrders(orders) {
  return orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status));
}

// ─── Claim race resolution (transaction result) ─────────────────────────────
// The transaction callback evaluates the live order doc and decides whether
// the claim succeeds. Pure to make the "first waiter to tap wins" rule
// directly testable.
export function resolveClaim(orderData, staffId) {
  if (!orderData) return 'aborted';          // order deleted mid-claim
  if (orderData.status && orderData.status !== 'pending') return 'aborted';
  if (orderData.pickedBy && orderData.pickedBy.id) return orderData.pickedBy.id === staffId ? 'mine' : 'lost';
  return 'win';
}
